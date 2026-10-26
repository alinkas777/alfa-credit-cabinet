import { describe, it, expect } from 'vitest';
import { calculateScoring, makeCreditDecision } from './scoring';
import { Company, CreditApplication, CreditProduct } from './types';

describe('Scoring Service', () => {
  const mockProduct: CreditProduct = {
    id: 'prod-1',
    name: 'Test Product',
    description: 'Test',
    minAmount: 100000,
    maxAmount: 10000000,
    minTerm: 6,
    maxTerm: 60,
    rateFrom: 15,
    rateTo: 25,
    icon: 'test',
    category: 'investment',
    requirements: [],
  };

  const createMockCompany = (overrides: Partial<Company> = {}): Company => ({
    id: 'company-1',
    name: 'Test Company',
    inn: '1234567890',
    ogrn: '1234567890123',
    okved: '62.01',
    registrationDate: '2020-01-01',
    address: 'Test Address',
    director: 'Test Director',
    type: 'ooo',
    revenue: 10000000,
    profit: 1000000,
    employees: 10,
    existingLoans: [],
    creditHistory: [],
    ...overrides,
  });

  const createMockApplication = (overrides: Partial<CreditApplication> = {}): CreditApplication => ({
    id: 'app-1',
    companyId: 'company-1',
    productId: 'prod-1',
    requestedAmount: 1000000,
    requestedTerm: 12,
    purpose: 'Test purpose',
    status: 'scoring',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    statusHistory: [],
    ...overrides,
  });

  describe('calculateScoring', () => {
    it('should return high score for stable profitable company', () => {
      const company = createMockCompany({
        registrationDate: '2018-01-01', // 8 years
        revenue: 50000000,
        profit: 10000000, // 20% profitability
        existingLoans: [],
        creditHistory: [
          {
            id: 'ch-1',
            bank: 'Test Bank',
            amount: 1000000,
            startDate: '2022-01-01',
            endDate: '2023-01-01',
            overdueDays: 0,
            status: 'paid',
          },
        ],
      });

      const application = createMockApplication({
        requestedAmount: 5000000, // 10% of revenue
      });

      const result = calculateScoring(company, application, mockProduct);

      expect(result.totalScore).toBeGreaterThanOrEqual(70);
      expect(result.riskLevel).toBe('low');
      expect(result.recommendation).toBe('approve');
    });

    it('should return low score for risky company', () => {
      const company = createMockCompany({
        registrationDate: '2025-01-01', // 1 year
        revenue: 2000000,
        profit: -500000, // Negative profitability
        existingLoans: [
          {
            id: 'loan-1',
            bank: 'Test Bank',
            amount: 1000000,
            remainingAmount: 800000,
            monthlyPayment: 100000,
            status: 'active',
          },
        ],
        creditHistory: [
          {
            id: 'ch-1',
            bank: 'Test Bank',
            amount: 500000,
            startDate: '2023-01-01',
            endDate: '2023-12-01',
            overdueDays: 45,
            status: 'paid',
          },
        ],
      });

      const application = createMockApplication({
        requestedAmount: 3000000, // 150% of revenue
      });

      const result = calculateScoring(company, application, mockProduct);

      expect(result.totalScore).toBeLessThan(50);
      expect(['high', 'very_high']).toContain(result.riskLevel);
      expect(['additional_info', 'reject']).toContain(result.recommendation);
    });

    it('should penalize high debt ratio', () => {
      const company = createMockCompany({
        revenue: 5000000,
        existingLoans: [
          {
            id: 'loan-1',
            bank: 'Bank 1',
            amount: 2000000,
            remainingAmount: 1500000,
            monthlyPayment: 200000, // 48% of monthly revenue
            status: 'active',
          },
        ],
        creditHistory: [],
      });

      const application = createMockApplication();
      const result = calculateScoring(company, application, mockProduct);

      const debtFactor = result.factors.find(f => f.name === 'Долговая нагрузка');
      expect(debtFactor).toBeDefined();
      expect(debtFactor!.impact).toBeLessThan(0);
    });

    it('should reward good credit history', () => {
      const company = createMockCompany({
        creditHistory: [
          {
            id: 'ch-1',
            bank: 'Bank 1',
            amount: 1000000,
            startDate: '2022-01-01',
            endDate: '2023-01-01',
            overdueDays: 0,
            status: 'paid',
          },
          {
            id: 'ch-2',
            bank: 'Bank 2',
            amount: 500000,
            startDate: '2023-01-01',
            endDate: '2024-01-01',
            overdueDays: 0,
            status: 'paid',
          },
        ],
      });

      const application = createMockApplication();
      const result = calculateScoring(company, application, mockProduct);

      const historyFactor = result.factors.find(f => f.name === 'Кредитная история');
      expect(historyFactor).toBeDefined();
      expect(historyFactor!.impact).toBeGreaterThan(0);
    });

    it('should clamp score between 0 and 100', () => {
      const veryRiskyCompany = createMockCompany({
        registrationDate: '2025-11-01', // Very young
        revenue: 1000000,
        profit: -1000000,
        existingLoans: [
          {
            id: 'loan-1',
            bank: 'Bank',
            amount: 5000000,
            remainingAmount: 4000000,
            monthlyPayment: 500000,
            status: 'active',
          },
        ],
        creditHistory: [
          {
            id: 'ch-1',
            bank: 'Bank',
            amount: 1000000,
            startDate: '2023-01-01',
            endDate: '2024-01-01',
            overdueDays: 90,
            status: 'paid',
          },
        ],
      });

      const application = createMockApplication({
        requestedAmount: 10000000, // 1000% of revenue
      });

      const result = calculateScoring(veryRiskyCompany, application, mockProduct);

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });
  });

  describe('makeCreditDecision', () => {
    it('should approve high-score applications', () => {
      const scoring = {
        totalScore: 85,
        riskLevel: 'low' as const,
        factors: [],
        recommendation: 'approve' as const,
      };

      const application = createMockApplication();
      const decision = makeCreditDecision(scoring, application, mockProduct, createMockCompany());

      expect(decision.type).toBe('approved');
      expect(decision.approvedAmount).toBe(application.requestedAmount);
      expect(decision.approvedTerm).toBe(application.requestedTerm);
    });

    it('should approve with changes for medium-score applications', () => {
      const scoring = {
        totalScore: 60,
        riskLevel: 'medium' as const,
        factors: [],
        recommendation: 'approve_with_changes' as const,
      };

      const application = createMockApplication({
        requestedAmount: 5000000,
      });

      const decision = makeCreditDecision(scoring, application, mockProduct, createMockCompany());

      expect(decision.type).toBe('approved_with_changes');
      expect(decision.approvedAmount).toBeLessThan(application.requestedAmount);
    });

    it('should reject low-score applications', () => {
      const scoring = {
        totalScore: 25,
        riskLevel: 'very_high' as const,
        factors: [],
        recommendation: 'reject' as const,
      };

      const application = createMockApplication();
      const decision = makeCreditDecision(scoring, application, mockProduct, createMockCompany());

      expect(decision.type).toBe('rejected');
      expect(decision.comment).toContain('отказе');
    });

    it('should request additional info for borderline cases', () => {
      const scoring = {
        totalScore: 40,
        riskLevel: 'high' as const,
        factors: [],
        recommendation: 'additional_info' as const,
      };

      const application = createMockApplication();
      const decision = makeCreditDecision(scoring, application, mockProduct, createMockCompany());

      expect(decision.type).toBe('additional_info');
    });
  });
});
