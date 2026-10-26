import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Award, TrendingUp, Users } from 'lucide-react';

export function CompanyBenchmark() {
  const { state, getCurrentCompany } = useApp();
  const currentCompany = getCurrentCompany();

  if (!currentCompany) return null;

  // Группируем компании по отрасли (ОКВЭД)
  const industryCode = currentCompany.okved.split(' ')[0];
  const industryCompanies = state.companies.filter(c => c.okved.startsWith(industryCode));

  // Если нет других компаний в отрасли, берём все компании для сравнения
  const comparisonCompanies = industryCompanies.length > 1 ? industryCompanies : state.companies;

  // Рассчитываем средние показатели
  const avgRevenue = comparisonCompanies.reduce((sum, c) => sum + c.revenue, 0) / comparisonCompanies.length;
  const avgProfit = comparisonCompanies.reduce((sum, c) => sum + c.profit, 0) / comparisonCompanies.length;
  const avgEmployees = Math.round(comparisonCompanies.reduce((sum, c) => sum + c.employees, 0) / comparisonCompanies.length);
  const avgProfitability = comparisonCompanies.reduce((sum, c) => sum + (c.profit / c.revenue), 0) / comparisonCompanies.length;

  // Данные для сравнения
  const comparisonData = [
    {
      metric: 'Выручка',
      current: currentCompany.revenue / 1000000,
      average: avgRevenue / 1000000,
      unit: 'млн ₽',
    },
    {
      metric: 'Прибыль',
      current: currentCompany.profit / 1000000,
      average: avgProfit / 1000000,
      unit: 'млн ₽',
    },
    {
      metric: 'Сотрудники',
      current: currentCompany.employees,
      average: avgEmployees,
      unit: 'чел.',
    },
    {
      metric: 'Рентабельность',
      current: (currentCompany.profit / currentCompany.revenue) * 100,
      average: avgProfitability * 100,
      unit: '%',
    },
  ];

  // Данные для радарной диаграммы
  const radarData = [
    {
      subject: 'Выручка',
      current: Math.min(100, (currentCompany.revenue / Math.max(...comparisonCompanies.map(c => c.revenue))) * 100),
      average: 50,
    },
    {
      subject: 'Прибыль',
      current: Math.min(100, (currentCompany.profit / Math.max(...comparisonCompanies.map(c => c.profit))) * 100),
      average: 50,
    },
    {
      subject: 'Команда',
      current: Math.min(100, (currentCompany.employees / Math.max(...comparisonCompanies.map(c => c.employees))) * 100),
      average: 50,
    },
    {
      subject: 'Рентабельность',
      current: Math.min(100, ((currentCompany.profit / currentCompany.revenue) / Math.max(...comparisonCompanies.map(c => c.profit / c.revenue))) * 100),
      average: 50,
    },
  ];

  const getComparison = (current: number, average: number) => {
    const diff = ((current - average) / average) * 100;
    if (diff > 10) return { text: `+${diff.toFixed(0)}%`, color: 'text-green-600', icon: '📈' };
    if (diff < -10) return { text: `${diff.toFixed(0)}%`, color: 'text-red-600', icon: '📉' };
    return { text: `${diff.toFixed(0)}%`, color: 'text-gray-600', icon: '➡️' };
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Сравнение с отраслью</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Ваша компания на фоне {comparisonCompanies.length} компаний в отрасли
      </p>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {comparisonData.map((item, idx) => {
          const comparison = getComparison(item.current, item.average);
          return (
            <div key={idx} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">{item.metric}</p>
              <p className="text-lg font-bold text-gray-900">
                {item.current.toFixed(1)} <span className="text-xs font-normal text-gray-500">{item.unit}</span>
              </p>
              <p className={`text-xs font-medium ${comparison.color}`}>
                {comparison.icon} {comparison.text} vs средняя
              </p>
            </div>
          );
        })}
      </div>

      {/* Bar Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Сравнение показателей</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="current" fill="#dc2626" name="Ваша компания" radius={[4, 4, 0, 0]} />
              <Bar dataKey="average" fill="#9ca3af" name="Среднее по отрасли" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Профиль компании</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Ваша компания" dataKey="current" stroke="#dc2626" fill="#dc2626" fillOpacity={0.3} />
              <Radar name="Среднее" dataKey="average" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-start gap-2">
          <Users size={18} className="text-purple-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Инсайты</p>
            <ul className="text-xs text-gray-700 space-y-1">
              {currentCompany.revenue > avgRevenue && (
                <li>✅ Ваша выручка выше средней по отрасли — это укрепляет позиции при кредитовании</li>
              )}
              {currentCompany.profit / currentCompany.revenue > avgProfitability && (
                <li>✅ Рентабельность выше средней — банк видит устойчивый бизнес</li>
              )}
              {currentCompany.employees > avgEmployees && (
                <li>✅ Большая команда — признак зрелого бизнеса</li>
              )}
              {currentCompany.revenue < avgRevenue && (
                <li>💡 Рассмотрите возможности для увеличения выручки</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
