import { Company } from '../types';

// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface EgrulResponse {
  status: 'active' | 'liquidated' | 'reorganizing';
  registrationDate: string;
  director: string;
  founders: string[];
  okved: string;
  address: string;
  authorizedCapital: number;
}

export interface BkiResponse {
  creditScore: number;
  totalActiveLoans: number;
  totalDebt: number;
  overdueCount: number;
  lastOverdueDate?: string;
  paymentDiscipline: 'excellent' | 'good' | 'satisfactory' | 'poor';
}

export interface FnsResponse {
  revenue: number;
  profit: number;
  employees: number;
  taxRegime: string;
  lastReportDate: string;
}

export const ExternalApiService = {
  async fetchEgrulData(company: Company): Promise<EgrulResponse> {
    await delay(800 + Math.random() * 700); // 800-1500ms
    
    return {
      status: 'active',
      registrationDate: company.registrationDate,
      director: company.director,
      founders: [company.director],
      okved: company.okved,
      address: company.address,
      authorizedCapital: company.type === 'ooo' ? 10000 : 0,
    };
  },

  async fetchBkiData(company: Company): Promise<BkiResponse> {
    await delay(1000 + Math.random() * 1000); // 1000-2000ms
    
    const activeLoans = company.existingLoans.filter(l => l.status === 'active');
    const overdueEntries = company.creditHistory.filter(ch => ch.overdueDays > 0);
    const maxOverdue = Math.max(0, ...overdueEntries.map(ch => ch.overdueDays));
    
    let paymentDiscipline: BkiResponse['paymentDiscipline'];
    let creditScore: number;
    
    if (maxOverdue === 0) {
      paymentDiscipline = 'excellent';
      creditScore = 750 + Math.floor(Math.random() * 100);
    } else if (maxOverdue <= 7) {
      paymentDiscipline = 'good';
      creditScore = 650 + Math.floor(Math.random() * 80);
    } else if (maxOverdue <= 30) {
      paymentDiscipline = 'satisfactory';
      creditScore = 550 + Math.floor(Math.random() * 80);
    } else {
      paymentDiscipline = 'poor';
      creditScore = 300 + Math.floor(Math.random() * 200);
    }

    return {
      creditScore,
      totalActiveLoans: activeLoans.length,
      totalDebt: activeLoans.reduce((sum, l) => sum + l.remainingAmount, 0),
      overdueCount: overdueEntries.length,
      lastOverdueDate: overdueEntries.length > 0 ? '2024-03-15' : undefined,
      paymentDiscipline,
    };
  },

  async fetchFnsData(company: Company): Promise<FnsResponse> {
    await delay(600 + Math.random() * 600); // 600-1200ms
    
    return {
      revenue: company.revenue,
      profit: company.profit,
      employees: company.employees,
      taxRegime: company.revenue > 50000000 ? 'ОСН' : 'УСН',
      lastReportDate: '2026-03-31',
    };
  },

  async fetchAllExternalData(company: Company) {
    // Параллельная загрузка всех данных
    const [egrul, bki, fns] = await Promise.all([
      this.fetchEgrulData(company),
      this.fetchBkiData(company),
      this.fetchFnsData(company),
    ]);

    return { egrul, bki, fns };
  }
};
