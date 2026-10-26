import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCatalog } from './client/ProductCatalog';
import { ApplicationForm } from './client/ApplicationForm';
import { ApplicationTracker } from './client/ApplicationTracker';
import { CompanyInfo } from './client/CompanyInfo';
import { NewsFeed } from './client/NewsFeed';
import { DealCompletion } from './client/DealCompletion';
import { AIAssistant } from './client/AIAssistant';
import { ScoringVisualization } from './ScoringVisualization';
import { Building2, FileText, List, ChevronRight, BarChart3 } from 'lucide-react';

type ClientView = 'dashboard' | 'products' | 'application' | 'tracker' | 'company' | 'deal' | 'analytics';

export function ClientDashboard() {
  const { state, dispatch, getCurrentCompany } = useApp();
  const [view, setView] = useState<ClientView>('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [dealApplicationId, setDealApplicationId] = useState<string | null>(null);
  const company = getCurrentCompany();

  const myApplications = state.applications.filter(a => a.companyId === state.currentCompanyId);

  // Listen for deal completion events
  useEffect(() => {
    const handleDealStart = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setDealApplicationId(customEvent.detail);
      setView('deal');
    };
    window.addEventListener('startDealCompletion', handleDealStart);
    return () => window.removeEventListener('startDealCompletion', handleDealStart);
  }, []);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setView('application');
  };

  const handleApplicationCreated = (appId: string) => {
    dispatch({ type: 'SELECT_APPLICATION', payload: appId });
    setView('tracker');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Company Selector */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 border border-gray-200">
          <Building2 size={18} className="text-gray-500" />
          <select
            value={state.currentCompanyId || ''}
            onChange={(e) => dispatch({ type: 'SET_COMPANY', payload: e.target.value })}
            className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer"
          >
            {state.companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 overflow-x-auto">
        {[
          { id: 'dashboard' as ClientView, label: 'Обзор', icon: Building2 },
          { id: 'products' as ClientView, label: 'Продукты', icon: FileText },
          { id: 'tracker' as ClientView, label: 'Мои заявки', icon: List },
          { id: 'analytics' as ClientView, label: 'Аналитика', icon: BarChart3 },
          { id: 'company' as ClientView, label: 'О компании', icon: Building2 },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              view === item.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <item.icon size={16} />
            {item.label}
            {item.id === 'tracker' && myApplications.length > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                view === item.id ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {myApplications.length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Content */}
      {view === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Добро пожаловать!</h2>
              <p className="text-red-100 mb-4">
                Подберите оптимальный кредитный продукт для вашего бизнеса и подайте заявку онлайн
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setView('products')}
                  className="bg-white text-red-600 px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  Выбрать продукт <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setView('analytics')}
                  className="bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-white/30 transition-colors flex items-center gap-2 backdrop-blur"
                >
                  <BarChart3 size={16} /> Аналитика
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Активных заявок</p>
                <p className="text-2xl font-bold text-gray-900">
                  {myApplications.filter(a => !['approved', 'rejected', 'completed'].includes(a.status)).length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Одобрено</p>
                <p className="text-2xl font-bold text-green-600">
                  {myApplications.filter(a => ['approved', 'approved_with_changes'].includes(a.status)).length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <p className="text-sm text-gray-500">Всего заявок</p>
                <p className="text-2xl font-bold text-gray-900">{myApplications.length}</p>
              </div>
            </div>

            {/* Recent Applications */}
            {myApplications.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Последние заявки</h3>
                <div className="space-y-3">
                  {myApplications.slice(-3).reverse().map(app => {
                    const product = state.products.find(p => p.id === app.productId);
                    return (
                      <button
                        key={app.id}
                        onClick={() => { dispatch({ type: 'SELECT_APPLICATION', payload: app.id }); setView('tracker'); }}
                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-left transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{product?.name}</p>
                          <p className="text-xs text-gray-500">
                            {(app.requestedAmount / 1000000).toFixed(1)} млн ₽ • {app.requestedTerm} мес.
                          </p>
                        </div>
                        <StatusBadge status={app.status} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NewsFeed />
            <CompanyInfo compact />
          </div>
        </div>
      )}

      {view === 'products' && (
        <ProductCatalog onSelect={handleSelectProduct} />
      )}

      {view === 'application' && selectedProductId && (
        <ApplicationForm
          productId={selectedProductId}
          onCreated={handleApplicationCreated}
          onCancel={() => setView('products')}
        />
      )}

      {view === 'tracker' && (
        <ApplicationTracker />
      )}

      {view === 'company' && company && (
        <CompanyInfo company={company} />
      )}

      {view === 'deal' && dealApplicationId && (() => {
        const app = state.applications.find(a => a.id === dealApplicationId);
        if (!app) return null;
        return (
          <DealCompletion
            application={app}
            onComplete={() => {
              setView('dashboard');
              setDealApplicationId(null);
            }}
          />
        );
      })()}

      {view === 'analytics' && (
        <ScoringVisualization />
      )}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    'draft': { label: 'Черновик', className: 'bg-gray-100 text-gray-600' },
    'submitted': { label: 'Отправлена', className: 'bg-blue-100 text-blue-700' },
    'data_validation': { label: 'Проверка данных', className: 'bg-blue-100 text-blue-700' },
    'data_enrichment': { label: 'Обогащение данных', className: 'bg-indigo-100 text-indigo-700' },
    'scoring': { label: 'Скоринг', className: 'bg-purple-100 text-purple-700' },
    'review': { label: 'На рассмотрении', className: 'bg-yellow-100 text-yellow-700' },
    'approved': { label: 'Одобрена', className: 'bg-green-100 text-green-700' },
    'approved_with_changes': { label: 'Одобрена (условия)', className: 'bg-green-100 text-green-700' },
    'additional_info_requested': { label: 'Нужна информация', className: 'bg-orange-100 text-orange-700' },
    'rejected': { label: 'Отказ', className: 'bg-red-100 text-red-700' },
    'documents_pending': { label: 'Оформление', className: 'bg-teal-100 text-teal-700' },
    'completed': { label: 'Завершена', className: 'bg-green-100 text-green-700' },
  };

  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export { StatusBadge };
