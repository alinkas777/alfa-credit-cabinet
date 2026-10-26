import { Company, CreditApplication, ScoringResult, ScoringFactor, CreditDecision, CreditProduct } from './types';

/**
 * Упрощённая балльная скоринговая модель.
 * Каждый фактор вносит вклад от -10 до +10 в итоговую оценку (0-100).
 * Базовая оценка = 50, затем корректируется факторами.
 */
export function calculateScoring(
  company: Company,
  application: CreditApplication,
  product: CreditProduct
): ScoringResult {
  const factors: ScoringFactor[] = [];
  let totalImpact = 0;

  // 1. Возраст бизнеса
  const businessAgeMonths = getBusinessAge(company.registrationDate);
  if (businessAgeMonths >= 36) {
    factors.push({ name: 'Возраст бизнеса', value: `${Math.floor(businessAgeMonths / 12)} лет`, impact: 8, description: 'Стабильный бизнес старше 3 лет' });
    totalImpact += 8;
  } else if (businessAgeMonths >= 12) {
    factors.push({ name: 'Возраст бизнеса', value: `${Math.floor(businessAgeMonths / 12)} год(а)`, impact: 4, description: 'Бизнес работает более 1 года' });
    totalImpact += 4;
  } else if (businessAgeMonths >= 6) {
    factors.push({ name: 'Возраст бизнеса', value: `${businessAgeMonths} мес.`, impact: 0, description: 'Бизнес работает от 6 месяцев' });
    totalImpact += 0;
  } else {
    factors.push({ name: 'Возраст бизнеса', value: `${businessAgeMonths} мес.`, impact: -6, description: 'Молодой бизнес — повышенный риск' });
    totalImpact -= 6;
  }

  // 2. Финансовые показатели (рентабельность)
  const profitability = company.profit / company.revenue;
  if (profitability > 0.15) {
    factors.push({ name: 'Рентабельность', value: `${(profitability * 100).toFixed(1)}%`, impact: 8, description: 'Высокая рентабельность — устойчивый бизнес' });
    totalImpact += 8;
  } else if (profitability > 0.05) {
    factors.push({ name: 'Рентабельность', value: `${(profitability * 100).toFixed(1)}%`, impact: 4, description: 'Умеренная рентабельность' });
    totalImpact += 4;
  } else if (profitability > 0) {
    factors.push({ name: 'Рентабельность', value: `${(profitability * 100).toFixed(1)}%`, impact: -2, description: 'Низкая рентабельность' });
    totalImpact -= 2;
  } else {
    factors.push({ name: 'Рентабельность', value: `${(profitability * 100).toFixed(1)}%`, impact: -8, description: 'Убыточный бизнес — высокий риск' });
    totalImpact -= 8;
  }

  // 3. Долговая нагрузка (ежемесячные платежи / месячная выручка)
  const monthlyRevenue = company.revenue / 12;
  const totalMonthlyPayments = company.existingLoans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyPayment, 0);
  const debtRatio = totalMonthlyPayments / monthlyRevenue;

  if (debtRatio < 0.15) {
    factors.push({ name: 'Долговая нагрузка', value: `${(debtRatio * 100).toFixed(0)}%`, impact: 7, description: 'Низкая долговая нагрузка' });
    totalImpact += 7;
  } else if (debtRatio < 0.3) {
    factors.push({ name: 'Долговая нагрузка', value: `${(debtRatio * 100).toFixed(0)}%`, impact: 2, description: 'Умеренная долговая нагрузка' });
    totalImpact += 2;
  } else if (debtRatio < 0.5) {
    factors.push({ name: 'Долговая нагрузка', value: `${(debtRatio * 100).toFixed(0)}%`, impact: -4, description: 'Высокая долговая нагрузка' });
    totalImpact -= 4;
  } else {
    factors.push({ name: 'Долговая нагрузка', value: `${(debtRatio * 100).toFixed(0)}%`, impact: -8, description: 'Критическая долговая нагрузка' });
    totalImpact -= 8;
  }

  // 4. Кредитная история
  const overdueEntries = company.creditHistory.filter(ch => ch.overdueDays > 0);
  const maxOverdue = Math.max(0, ...overdueEntries.map(ch => ch.overdueDays));
  
  if (overdueEntries.length === 0 && company.creditHistory.length > 0) {
    factors.push({ name: 'Кредитная история', value: 'Без просрочек', impact: 8, description: 'Идеальная платёжная дисциплина' });
    totalImpact += 8;
  } else if (maxOverdue <= 7) {
    factors.push({ name: 'Кредитная история', value: `Макс. просрочка ${maxOverdue} дн.`, impact: 2, description: 'Незначительные задержки платежей' });
    totalImpact += 2;
  } else if (maxOverdue <= 30) {
    factors.push({ name: 'Кредитная история', value: `Макс. просрочка ${maxOverdue} дн.`, impact: -4, description: 'Существенные просрочки в истории' });
    totalImpact -= 4;
  } else {
    factors.push({ name: 'Кредитная история', value: `Макс. просрочка ${maxOverdue} дн.`, impact: -8, description: 'Серьёзные просрочки — высокий риск' });
    totalImpact -= 8;
  }

  // 5. Соответствие суммы запросу к выручке
  const amountToRevenue = application.requestedAmount / company.revenue;
  if (amountToRevenue < 0.3) {
    factors.push({ name: 'Сумма/Выручка', value: `${(amountToRevenue * 100).toFixed(0)}%`, impact: 5, description: 'Запрашиваемая сумма адекватна выручке' });
    totalImpact += 5;
  } else if (amountToRevenue < 0.6) {
    factors.push({ name: 'Сумма/Выручка', value: `${(amountToRevenue * 100).toFixed(0)}%`, impact: 0, description: 'Сумма умеренна относительно выручки' });
    totalImpact += 0;
  } else if (amountToRevenue < 1.0) {
    factors.push({ name: 'Сумма/Выручка', value: `${(amountToRevenue * 100).toFixed(0)}%`, impact: -4, description: 'Высокая сумма относительно выручки' });
    totalImpact -= 4;
  } else {
    factors.push({ name: 'Сумма/Выручка', value: `${(amountToRevenue * 100).toFixed(0)}%`, impact: -7, description: 'Сумма значительно превышает выручку' });
    totalImpact -= 7;
  }

  // 6. Размер бизнеса (выручка)
  if (company.revenue >= 50000000) {
    factors.push({ name: 'Масштаб бизнеса', value: `${(company.revenue / 1000000).toFixed(0)} млн ₽`, impact: 5, description: 'Крупный бизнес — стабильность' });
    totalImpact += 5;
  } else if (company.revenue >= 10000000) {
    factors.push({ name: 'Масштаб бизнеса', value: `${(company.revenue / 1000000).toFixed(0)} млн ₽`, impact: 2, description: 'Средний бизнес' });
    totalImpact += 2;
  } else if (company.revenue >= 3000000) {
    factors.push({ name: 'Масштаб бизнеса', value: `${(company.revenue / 1000000).toFixed(1)} млн ₽`, impact: -1, description: 'Микробизнес' });
    totalImpact -= 1;
  } else {
    factors.push({ name: 'Масштаб бизнеса', value: `${(company.revenue / 1000000).toFixed(1)} млн ₽`, impact: -4, description: 'Очень малый оборот' });
    totalImpact -= 4;
  }

  // Итоговый скор (база 50 + impact, от 0 до 100)
  const totalScore = Math.max(0, Math.min(100, 50 + totalImpact));

  // Уровень риска
  let riskLevel: ScoringResult['riskLevel'];
  if (totalScore >= 75) riskLevel = 'low';
  else if (totalScore >= 55) riskLevel = 'medium';
  else if (totalScore >= 35) riskLevel = 'high';
  else riskLevel = 'very_high';

  // Рекомендация
  let recommendation: ScoringResult['recommendation'];
  if (totalScore >= 70) recommendation = 'approve';
  else if (totalScore >= 50) recommendation = 'approve_with_changes';
  else if (totalScore >= 35) recommendation = 'additional_info';
  else recommendation = 'reject';

  return { totalScore, riskLevel, factors, recommendation };
}

