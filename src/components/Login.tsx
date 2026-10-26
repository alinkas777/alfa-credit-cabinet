import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Lock, ArrowRight, Shield } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

export function Login({ onLogin }: Props) {
  const { state, dispatch } = useApp();
  const [selectedCompany, setSelectedCompany] = useState(state.companies[0]?.id || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedCompany) {
      setError('Выберите компанию');
      return;
    }
    // Для демо: любой пароль подходит, или пустой
    // В реальном приложении тут была бы проверка
    dispatch({ type: 'SET_COMPANY', payload: selectedCompany });
    onLogin();
  };

  const handleBankLogin = () => {
    dispatch({ type: 'SET_VIEW_MODE', payload: 'bank' });
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Умный кредитный кабинет</h1>
          <p className="text-red-200 mt-1">Для малого и микробизнеса</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Вход в систему</h2>
          <p className="text-sm text-gray-500 mb-6">
            Выберите компанию для входа в клиентский кабинет
          </p>

          {/* Company Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Компания
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCompany}
                onChange={(e) => { setSelectedCompany(e.target.value); setError(''); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none appearance-none bg-white"
              >
                {state.companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (ИНН: {c.inn})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password (demo) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Для демо оставьте пустым"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mb-4">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2 mb-3"
          >
            Войти как клиент <ArrowRight size={16} />
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">или</span>
            </div>
          </div>

          <button
            onClick={handleBankLogin}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Shield size={16} /> Войти как сотрудник банка
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Демонстрационная версия. Авторизация упрощена для проверки сценария.
          </p>
        </div>

        {/* Test accounts info */}
        <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
          <h3 className="text-sm font-medium text-white mb-2">Тестовые компании</h3>
          <ul className="space-y-1.5">
            {state.companies.map(c => (
              <li key={c.id} className="text-xs text-red-100 flex items-center justify-between">
                <span>{c.name}</span>
                <span className="text-red-200 font-mono">{c.inn}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
