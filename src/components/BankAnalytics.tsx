import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

export function BankAnalytics() {
  const { state } = useApp();

  // Статистика
  const totalApplications = state.applications.length;
  const approvedCount = state.applications.filter(a => ['approved', 'approved_with_changes'].includes(a.status)).length;
  const rejectedCount = state.applications.filter(a => a.status === 'rejected').length;
  const pendingCount = state.applications.filter(a => ['submitted', 'data_validation', 'data_enrichment', 'scoring', 'review'].includes(a.status)).length;
  
  const approvalRate = totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0;
  
  // Общая сумма одобренных кредитов
  const totalApprovedAmount = state.applications
    .filter(a => ['approved', 'approved_with_changes'].includes(a.status))
    .reduce((sum, a) => sum + (a.decision?.approvedAmount || 0), 0);

  // Данные для круговой диаграммы статусов
  const statusData = [
    { name: 'Одобрено', value: approvedCount, color: '#10b981' },
    { name: 'Отказ', value: rejectedCount, color: '#ef4444' },
    { name: 'В обработке', value: pendingCount, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Данные по продуктам
  const productStats = state.products.map(product => {
    const apps = state.applications.filter(a => a.productId === product.id);
    return {
      name: product.name.split(' ')[0],
      count: apps.length,
      approved: apps.filter(a => ['approved', 'approved_with_changes'].includes(a.status)).length,
    };
  });

  // Средний скоринг
  const avgScore = state.applications
    .filter(a => a.scoringResult)
    .reduce((sum, a) => sum + (a.scoringResult?.totalScore || 0), 0) / 
    Math.max(1, state.applications.filter(a => a.scoringResult).length);

  // Распределение по уровням риска
  const riskDistribution = {
    low: state.applications.filter(a => a.scoringResult?.riskLevel === 'low').length,
    medium: state.applications.filter(a => a.scoringResult?.riskLevel === 'medium').length,
    high: state.applications.filter(a => a.scoringResult?.riskLevel === 'high').length,
    very_high: state.applications.filter(a => a.scoringResult?.riskLevel === 'very_high').length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Users size={20} />}
          label="Всего заявок"
          value={totalApplications}
          color="blue"
        />
        <KPICard
          icon={<CheckCircle size={20} />}
          label="Одобрено"
          value={approvedCount}
          subtitle={`${approvalRate}% одобрений`}
          color="green"
        />
        <KPICard
          icon={<DollarSign size={20} />}
          label="Сумма одобрений"
          value={`${(totalApprovedAmount / 1000000).toFixed(1)} млн`}
          color="purple"
        />
        <KPICard
          icon={<TrendingUp size={20} />}
          label="Средний скор"
          value={Math.round(avgScore)}
          subtitle="из 100"
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Статусы */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение статусов</h3>
          {statusData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Нет данных
            </div>
          )}
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart - Продукты */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Заявки по продуктам</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Всего" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" fill="#10b981" name="Одобрено" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Распределение по уровням риска</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RiskCard label="Низкий" count={riskDistribution.low} color="green" />
          <RiskCard label="Средний" count={riskDistribution.medium} color="yellow" />
          <RiskCard label="Высокий" count={riskDistribution.high} color="orange" />
          <RiskCard label="Очень высокий" count={riskDistribution.very_high} color="red" />
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, subtitle, color }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtitle?: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {subtitle && <div className="text-xs mt-1 opacity-75">{subtitle}</div>}
    </div>
  );
}

function RiskCard({ label, count, color }: {
  label: string;
  count: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{count}</div>
    </div>
  );
}
