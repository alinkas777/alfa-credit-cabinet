import { CreditApplication, Company, ScoringResult } from '../types';

export interface RiskAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  title: string;
  description: string;
  recommendation: string;
  applicationId: string;
}

export interface AIAnalysis {
  riskAlerts: RiskAlert[];
  overallRiskScore: number;
  recommendations: string[];
  suspiciousPatterns: string[];
}

export const AIAnalyticsService = {
  analyzeApplication(application: CreditApplication, company: Company): AIAnalysis {
    const riskAlerts: RiskAlert[] = [];
    const suspiciousPatterns: string[] = [];
    const recommendations: string[] = [];

    // 1. Анализ долговой нагрузки
    const monthlyRevenue = company.revenue / 12;
    const totalMonthlyPayments = company.existingLoans
      .filter(l => l.status === 'active')
      .reduce((sum, l) => sum + l.monthlyPayment, 0);
    const debtRatio = totalMonthlyPayments / monthlyRevenue;

    if (debtRatio > 0.5) {
      riskAlerts.push({
        id: `alert-${Date.now()}-1`,
        severity: 'high',
        type: 'high_debt_ratio',
        title: 'Критическая долговая нагрузка',
        description: `Долговая нагрузка составляет ${(debtRatio * 100).toFixed(1)}% от выручки`,
        recommendation: 'Рекомендуется запросить дополнительные гарантии или снизить сумму кредита',
        applicationId: application.id,
      });
    } else if (debtRatio > 0.3) {
      riskAlerts.push({
        id: `alert-${Date.now()}-1`,
        severity: 'medium',
        type: 'elevated_debt_ratio',
        title: 'Повышенная долговая нагрузка',
        description: `Долговая нагрузка ${(debtRatio * 100).toFixed(1)}% от выручки`,
        recommendation: 'Рассмотрите возможность запроса дополнительного залога',
        applicationId: application.id,
      });
    }

    // 2. Анализ кредитной истории
    const overdueEntries = company.creditHistory.filter(ch => ch.overdueDays > 0);
    const maxOverdue = Math.max(0, ...overdueEntries.map(ch => ch.overdueDays));

    if (maxOverdue > 30) {
      riskAlerts.push({
        id: `alert-${Date.now()}-2`,
        severity: 'high',
        type: 'poor_credit_history',
        title: 'Серьёзные просрочки в истории',
        description: `Максимальная просрочка: ${maxOverdue} дней`,
        recommendation: 'Требуется дополнительная проверка и объяснения от заёмщика',
        applicationId: application.id,
      });
      suspiciousPatterns.push('Наличие длительных просрочек в кредитной истории');
    }

    // 3. Анализ рентабельности
    const profitability = company.profit / company.revenue;
    if (profitability < 0) {
      riskAlerts.push({
        id: `alert-${Date.now()}-3`,
        severity: 'high',
        type: 'negative_profitability',
        title: 'Убыточная деятельность',
        description: `Рентабельность: ${(profitability * 100).toFixed(1)}%`,
        recommendation: 'Высокий риск дефолта. Требуется тщательный анализ бизнес-плана',
        applicationId: application.id,
      });
      suspiciousPatterns.push('Компания работает в убыток');
    } else if (profitability < 0.05) {
      riskAlerts.push({
        id: `alert-${Date.now()}-3`,
        severity: 'medium',
        type: 'low_profitability',
        title: 'Низкая рентабельность',
        description: `Рентабельность: ${(profitability * 100).toFixed(1)}%`,
        recommendation: 'Рекомендуется запросить финансовую отчётность за последние 2 года',
        applicationId: application.id,
      });
    }

    // 4. Анализ соответствия суммы и выручки
    const amountToRevenue = application.requestedAmount / company.revenue;
    if (amountToRevenue > 1.0) {
      riskAlerts.push({
        id: `alert-${Date.now()}-4`,
        severity: 'high',
        type: 'excessive_amount',
        title: 'Запрашиваемая сумма превышает годовую выручку',
        description: `Сумма кредита: ${(application.requestedAmount / 1000000).toFixed(1)} млн ₽, выручка: ${(company.revenue / 1000000).toFixed(1)} млн ₽`,
        recommendation: 'Необходимо обоснование цели кредитования и источников погашения',
        applicationId: application.id,
      });
      suspiciousPatterns.push('Запрашиваемая сумма значительно превышает выручку');
    }

    // 5. Анализ возраста бизнеса
    const businessAgeMonths = this.getBusinessAge(company.registrationDate);
    if (businessAgeMonths < 6) {
      riskAlerts.push({
        id: `alert-${Date.now()}-5`,
        severity: 'medium',
        type: 'young_business',
        title: 'Молодой бизнес',
        description: `Возраст компании: ${businessAgeMonths} месяцев`,
        recommendation: 'Рекомендуется запросить дополнительные гарантии от собственников',
        applicationId: application.id,
      });
    }

    // 6. Выявление подозрительных паттернов
    if (company.existingLoans.length > 3) {
      suspiciousPatterns.push('Большое количество активных кредитов в других банках');
    }

    if (application.requestedAmount > 10000000 && businessAgeMonths < 12) {
      suspiciousPatterns.push('Крупная сумма кредита для молодой компании');
    }

    // Общие рекомендации
    if (riskAlerts.length === 0) {
      recommendations.push('Заявка соответствует стандартным критериям одобрения');
    } else {
      if (riskAlerts.some(a => a.severity === 'high')) {
        recommendations.push('Требуется усиленная проверка и одобрение руководителем');
      }
      if (suspiciousPatterns.length > 0) {
        recommendations.push('Необходимо запросить дополнительные документы у заёмщика');
      }
    }

    // Общий скор риска (0-100, где 100 = минимальный риск)
    const highSeverityCount = riskAlerts.filter(a => a.severity === 'high').length;
    const mediumSeverityCount = riskAlerts.filter(a => a.severity === 'medium').length;
    const overallRiskScore = Math.max(0, 100 - (highSeverityCount * 25) - (mediumSeverityCount * 10));

    return {
      riskAlerts,
      overallRiskScore,
      recommendations,
      suspiciousPatterns,
    };
  },

  getBusinessAge(registrationDate: string): number {
    const reg = new Date(registrationDate);
    const now = new Date();
    return (now.getFullYear() - reg.getFullYear()) * 12 + (now.getMonth() - reg.getMonth());
  },

  // Анализ портфеля заявок
  analyzePortfolio(applications: CreditApplication[], companies: Company[]) {
    const totalApplications = applications.length;
    const approvedCount = applications.filter(a => ['approved', 'approved_with_changes'].includes(a.status)).length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;
    const pendingCount = applications.filter(a => ['submitted', 'data_validation', 'data_enrichment', 'scoring', 'review'].includes(a.status)).length;

    const approvalRate = totalApplications > 0 ? (approvedCount / totalApplications) * 100 : 0;

    // Средний размер кредита
    const avgAmount = applications.length > 0
      ? applications.reduce((sum, a) => sum + a.requestedAmount, 0) / applications.length
      : 0;

    // Распределение по уровням риска
    const riskDistribution = {
      low: applications.filter(a => a.scoringResult?.riskLevel === 'low').length,
      medium: applications.filter(a => a.scoringResult?.riskLevel === 'medium').length,
      high: applications.filter(a => a.scoringResult?.riskLevel === 'high').length,
      very_high: applications.filter(a => a.scoringResult?.riskLevel === 'very_high').length,
    };

    return {
      totalApplications,
      approvedCount,
      rejectedCount,
      pendingCount,
      approvalRate,
      avgAmount,
      riskDistribution,
    };
  }
};
