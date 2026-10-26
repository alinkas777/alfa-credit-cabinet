import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  currentStep: number;
  amount: number;
  term: number;
  purpose: string;
  onSuggestion: (suggestion: { amount?: number; term?: number; purpose?: string }) => void;
}

interface Suggestion {
  type: 'info' | 'warning' | 'success' | 'tip';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ApplicationAssistant({ currentStep, amount, term, purpose, onSuggestion }: Props) {
  const { getCurrentCompany, getProduct } = useApp();
  const company = getCurrentCompany();
  const [isOpen, setIsOpen] = useState(true);

  if (!company) return null;

  const getSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    if (currentStep === 1) {
      // Анализ суммы
      const amountToRevenue = amount / company.revenue;
      
      if (amountToRevenue > 0.5) {
        suggestions.push({
          type: 'warning',
          message: `Запрашиваемая сумма составляет ${(amountToRevenue * 100).toFixed(0)}% от годовой выручки. Это может снизить шансы на одобрение.`,
          action: {
            label: `Рекомендуем ${(company.revenue * 0.3 / 1000000).toFixed(1)} млн ₽`,
            onClick: () => onSuggestion({ amount: Math.round(company.revenue * 0.3) }),
          },
        });
      } else if (amountToRevenue < 0.1) {
        suggestions.push({
          type: 'tip',
          message: `Сумма небольшая относительно выручки. Высокие шансы на одобрение!`,
        });
      }

      // Анализ срока
      if (term > 36 && amount > 5000000) {
        suggestions.push({
          type: 'info',
          message: `Для крупных сумм на длительный срок может потребоваться дополнительная проверка.`,
        });
      }

      // Проверка долговой нагрузки
      const monthlyRevenue = company.revenue / 12;
      const existingPayments = company.existingLoans
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + l.monthlyPayment, 0);
      
      const estimatedPayment = amount / term * 1.15; // примерный платёж с процентами
      const totalDebtRatio = (existingPayments + estimatedPayment) / monthlyRevenue;

      if (totalDebtRatio > 0.5) {
        suggestions.push({
          type: 'warning',
          message: `С учётом текущих обязательств долговая нагрузка превысит 50%. Рассмотрите меньшую сумму или срок.`,
        });
      }
    }

    if (currentStep === 2) {
      // Анализ цели
      if (purpose.length < 20) {
        suggestions.push({
          type: 'info',
          message: `Опишите цель подробнее (минимум 20 символов). Это поможет банку лучше понять ваши потребности.`,
        });
      }

      const purposeLower = purpose.toLowerCase();
      if (purposeLower.includes('оборот') || purposeLower.includes('закупк')) {
        suggestions.push({
          type: 'success',
          message: `Пополнение оборотных средств — популярная цель. Обычно такие заявки одобряются быстрее.`,
        });
      } else if (purposeLower.includes('оборудован') || purposeLower.includes('техник')) {
        suggestions.push({
          type: 'tip',
          message: `Для закупки оборудования может потребоваться указать конкретные позиции. Подготовьте коммерческие предложения.`,
        });
      }

      if (purpose.length > 20) {
        suggestions.push({
          type: 'success',
          message: `Отличное описание цели! Это повысит шансы на одобрение.`,
        });
      }
    }

    if (currentStep === 3) {
      suggestions.push({
        type: 'success',
        message: `Все данные заполнены. Проверьте информацию и отправьте заявку.`,
      });

      // Финальная оценка шансов
      const amountToRevenue = amount / company.revenue;
      const hasGoodHistory = company.creditHistory.some(ch => ch.overdueDays === 0);
      const isProfitable = company.profit > 0;

      if (amountToRevenue < 0.3 && hasGoodHistory && isProfitable) {
        suggestions.push({
          type: 'success',
          message: `🎯 Высокие шансы на одобрение! Ваш профиль соответствует критериям.`,
        });
      }
    }

    return suggestions;
  };

  const suggestions = getSuggestions();

  if (!isOpen || suggestions.length === 0) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mb-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Sparkles size={18} />
        <span className="text-sm font-medium">Показать AI-подсказки ({suggestions.length})</span>
      </button>
    );
  }

  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-green-600" />;
      case 'warning': return <AlertCircle size={16} className="text-yellow-600" />;
      case 'info': return <Lightbulb size={16} className="text-blue-600" />;
      case 'tip': return <Sparkles size={16} className="text-purple-600" />;
    }
  };

  const getBgColor = (type: Suggestion['type']) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      case 'tip': return 'bg-purple-50 border-purple-200';
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h3 className="font-semibold text-sm">AI-помощник</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Suggestions */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className={`${getBgColor(suggestion.type)} border rounded-xl p-3`}>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">{getIcon(suggestion.type)}</div>
              <div className="flex-1">
                <p className="text-xs text-gray-700">{suggestion.message}</p>
                {suggestion.action && (
                  <button
                    onClick={suggestion.action.onClick}
                    className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    {suggestion.action.label}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
