import { useApp } from '../context/AppContext';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, Shield, AlertTriangle } from 'lucide-react';

export function ScoringVisualization() {
  const { state } = useApp();
  
  // Получаем последнюю заявку с результатами скоринга
  const applicationsWithScoring = state.applications
    .filter(app => app.scoringResult)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  
  if (applicationsWithScoring.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Визуализация скоринга</h3>
        <p className="text-sm text-gray-500 text-center py-8">
          Подайте заявку и пройдите скоринг, чтобы увидеть визуализацию
        </p>
      </div>
    );
  }

  const latestApp = applicationsWithScoring[0];
  const scoring = latestApp.scoringResult!;
  const company = state.companies.find(c => c.id === latestApp.companyId);

  // Данные для радарной диаграммы
  const radarData = scoring.factors.map(factor => ({
    factor: factor.name,
    value: Math.max(0, 50 + factor.impact * 5), // нормализуем к 0-100
    fullMark: 100,
  }));

  // Данные для сравнения компаний
  const comparisonData = state.applications
    .filter(app => app.scoringResult)
    .slice(0, 5)
    .map(app => {
      const comp = state.companies.find(c => c.id === app.companyId);
      return {
        name: comp?.name.split(' ')[1] || 'Компания',
        score: app.scoringResult?.totalScore || 0,
      };
    });

  const getRiskColor = (score: number) => {
    if (score >= 75) return '#10b981';
    if (score >= 55) return '#f59e0b';
    if (score >= 35) return '#f97316';
    return '#ef4444';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 75) return 'Низкий риск';
    if (score >= 55) return 'Средний риск';
    if (score >= 35) return 'Высокий риск';
    return 'Очень высокий риск';
  };

  return (
    <div className="space-y-6">
      {/* Основная карточка */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-red-600" />
              Результаты скоринга
            </h3>
            <p className="text-sm text-gray-500 mt-1">{company?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold" style={{ color: getRiskColor(scoring.totalScore) }}>
              {scoring.totalScore}
            </div>
            <div className="text-sm text-gray-500">{getRiskLabel(scoring.totalScore)}</div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-6">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${scoring.totalScore}%`,
                backgroundColor: getRiskColor(scoring.totalScore),
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Радарная диаграмма */}
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar
                name="Оценка"
                dataKey="value"
                stroke="#dc2626"
                fill="#dc2626"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Факторы */}
        <div className="space-y-2">
          {scoring.factors.map((factor, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-2">
                {factor.impact > 0 ? (
                  <TrendingUp size={14} className="text-green-600" />
                ) : factor.impact < 0 ? (
                  <AlertTriangle size={14} className="text-red-600" />
                ) : (
                  <Shield size={14} className="text-gray-400" />
                )}
                <span className="text-sm text-gray-700">{factor.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">{factor.value}</span>
                <span
                  className={`text-sm font-semibold ${
                    factor.impact > 0 ? 'text-green-600' : factor.impact < 0 ? 'text-red-600' : 'text-gray-400'
                  }`}
                >
                  {factor.impact > 0 ? '+' : ''}{factor.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Сравнение компаний */}
      {comparisonData.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Сравнение заявок</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#dc2626" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
