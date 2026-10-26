import { useApp } from '../context/AppContext';
import { AIAnalyticsService, RiskAlert } from '../services/aiAnalytics';
import { AlertTriangle, Shield, TrendingDown, TrendingUp, Info } from 'lucide-react';

export function AIRiskAnalysis() {
  const { state } = useApp();

  // Анализируем все заявки
  const analyses = state.applications
    .map(app => {
      const company = state.companies.find(c => c.id === app.companyId);
      if (!company) return null;
      return {
        application: app,
        company,
        analysis: AIAnalyticsService.analyzeApplication(app, company),
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  // Агрегированная статистика
  const totalAlerts = analyses.reduce((sum, a) => sum + (a?.analysis.riskAlerts.length || 0), 0);
  const highSeverityAlerts = analyses.reduce(
    (sum, a) => sum + (a?.analysis.riskAlerts.filter(al => al.severity === 'high').length || 0), 0
  );
  const suspiciousPatterns = analyses.reduce(
    (sum, a) => sum + (a?.analysis.suspiciousPatterns.length || 0), 0
  );

  const getSeverityColor = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-700';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  const getSeverityIcon = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'high': return <AlertTriangle size={16} className="text-red-600" />;
      case 'medium': return <TrendingDown size={16} className="text-yellow-600" />;
      case 'low': return <Info size={16} className="text-blue-600" />;
    }
  };

  if (analyses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-анализ рисков</h3>
        <p className="text-sm text-gray-500 text-center py-8">
          Подайте заявку для автоматического анализа рисков
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} />
            <span className="text-sm font-medium">Всего алертов</span>
          </div>
          <p className="text-3xl font-bold">{totalAlerts}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={20} />
            <span className="text-sm font-medium">Критические</span>
          </div>
          <p className="text-3xl font-bold">{highSeverityAlerts}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} />
            <span className="text-sm font-medium">Подозрительные паттерны</span>
          </div>
          <p className="text-3xl font-bold">{suspiciousPatterns}</p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Детальный анализ по заявкам</h3>
        
        <div className="space-y-4">
          {analyses.map(({ application, company, analysis }) => (
            <div key={application.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{company.name}</h4>
                  <p className="text-xs text-gray-500">
                    {(application.requestedAmount / 1000000).toFixed(1)} млн ₽ • {application.requestedTerm} мес.
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  analysis.overallRiskScore >= 70 ? 'bg-green-100 text-green-700' :
                  analysis.overallRiskScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Риск: {analysis.overallRiskScore}/100
                </div>
              </div>

              {/* Risk Alerts */}
              {analysis.riskAlerts.length > 0 && (
                <div className="space-y-2 mb-3">
                  {analysis.riskAlerts.map((alert: RiskAlert, idx: number) => (
                    <div key={idx} className={`${getSeverityColor(alert.severity)} border rounded-lg p-3`}>
                      <div className="flex items-start gap-2">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs mt-0.5 opacity-80">{alert.description}</p>
                          <p className="text-xs mt-1 font-medium">💡 {alert.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suspicious Patterns */}
              {analysis.suspiciousPatterns.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-purple-700 mb-1">Подозрительные паттерны:</p>
                  <ul className="space-y-1">
                    {analysis.suspiciousPatterns.map((pattern: string, idx: number) => (
                      <li key={idx} className="text-xs text-purple-600 flex items-center gap-1">
                        <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                        {pattern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">Рекомендации AI:</p>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-xs text-blue-600 flex items-center gap-1">
                        <TrendingUp size={10} className="flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.riskAlerts.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700 flex items-center gap-2">
                    <Shield size={16} />
                    Критических рисков не выявлено
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