/**
 * Принятие кредитного решения на основе скоринга
 */
export function makeCreditDecision(
  scoring: ScoringResult,
  application: CreditApplication,
  product: CreditProduct,
  company: Company
): CreditDecision {
  const baseRate = product.rateFrom + (product.rateTo - product.rateFrom) * (1 - scoring.totalScore / 100);

  switch (scoring.recommendation) {
    case 'approve':
      return {
        type: 'approved',
        approvedAmount: application.requestedAmount,
        approvedTerm: application.requestedTerm,
        approvedRate: Math.round(baseRate * 10) / 10,
        comment: 'Заявка одобрена на запрошенных условиях. Кредитоспособность заёмщика подтверждена.',
        decidedBy: 'Система (автоматически)',
        decidedAt: new Date().toISOString()
      };

    case 'approve_with_changes': {
      // Уменьшаем сумму на 20-30% и повышаем ставку
      const reducedAmount = Math.round(application.requestedAmount * 0.7 / 10000) * 10000;
      const increasedRate = Math.round((baseRate + 2) * 10) / 10;
      return {
        type: 'approved_with_changes',
        approvedAmount: Math.max(product.minAmount, reducedAmount),
        approvedTerm: application.requestedTerm,
        approvedRate: Math.min(product.rateTo, increasedRate),
        comment: 'Одобрено с изменением условий: сумма снижена, ставка скорректирована с учётом уровня риска.',
        decidedBy: 'Кредитный аналитик',
        decidedAt: new Date().toISOString()
      };
    }

    case 'additional_info':
      return {
        type: 'additional_info',
        comment: 'Необходима дополнительная информация для принятия решения. Запрошены уточнения по финансовым показателям.',
        decidedBy: 'Кредитный аналитик',
        decidedAt: new Date().toISOString()
      };

    case 'reject':
      return {
        type: 'rejected',
        comment: 'По результатам анализа кредитоспособности принято решение об отказе. Рекомендуем обратиться повторно через 3 месяца.',
        decidedBy: 'Кредитный аналитик',
        decidedAt: new Date().toISOString()
      };
  }
}

function getBusinessAge(registrationDate: string): number {
  const reg = new Date(registrationDate);
  const now = new Date();
  const months = (now.getFullYear() - reg.getFullYear()) * 12 + (now.getMonth() - reg.getMonth());
  return Math.max(0, months);
}
