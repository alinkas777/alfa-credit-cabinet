import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationAssistant } from './ApplicationAssistant';
import { ArrowLeft, Calculator, Info } from 'lucide-react';

interface Props {
  productId: string;
  onCreated: (appId: string) => void;
  onCancel: () => void;
}

export function ApplicationForm({ productId, onCreated, onCancel }: Props) {
  const { state, dispatch, getCurrentCompany } = useApp();
  const product = state.products.find(p => p.id === productId);
  const company = getCurrentCompany();
  const appIdRef = useRef<string>(`app-${Date.now()}`);

  const [amount, setAmount] = useState(product?.minAmount || 1000000);
  const [term, setTerm] = useState(product?.minTerm || 6);
  const [purpose, setPurpose] = useState('');
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product || !company) return null;

  // Расчёт примерного платежа
  const monthlyRate = (product.rateFrom / 100) / 12;
  const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    const appId = appIdRef.current;

    // Создаём заявку
    dispatch({
      type: 'CREATE_APPLICATION',
      payload: {
        id: appId,
        companyId: company.id,
        productId: product.id,
        amount,
        term,
        purpose
      }
    });

    // Отправляем заявку (с задержкой чтобы state обновился)
    setTimeout(() => {
      dispatch({ type: 'SUBMIT_APPLICATION', payload: appId });
      
      // Автоматически запускаем конвейер обработки
      setTimeout(() => {
        dispatch({ type: 'ADVANCE_APPLICATION', payload: appId });
      }, 500);
      setTimeout(() => {
        dispatch({ type: 'ADVANCE_APPLICATION', payload: appId });
      }, 1000);
      setTimeout(() => {
        dispatch({ type: 'ADVANCE_APPLICATION', payload: appId });
      }, 1500);
      setTimeout(() => {
        dispatch({ type: 'RUN_SCORING', payload: appId });
        onCreated(appId);
      }, 2000);
    }, 300);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={onCancel} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 text-sm">
        <ArrowLeft size={16} /> Назад к продуктам
      </button>

      {/* AI Assistant */}
      <ApplicationAssistant
        currentStep={step}
        amount={amount}
        term={term}
        purpose={purpose}
        onSuggestion={(suggestion) => {
          if (suggestion.amount) setAmount(suggestion.amount);
          if (suggestion.term) setTerm(suggestion.term);
          if (suggestion.purpose) setPurpose(suggestion.purpose);
        }}
      />

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <p className="text-red-100 text-sm mt-1">{product.description}</p>
        </div>

        {/* Steps */}
        <div className="flex border-b border-gray-200">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${
                step >= s ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400'
              }`}
            >
              {s === 1 ? 'Параметры' : s === 2 ? 'Цель' : 'Подтверждение'}
            </div>
          ))}
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сумма кредита
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min={product.minAmount}
                    max={product.maxAmount}
                    step={100000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">{(product.minAmount / 1000000).toFixed(1)} млн</span>
                    <span className="text-xs text-gray-400">{(product.maxAmount / 1000000).toFixed(0)} млн</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(product.minAmount, Math.min(product.maxAmount, Number(e.target.value))))}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-lg font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                  <span className="text-gray-500 font-medium">₽</span>
                </div>
              </div>

              {/* Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Срок кредита
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min={product.minTerm}
                    max={product.maxTerm}
                    step={1}
                    value={term}
                    onChange={(e) => setTerm(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-400">{product.minTerm} мес.</span>
                    <span className="text-xs text-gray-400">{product.maxTerm} мес.</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    value={term}
                    onChange={(e) => setTerm(Math.max(product.minTerm, Math.min(product.maxTerm, Number(e.target.value))))}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-lg font-semibold focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                  <span className="text-gray-500 font-medium">мес.</span>
                </div>
              </div>

              {/* Calculator */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Предварительный расчёт</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Ставка от</p>
                    <p className="text-lg font-bold text-gray-900">{product.rateFrom}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Платёж от</p>
                    <p className="text-lg font-bold text-red-600">
                      {(monthlyPayment / 1000).toFixed(0)} тыс ₽/мес
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Далее
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цель финансирования
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Опишите, на какие цели вам необходимо финансирование..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 h-32 resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
                <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Данные о компании</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Информация о вашей компании ({company.name}) будет автоматически загружена из профиля.
                    Дополнительные данные будут получены из ЕГРЮЛ, БКИ и ФНС.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!purpose.trim()}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Далее
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Проверьте данные заявки</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Продукт</span>
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Сумма</span>
                  <span className="text-sm font-medium text-gray-900">{(amount / 1000000).toFixed(2)} млн ₽</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Срок</span>
                  <span className="text-sm font-medium text-gray-900">{term} месяцев</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Компания</span>
                  <span className="text-sm font-medium text-gray-900">{company.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Цель</span>
                  <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{purpose}</span>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4">
                <p className="text-xs text-yellow-800">
                  Нажимая «Отправить заявку», вы соглашаетесь на обработку персональных данных и передачу
                  информации в бюро кредитных историй.
                </p>
              </div>

              {isSubmitting ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Обработка заявки...</p>
                  <p className="text-xs text-gray-400 mt-1">Проверка данных, скоринг, принятие решения</p>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    Отправить заявку
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
