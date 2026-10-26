import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ClientDashboard } from './components/ClientDashboard';
import { BankDashboard } from './components/BankDashboard';
import { Login } from './components/Login';
import { ViewMode } from './types';
import { Building2, Shield, LogOut } from 'lucide-react';

function AppContent() {
  const { state, dispatch } = useApp();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Умный кредитный кабинет</h1>
                <p className="text-xs text-gray-500">Альфа-Банк • Для бизнеса</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Switch */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'client' as ViewMode })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    state.viewMode === 'client'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Building2 size={16} />
                  Предприниматель
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: 'bank' as ViewMode })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    state.viewMode === 'bank'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Shield size={16} />
                  Банк
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={() => setIsLoggedIn(false)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Выйти"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {state.viewMode === 'client' ? <ClientDashboard /> : <BankDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
