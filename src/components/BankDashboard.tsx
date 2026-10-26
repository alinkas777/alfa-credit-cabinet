import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from './ClientDashboard';
import { BankAnalytics } from './BankAnalytics';
import { NotificationSystem } from './NotificationSystem';
import { CreditApplication, ApplicationStatus } from '../types';
import {
  Users, FileCheck, BarChart3, AlertTriangle, CheckCircle,
  XCircle, Clock, Database, Shield, ChevronRight, Search, PieChart
} from 'lucide-react';

type BankView = 'queue' | 'detail' | 'pipeline' | 'analytics';

const statusFlow: { status: ApplicationStatus; label: string; shortLabel: string }[] = [
  { status: 'submitted', label: 'Подана', shortLabel: 'Подана' },
  { status: 'data_validation', label: 'Проверка данных', shortLabel: 'Проверка' },
  { status: 'data_enrichment', label: 'Обогащение данных', shortLabel: 'Обогащение' },
  { status: 'scoring', label: 'Скоринг', shortLabel: 'Скоринг' },
  { status: 'review', label: 'Рассмотрение', shortLabel: 'Рассмотрение' },
];

export function BankDashboard() {
  const { state, dispatch } = useApp();
  const [view, setView] = useState<BankView>('pipeline');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allApplications = state.applications;
  const filteredApplications = allApplications.filter(app => {
    if (!searchQuery) return true;
    const company = state.companies.find(c => c.id === app.companyId);
    const product = state.products.find(p => p.id === app.productId);
    const query = searchQuery.toLowerCase();
    return (
      company?.name.toLowerCase().includes(query) ||
      product?.name.toLowerCase().includes(query) ||
      app.id.toLowerCase().includes(query)
    );
  });

  const selectedApp = selectedAppId ? allApplications.find(a => a.id === selectedAppId) : null;

  // Stats
  const pendingCount = allApplications.filter(a => ['submitted', 'data_validation', 'data_enrichment', 'scoring', 'review'].includes(a.status)).length;
  const approvedCount = allApplications.filter(a => ['approved', 'approved_with_changes'].includes(a.status)).length;
  const rejectedCount = allApplications.filter(a => a.status === 'rejected').length;

  const handleAdvance = (appId: string) => {
    const app = allApplications.find(a => a.id === appId);
    if (!app) return;

    if (app.status === 'scoring') {
      // Запускаем скоринг и принимаем решение
      dispatch({ type: 'RUN_SCORING', payload: appId });
    } else {
      dispatch({ type: 'ADVANCE_APPLICATION', payload: appId });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Панель кредитного аналитика</h2>
          <p className="text-gray-500 mt-1">Управление заявками и принятие решений</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск заявок..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none w-64"
            />
          </div>
          <NotificationSystem />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<Clock size={18} />} label="В обработке" value={pendingCount} color="blue" />
        <StatCard icon={<CheckCircle size={18} />} label="Одобрено" value={approvedCount} color="green" />
        <StatCard icon={<XCircle size={18} />} label="Отказы" value={rejectedCount} color="red" />
        <StatCard icon={<FileCheck size={18} />} label="Всего заявок" value={allApplications.length} color="gray" />
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200">
        <button
          onClick={() => setView('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            view === 'analytics' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <PieChart size={16} /> Аналитика
        </button>
        <button
          onClick={() => setView('pipeline')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            view === 'pipeline' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BarChart3 size={16} /> Конвейер заявок
        </button>
        <button
          onClick={() => setView('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            view === 'queue' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Users size={16} /> Очередь
        </button>
      </div>

      {view === 'analytics' ? (
        <BankAnalytics />
      ) : allApplications.length === 0 ? (
        <EmptyState />
      ) : view === 'pipeline' ? (
        <PipelineView
          applications={filteredApplications}
          state={state}
          onSelect={setSelectedAppId}
          selectedId={selectedAppId}
        />
      ) : (
        <QueueView
          applications={filteredApplications}
          state={state}
          onAdvance={handleAdvance}
          onSelect={setSelectedAppId}
        />
      )}

      {/* Detail Panel */}
      {selectedApp && (
        <DetailPanel
          application={selectedApp}
          state={state}
          onClose={() => setSelectedAppId(null)}
          onAdvance={() => handleAdvance(selectedApp.id)}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    gray: 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function PipelineView({ applications, state, onSelect, selectedId }: {
  applications: CreditApplication[];
  state: any;
  onSelect: (id: string) => void;
  selectedId: string | null;
}) {
  const columns = [
    { status: 'submitted', label: 'Новые', color: 'border-blue-400' },
    { status: 'data_validation', label: 'Проверка', color: 'border-indigo-400' },
    { status: 'data_enrichment', label: 'Обогащение', color: 'border-purple-400' },
    { status: 'scoring', label: 'Скоринг', color: 'border-yellow-400' },
    { status: 'review', label: 'Рассмотрение', color: 'border-orange-400' },
    { status: 'approved', label: 'Одобрено', color: 'border-green-400' },
    { status: 'approved_with_changes', label: 'Одобрено (изм.)', color: 'border-green-400' },
    { status: 'rejected', label: 'Отказ', color: 'border-red-400' },
    { status: 'additional_info_requested', label: 'Доп. инфо', color: 'border-orange-400' },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {columns.map(col => {
        const apps = applications.filter(a => a.status === col.status);
        return (
          <div key={col.status} className={`min-w-[200px] flex-1 bg-white rounded-xl border border-gray-200 border-t-4 ${col.color}`}>
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">{col.label}</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{apps.length}</span>
              </div>
            </div>
            <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
              {apps.map(app => {
                const company = state.companies.find((c: any) => c.id === app.companyId);
                const product = state.products.find((p: any) => p.id === app.productId);
                return (
                  <button
                    key={app.id}
                    onClick={() => onSelect(app.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm ${
                      selectedId === app.id ? 'border-red-300 bg-red-50' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-xs font-medium text-gray-900 truncate">{company?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{product?.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(app.requestedAmount / 1000000).toFixed(1)} млн ₽
                    </p>
                  </button>
                );
              })}
              {apps.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">Нет заявок</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QueueView({ applications, state, onAdvance, onSelect }: {
  applications: CreditApplication[];
  state: any;
  onAdvance: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const processingApps = applications.filter(a =>
    ['submitted', 'data_validation', 'data_enrichment', 'scoring', 'review'].includes(a.status)
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Компания</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Продукт</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Сумма</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Статус</th>
            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {processingApps.map(app => {
            const company = state.companies.find((c: any) => c.id === app.companyId);
            const product = state.products.find((p: any) => p.id === app.productId);
            return (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{company?.name}</p>
                  <p className="text-xs text-gray-500">ИНН {company?.inn}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-700">{product?.name}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">{(app.requestedAmount / 1000000).toFixed(2)} млн</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={app.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelect(app.id)}
                      className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded border border-gray-200 hover:border-gray-300"
                    >
                      Подробнее
                    </button>
                    <button
                      onClick={() => onAdvance(app.id)}
                      className="text-xs text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-medium flex items-center gap-1"
                    >
                      {app.status === 'scoring' ? 'Запустить скоринг' : 'Далее'}
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {processingApps.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                Нет заявок в обработке
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DetailPanel({ application, state, onClose, onAdvance }: {
  application: CreditApplication;
  state: any;
  onClose: () => void;
  onAdvance: () => void;
}) {
  const company = state.companies.find((c: any) => c.id === application.companyId);
  const product = state.products.find((p: any) => p.id === application.productId);
  const isProcessing = ['submitted', 'data_validation', 'data_enrichment', 'scoring', 'review'].includes(application.status);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="w-full max-w-lg bg-white h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Детали заявки</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Application Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <StatusBadge status={application.status} />
              <span className="text-xs text-gray-400">{new Date(application.createdAt).toLocaleString('ru-RU')}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Компания</span>
                <span className="text-sm font-medium text-gray-900">{company?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Продукт</span>
                <span className="text-sm font-medium text-gray-900">{product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Сумма</span>
                <span className="text-sm font-medium text-gray-900">{(application.requestedAmount / 1000000).toFixed(2)} млн ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Срок</span>
                <span className="text-sm font-medium text-gray-900">{application.requestedTerm} мес.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Цель</span>
                <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{application.purpose}</span>
              </div>
            </div>
          </div>

          {/* External Data (Mocked) */}
          {['data_enrichment', 'scoring', 'review', 'approved', 'approved_with_changes', 'rejected', 'additional_info_requested'].includes(application.status) && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Database size={14} /> Внешние данные (моки)
              </h4>
              <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-indigo-600" />
                  <span className="text-xs font-medium text-indigo-700">ЕГРЮЛ</span>
                </div>
                <p className="text-xs text-indigo-600">Статус: Действующая • Дата рег.: {new Date(company?.registrationDate || '').toLocaleDateString('ru-RU')}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={14} className="text-green-600" />
                  <span className="text-xs font-medium text-green-700">БКИ</span>
                </div>
                <p className="text-xs text-green-600">
                  Кредитов: {company?.creditHistory.length} • Просрочек: {company?.creditHistory.filter((ch: any) => ch.overdueDays > 0).length || 0}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck size={14} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">ФНС «Прозрачный бизнес»</span>
                </div>
                <p className="text-xs text-purple-600">
                  ОКВЭД: {company?.okved} • Выручка: {(company?.revenue || 0 / 1000000).toFixed(1)} млн ₽
                </p>
              </div>
            </div>
          )}

          {/* Scoring */}
          {application.scoringResult && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BarChart3 size={14} /> Скоринг
              </h4>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Итоговая оценка</span>
                  <span className="text-2xl font-bold text-gray-900">{application.scoringResult.totalScore}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full ${
                      application.scoringResult.totalScore >= 70 ? 'bg-green-500' :
                      application.scoringResult.totalScore >= 50 ? 'bg-yellow-500' :
                      application.scoringResult.totalScore >= 35 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${application.scoringResult.totalScore}%` }}
                  />
                </div>
                <div className="space-y-2">
                  {application.scoringResult.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 flex-1">{factor.name}</span>
                      <span className="text-gray-400 mx-2">{factor.value}</span>
                      <span className={`font-medium w-8 text-right ${
                        factor.impact > 0 ? 'text-green-600' : factor.impact < 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {factor.impact > 0 ? '+' : ''}{factor.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Decision */}
          {application.decision && (
            <div className={`rounded-xl p-4 border ${
              application.decision.type === 'approved' ? 'bg-green-50 border-green-200' :
              application.decision.type === 'approved_with_changes' ? 'bg-yellow-50 border-yellow-200' :
              application.decision.type === 'rejected' ? 'bg-red-50 border-red-200' :
              'bg-orange-50 border-orange-200'
            }`}>
              <h4 className="font-medium text-gray-900 mb-2">
                {application.decision.type === 'approved' && '✅ Одобрено'}
                {application.decision.type === 'approved_with_changes' && '⚠️ Одобрено с изменениями'}
                {application.decision.type === 'rejected' && '❌ Отказ'}
                {application.decision.type === 'additional_info' && '📋 Запрошена информация'}
              </h4>
              <p className="text-sm text-gray-700 mb-2">{application.decision.comment}</p>
              {application.decision.approvedAmount && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-400">Сумма</p>
                    <p className="text-sm font-bold">{(application.decision.approvedAmount / 1000000).toFixed(2)} млн</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-400">Срок</p>
                    <p className="text-sm font-bold">{application.decision.approvedTerm} мес.</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-400">Ставка</p>
                    <p className="text-sm font-bold">{application.decision.approvedRate}%</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status History */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">История</h4>
            <div className="space-y-2">
              {application.statusHistory.slice().reverse().map((change, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${idx === 0 ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-xs text-gray-700">{change.comment || change.to}</p>
                    <p className="text-xs text-gray-400">{new Date(change.timestamp).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          {isProcessing && (
            <button
              onClick={onAdvance}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              {application.status === 'scoring' ? (
                <>
                  <BarChart3 size={16} /> Запустить скоринг и принять решение
                </>
              ) : (
                <>
                  Перевести на следующий этап <ChevronRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={24} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заявок</h3>
      <p className="text-gray-500 max-w-md mx-auto">
        Переключитесь в режим «Предприниматель» и подайте заявку, чтобы увидеть её обработку в банковской панели
      </p>
    </div>
  );
}
