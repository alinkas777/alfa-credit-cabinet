import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditProduct } from '../../types';
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle, Info, Target } from 'lucide-react';

interface Props {
  product: CreditProduct;
  amount: number;
  term: number;
}

interface Factor {
  name: string;
  status: 'good' | 'warning' | 'bad';
  impact: number;
  description: string;
  recommendation?: string;
}

export function PreApprovalCheck({ product, amount, term }: Props) {
  const { getCurrentCompany } = useApp();
  const company = getCurrentCompany();
  const [showDetails, setShowDetails] = useState(false);

  if (!company) return null;

  const { score, factors, recommendation, chance } = useMemo(() => {
    const factors: Factor[] = [];
    let totalScore = 50;

    // 1. Возраст бизнеса
    const businessAgeMonths = getBusinessAge(company.registrationDate);
    if (businessAgeMonths >= 36) {
      factors.push({ name: 'Возраст бизнеса', status: 'good', impact: 8, description: `${Math.floor(businessAgeMonths / 12)} лет — стабильный бизнес` });
      totalScore += 8;
    } else if (businessAgeMonths >= 12) {
      factors.push({ name: 'Возраст бизнеса', status: 'good', impact: 4, description: `${Math.floor(businessAgeMonths / 12)} год(а)` });
      totalScore += 4;
    } else if (businessAgeMonths >= 6) {
      factors.push({ name: 'Возраст бизнеса', status: 'warning', impact: 0, description: `${businessAgeMonths} мес. — минимум для подачи` });
    } else {
      factors.push({
        name: 'Возраст бизнеса', status: 'bad', impact: -6,
        description: `${businessAgeMonths} мес. — слишком мало`,
        recommendation: 'Подождите до 6 месяцев работы'
      });
      totalScore -= 6;
    }

    // 2. Рентабельность
    const profitability = company.profit / company.revenue;
    if (profitability > 0.15) {
      factors.push({ name: 'Рентабельность', status: 'good', impact: 8, description: `${(profitability * 100).toFixed(1)}% — отличная` });
      totalScore += 8;
    } else if (profitability > 0.05) {
      factors.push({ name: 'Рентабельность', status: 'good', impact: 4, description: `${(profitability * 100).toFixed(1)}% — хорошая` });
      totalScore += 4;
    } else if (profitability > 0) {
      factors.push({
        name: 'Рентабельность', status: 'warning', impact: -2,
        description: `${(profitability * 100).toFixed(1)}% — низкая`,
        recommendation: 'Улучшите финансовые показатели'
      });
      totalScore -= 2;
    } else {
      factors.push({
        name: 'Рентабельность', status: 'bad', impact: -8,
        description: `${(profitability * 100).toFixed(1)}% — убыток`,
        recommendation: 'Выйдите в плюс перед подачей заявки'
      });
      totalScore -= 8;
    }

    // 3. Долговая нагрузка
    const monthlyRevenue = company.revenue / 12;
    const totalMonthlyPayments = company.existingLoans
      .filter(l => l.status === 'active')
      .reduce((sum, l) => sum + l.monthlyPayment, 0);
    const debtRatio = totalMonthlyPayments / monthlyRevenue;

    if (debtRatio < 0.15) {
      factors.push({ name: 'Долговая нагрузка', status: 'good', impact: 7, description: `${(debtRatio * 100).toFixed(0)}% — низкая` });
      totalScore += 7;
    } else if (debtRatio < 0.3) {
      factors.push({ name: 'Долговая нагрузка', status: 'good', impact: 2, description: `${(debtRatio * 100).toFixed(0)}% — умеренная` });
      totalScore += 2;
    } else if (debtRatio < 0.5) {
      factors.push({
        name: 'Долговая нагрузка', status: 'warning', impact: -4,
        description: `${(debtRatio * 100).toFixed(0)}% — высокая`,
        recommendation: 'Погасите часть текущих кредитов'
      });
      totalScore -= 4;
    } else {
      factors.push({
        name: 'Долговая нагрузка', status: 'bad', impact: -8,
        description: `${(debtRatio * 100).toFixed(0)}% — критическая`,
        recommendation: 'Снизьте долговую нагрузку перед подачей'
      });
      totalScore -= 8;
    }

    // 4. Кредитная история
    const overdueEntries = company.creditHistory.filter(ch => ch.overdueDays > 0);
    const maxOverdue = Math.max(0, ...overdueEntries.map(ch => ch.overdueDays));

    if (overdueEntries.length === 0 && company.creditHistory.length > 0) {
      factors.push({ name: 'Кредитная история', status: 'good', impact: 8, description: 'Без просрочек' });
      totalScore += 8;
    } else if (maxOverdue <= 7) {
      factors.push({ name: 'Кредитная история', status: 'warning', impact: 2, description: `Просрочки до ${maxOverdue} дн.` });
      totalScore += 2;
    } else if (maxOverdue <= 30) {
      factors.push({
        name: 'Кредитная история', status: 'warning', impact: -4,
        description: `Просрочки до ${maxOverdue} дн.`,
        recommendation: 'Объясните причины просрочек'
      });
      totalScore -= 4;
    } else {
      factors.push({
        name: 'Кредитная история', status: 'bad', impact: -8,
        description: `Просрочки до ${maxOverdue} дн.`,
        recommendation: 'Подождите 6 месяцев без просрочек'
      });
      totalScore -= 8;
    }

    // 5. Сумма/Выручка
    const amountToRevenue = amount / company.revenue;
    if (amountToRevenue < 0.3) {
      factors.push({ name: 'Сумма/Выручка', status: 'good', impact: 5, description: `${(amountToRevenue * 100).toFixed(0)}% — адекватно` });
      totalScore += 5;
    } else if (amountToRevenue < 0.6) {
      factors.push({ name: 'Сумма/Выручка', status: 'warning', impact: 0, description: `${(amountToRevenue * 100).toFixed(0)}% — умеренно` });
    } else if (amountToRevenue < 1.0) {
      factors.push({
        name: 'Сумма/Выручка', status: 'warning', impact: -4,
        description: `${(amountToRevenue * 100).toFixed(0)}% — много`,
        recommendation: `Уменьшите сумму до ${(company.revenue * 0.3 / 1000000).toFixed(1)} млн ₽`
      });
      totalScore -= 4;
    } else {
      factors.push({
        name: 'Сумма/Выручка', status: 'bad', impact: -7,
        description: `${(amountToRevenue * 100).toFixed(0)}% — слишком много`,
        recommendation: `Рекомендуем не более ${(company.revenue * 0.5 / 1000000).toFixed(1)} млн ₽`
      });
      totalScore -= 7;
    }

    const finalScore = Math.max(0, Math.min(100, totalScore));
    let recommendation: 'high' | 'medium' | 'low';
    if (finalScore >= 70) recommendation = 'high';
    else if (finalScore >= 50) recommendation = 'medium';
    else recommendation = 'low';

    return {
      score: finalScore,
      factors,
      recommendation,
      chance: finalScore,
    };
  }, [company, amount, term]);

  const getStatusColor = (status: Factor['status']) => {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-200 text-green-700';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'bad': return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  const getIcon = (status: Factor['status']) => {
    switch (status) {
      case 'good': return <CheckCircle size={14} className="text-green-600" />;
      case 'warning': return <AlertCircle size={14} className="text-yellow-600" />;
      case 'bad': return <AlertCircle size={14} className="text-red-600" />;
    }
  };

  const getChanceLabel = () => {
    if (chance >= 80) return { text: 'Высокие', color: 'text-green-600', bg: 'bg-green-50' };
    if (chance >= 60) return { text: 'Хорошие', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (chance >= 40) return { text: 'Средние', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { text: 'Низкие', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const chanceLabel = getChanceLabel();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target size={18} className="text-red-600" />
        <h3 className="text-sm font-semibold text-gray-900">Прогноз одобрения</h3>
      </div>

      {/* Main Score */}
      <div className={`${chanceLabel.bg} rounded-lg p-3 mb-3`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Ваши шансы на одобрение:</span>
          <span className={`text-2xl font-bold ${chanceLabel.color}`}>{chance}%</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              chance >= 70 ? 'bg-green-500' : chance >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${chance}%` }}
          />
        </div>
        <p className={`text-xs font-medium mt-2 ${chanceLabel.color}`}>
          {chance >= 80 && '🎯 Отличные шансы! Заявка скорее всего будет одобрена'}
          {chance >= 60 && chance < 80 && '✅ Хорошие шансы. Возможно одобрение с изменёнными условиями'}
          {chance >= 40 && chance < 60 && '⚠️ Средние шансы. Рассмотрите рекомендации ниже'}
          {chance < 40 && '❌ Низкие шансы. Рекомендуем улучшить показатели перед подачей'}
        </p>
      </div>

      {/* Toggle Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 mb-2"
      >
        {showDetails ? 'Скрыть' : 'Показать'} детальный анализ ({factors.length} факторов)
      </button>

      {/* Factors */}
      {showDetails && (
        <div className="space-y-2 mt-3">
          {factors.map((factor, idx) => (
            <div key={idx} className={`${getStatusColor(factor.status)} border rounded-lg p-2.5`}>
              <div className="flex items-start gap-2">
                {getIcon(factor.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{factor.name}</span>
                    <span className={`text-xs font-bold ${
                      factor.impact > 0 ? 'text-green-600' : factor.impact < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {factor.impact > 0 ? '+' : ''}{factor.impact}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 opacity-80">{factor.description}</p>
                  {factor.recommendation && (
                    <p className="text-xs mt-1 font-medium">💡 {factor.recommendation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getBusinessAge(registrationDate: string): number {
  const reg = new Date(registrationDate);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - reg.getFullYear()) * 12 + (now.getMonth() - reg.getMonth()));
}
