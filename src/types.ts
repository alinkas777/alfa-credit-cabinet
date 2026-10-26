// === Кредитные продукты ===
export interface CreditProduct {
  id: string;
  name: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  minTerm: number; // месяцев
  maxTerm: number;
  rateFrom: number; // % годовых
  rateTo: number;
  icon: string;
  category: 'working_capital' | 'investment' | 'overdraft' | 'refinancing';
  requirements: string[];
}

// === Компания / Клиент ===
export interface Company {
  id: string;
  name: string;
  inn: string;
  ogrn: string;
  okved: string;
  registrationDate: string;
  address: string;
  director: string;
  type: 'ooo' | 'ip';
  revenue: number; // годовая выручка
  profit: number; // годовая прибыль
  employees: number;
  existingLoans: ExistingLoan[];
  creditHistory: CreditHistoryEntry[];
}

export interface ExistingLoan {
  id: string;
  bank: string;
  amount: number;
  remainingAmount: number;
  monthlyPayment: number;
  status: 'active' | 'closed' | 'overdue';
}

export interface CreditHistoryEntry {
  id: string;
  bank: string;
  amount: number;
  startDate: string;
  endDate: string;
  overdueDays: number;
  status: 'paid' | 'active' | 'overdue' | 'closed';
}

// === Заявка ===
export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'data_validation'
  | 'data_enrichment'
  | 'scoring'
  | 'review'
  | 'approved'
  | 'approved_with_changes'
  | 'additional_info_requested'
  | 'rejected'
  | 'documents_pending'
  | 'completed';

export interface CreditApplication {
  id: string;
  companyId: string;
  productId: string;
  requestedAmount: number;
  requestedTerm: number; // месяцев
  purpose: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  // Данные скоринга
  scoringResult?: ScoringResult;
  // Решение
  decision?: CreditDecision;
  // История статусов
  statusHistory: StatusChange[];
  // Запросы доп. информации
  additionalInfoRequests?: AdditionalInfoRequest[];
}

export interface ScoringResult {
  totalScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  factors: ScoringFactor[];
  recommendation: 'approve' | 'approve_with_changes' | 'additional_info' | 'reject';
}

export interface ScoringFactor {
  name: string;
  value: string;
  impact: number; // -10 до +10
  description: string;
}

export interface CreditDecision {
  type: 'approved' | 'approved_with_changes' | 'additional_info' | 'rejected';
  approvedAmount?: number;
  approvedTerm?: number;
  approvedRate?: number;
  comment: string;
  decidedBy: string;
  decidedAt: string;
}

export interface StatusChange {
  from: ApplicationStatus;
  to: ApplicationStatus;
  timestamp: string;
  comment: string;
  actor: 'system' | 'client' | 'analyst' | 'manager';
}

export interface AdditionalInfoRequest {
  id: string;
  field: string;
  description: string;
  requestedAt: string;
  respondedAt?: string;
  response?: string;
}

// === Внешние данные (моки) ===
export interface EgrulData {
  status: 'active' | 'liquidated' | 'reorganizing';
  registrationDate: string;
  director: string;
  founders: string[];
  okved: string;
  address: string;
  authorizedCapital: number;
}

export interface BkiData {
  creditScore: number;
  totalActiveLoans: number;
  totalDebt: number;
  overdueCount: number;
  lastOverdueDate?: string;
  paymentDiscipline: 'excellent' | 'good' | 'satisfactory' | 'poor';
}

// === Новости ===
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: 'product' | 'rate' | 'program' | 'news';
  relevantFor: string[]; // категории бизнесов
}

// === View mode ===
export type ViewMode = 'client' | 'bank';
