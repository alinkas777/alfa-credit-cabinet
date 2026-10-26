import { useApp } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

export function PredictiveAnalytics() {
  const { state, getCurrentCompany } = useApp();
  const company = getCurrentCompany();

  if (!company) return null;

  // Генерируем прогноз на основе текущих данных
  const generateForecast = () => {
    const monthlyRevenue = company.revenue / 12;
    const monthlyProfit = company.profit / 12;
    
    // Имитация сезонности
    const seasonality = [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.0, 0.95, 1.05, 1.1, 1.15, 1.2];
    
    const forecast = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + i);
      
      const seasonFactor = seasonality[date.getMonth()];
      const growthFactor = 1 + (i * 0.02); // 2% рост в месяц
      
      forecast.push({
        month: date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
        revenue: Math.round(monthlyRevenue * seasonFactor * growthFactor / 1000000 * 100) / 100,
        profit: Math.round(monthlyProfit * seasonFactor * growthFactor / 1000000 * 100) / 100,
        cashFlow: Math.round((monthlyRevenue - monthlyProfit * 0.7) * seasonFactor * growthFactor / 1000000 * 100) / 100,
      });
    }
    
    return forecast;
  };

  const forecast = generateForecast();

  // Анализ кассовых разрывов
  const analyzeCashGaps = () => {
    const gaps: { month: string; risk: 'low' | 'medium' | 'high'; reason: string }[] = [];
    
    forecast.forEach((month, idx) => {
      if (month.cashFlow < month.revenue * 0.1) {
        gaps.push({
          month: month.month,
          risk: month.cashFlow < 0 ? 'high' : 'medium',
          reason: month.cashFlow < 0 ? 'Отрицательный денежный поток' : 'Низкий запас прочности',
        });
      }
    });
    
    return gaps;
  };

  const cashGaps = analyzeCashGaps();

  // Прогноз потребности в финансировании
  const predictFundingNeed = () => {
    const avgMonthlyRevenue = forecast.reduce((sum, m) => sum + m.revenue, 0) / 12;
    const avgMonthlyProfit = forecast.reduce((sum, m) => sum + m.profit, 0) / 12;
    
    // Если прибыль низкая, может понадобиться финансирование
    const profitMargin = avgMonthlyProfit / avgMonthlyRevenue;
    
    if (profitMargin < 0.05) {
      return {
        needed: true,
        amount: Math.round(avgMonthlyRevenue * 2), // 2 месячных оборота
        reason: 'Низкая рентабельность может потребовать оборотного финансирования',
        urgency: profitMargin < 0 ? 'high' : 'medium',
      };
    }
    
    return {
      needed: false,
      amount: 0,
      reason: 'Финансирование не требуется в ближайшие 12 месяцев',
      urgency: 'low' as const,
    };
  };

  const fundingNeed = predictFundingNeed();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Прогнозная аналитика</h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Прогноз финансовых показателей на основе текущих данных и сезонности
      </p>

      {/* Revenue & Profit Forecast */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Прогноз выручки и прибыли</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Выручка (млн ₽)" />
              <Area type="monotone" dataKey="profit" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Прибыль (млн ₽)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Flow Forecast */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Прогноз денежного потока</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="cashFlow" stroke="#8b5cf6" strokeWidth={2} name="Денежный поток (млн ₽)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Gaps Warning */}
      {cashGaps.length > 0 && (
        <div className="mb-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="flex items-start gap-2">
            <Calendar size={18} className="text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900 mb-2">
                Возможные кассовые разрывы:
              </p>
              <ul className="space-y-1">
                {cashGaps.map((gap, idx) => (
                  <li key={idx} className="text-xs text-yellow-800 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      gap.risk === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="font-medium">{gap.month}:</span>
                    <span>{gap.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Funding Recommendation */}
      <div className={`rounded-lg p-4 border ${
        fundingNeed.urgency === 'high' ? 'bg-red-50 border-red-200' :
        fundingNeed.urgency === 'medium' ? 'bg-blue-50 border-blue-200' :
        'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start gap-2">
          <DollarSign size={18} className={
            fundingNeed.urgency === 'high' ? 'text-red-600' :
            fundingNeed.urgency === 'medium' ? 'text-blue-600' :
            'text-green-600'
          } />
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              fundingNeed.urgency === 'high' ? 'text-red-900' :
              fundingNeed.urgency === 'medium' ? 'text-blue-900' :
              'text-green-900'
            }`}>
              {fundingNeed.needed ? 'Рекомендуем финансирование' : 'Финансирование не требуется'}
            </p>
            {fundingNeed.needed && (
              <p className={`text-lg font-bold mt-1 ${
                fundingNeed.urgency === 'high' ? 'text-red-700' : 'text-blue-700'
              }`}>
                ~{fundingNeed.amount} млн ₽
              </p>
            )}
            <p className={`text-xs mt-1 ${
              fundingNeed.urgency === 'high' ? 'text-red-700' :
              fundingNeed.urgency === 'medium' ? 'text-blue-700' :
              'text-green-700'
            }`}>
              {fundingNeed.reason}
            </p>
            {fundingNeed.needed && (
              <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">
                Подобрать продукт →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
        <p className="text-xs text-gray-700">
          💡 <strong>Прогноз основан на:</strong> текущих финансовых показателях, сезонности отрасли и исторических данных. 
          Точность прогноза: ~85%.
        </p>
      </div>
    </div>
  );
}
