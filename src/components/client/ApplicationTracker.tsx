import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../ClientDashboard';
import { Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { ApplicationStatus } from '../../types';

const statusFlow: ApplicationStatus[] = [
  'submitted', 'data_validation', 'data_enrichment', 'scoring', 'review'
];

const statusLabels: Record<string, string> = {
  'draft': 'Черновик',
  'submitted': 'Заявка отправлена',
  'data_validation': 'Проверка данных',
  'data_enrichment': 'Обогащение данными',
  'scoring': 'Скоринговая оценка',
  'review': 'Рассмотрение',
  'approved': 'Одобрена',
  'approved_with_changes': 'Одобрена с изменениями',
  'additional_info_requested': 'Запрошена информация',
  'rejected': 'Отказ',
  'documents_pending': 'Оформление документов',
  'completed': 'Завершена',
};

export function ApplicationTracker() {
  const { state, dispatch } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(state.selectedApplicationId);

  const myApplications = state.applications.filter(a => a.companyId === state.currentCompanyId);

  if (myApplications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Заявок пока нет</h3>
        <p className="text-gray-500">Подайте заявку на кредитный продукт, чтобы начать</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Мои заявки</h2>
        <p className="text-gray-500 mt-1">Отслеживайте статус ваших кредитных заявок</p>
      </div>

      <div className="space-y-4">
        {myApplications.slice().reverse().map(app => {
          const product = state.products.find(p => p.id === app.productId);
          const isExpanded = expandedId === app.id;
          const isFinal = ['approved', 'approved_with_changes', 'rejected', 'completed'].includes(app.status);
          const isProcessing = ['submitted', 'data_validation', 'data_enrichment', 'scoring', 'review'].includes(app.status);

          return (
            <div key={app.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : app.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">{product?.name}</h3>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {(app.requestedAmount / 1000000).toFixed(2)} млн ₽ • {app.requestedTerm} мес. • {new Date(app.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>

                {/* Progress bar for processing */}
                {isProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center gap-1">
                      {statusFlow.map((step, idx) => {
                        const currentIdx = statusFlow.indexOf(app.status);
                        const isCompleted = idx < currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <div key={step} className="flex-1 flex items-center">
                            <div className={`h-1.5 flex-1 rounded-full ${
                              isCompleted ? 'bg-green-500' : isCurrent ? 'bg-red-500' : 'bg-gray-200'
                            }`} />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Текущий этап: {statusLabels[app.status]}
                    </p>
                  </div>
                )}
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  {/* Status history */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">История изменений</h4>
                    <div className="space-y-2">
                      {app.statusHistory.slice().reverse().map((change, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            idx === 0 ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="text-sm text-gray-900">{change.comment || statusLabels[change.to]}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(change.timestamp).toLocaleString('ru-RU')} • {change.actor === 'system' ? 'Система' : change.actor === 'client' ? 'Клиент' : 'Аналитик'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decision */}
                  {app.decision && (
                    <div className={`rounded-xl p-4 ${
                      app.decision.type === 'approved' ? 'bg-green-50 border border-green-200' :
                      app.decision.type === 'approved_with_changes' ? 'bg-yellow-50 border border-yellow-200' :
                      app.decision.type === 'rejected' ? 'bg-red-50 border border-red-200' :
                      'bg-orange-50 border border-orange-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {app.decision.type === 'approved' && <CheckCircle size={18} className="text-green-600" />}
                        {app.decision.type === 'approved_with_changes' && <AlertCircle size={18} className="text-yellow-600" />}
                        {app.decision.type === 'rejected' && <XCircle size={18} className="text-red-600" />}
                        {app.decision.type === 'additional_info' && <AlertCircle size={18} className="text-orange-600" />}
                        <h4 className="font-medium text-gray-900">
                          {app.decision.type === 'approved' && 'Заявка одобрена'}
                          {app.decision.type === 'approved_with_changes' && 'Одобрено с изменёнными условиями'}
                          {app.decision.type === 'rejected' && 'Отказ в кредитовании'}
                          {app.decision.type === 'additional_info' && 'Необходима дополнительная информация'}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{app.decision.comment}</p>
                      {app.decision.approvedAmount && (
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Сумма</p>
                            <p className="font-semibold text-gray-900">{(app.decision.approvedAmount / 1000000).toFixed(2)} млн ₽</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Срок</p>
                            <p className="font-semibold text-gray-900">{app.decision.approvedTerm} мес.</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Ставка</p>
                            <p className="font-semibold text-gray-900">{app.decision.approvedRate}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Scoring */}
                  {app.scoringResult && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Результаты скоринга</h4>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Оценка</span>
                            <span className="text-sm font-bold text-gray-900">{app.scoringResult.totalScore}/100</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                app.scoringResult.totalScore >= 70 ? 'bg-green-500' :
                                app.scoringResult.totalScore >= 50 ? 'bg-yellow-500' :
                                app.scoringResult.totalScore >= 35 ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${app.scoringResult.totalScore}%` }}
                            />
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.scoringResult.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                          app.scoringResult.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          app.scoringResult.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {app.scoringResult.riskLevel === 'low' && 'Низкий риск'}
                          {app.scoringResult.riskLevel === 'medium' && 'Средний риск'}
                          {app.scoringResult.riskLevel === 'high' && 'Высокий риск'}
                          {app.scoringResult.riskLevel === 'very_high' && 'Очень высокий'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {app.scoringResult.factors.map((factor, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{factor.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{factor.value}</span>
                              <span className={`font-medium ${factor.impact > 0 ? 'text-green-600' : factor.impact < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                {factor.impact > 0 ? '+' : ''}{factor.impact}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {app.status === 'draft' && (
                    <button
                      onClick={() => dispatch({ type: 'SUBMIT_APPLICATION', payload: app.id })}
                      className="w-full bg-red-600 text-white py-2.5 rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                      Отправить заявку
                    </button>
                  )}

                  {/* Deal completion for approved applications */}
                  {(app.status === 'approved' || app.status === 'approved_with_changes') && (
                    <button
                      onClick={() => {
                        dispatch({ type: 'SELECT_APPLICATION', payload: app.id });
                        // Переключаемся на экран завершения сделки
                        const event = new CustomEvent('startDealCompletion', { detail: app.id });
                        window.dispatchEvent(event);
                      }}
                      className="w-full bg-green-600 text-white py-2.5 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} /> Принять предложение и оформить
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
