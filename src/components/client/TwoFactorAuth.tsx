import { useState } from 'react';
import { Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  onVerified: () => void;
  onCancel: () => void;
}

export function TwoFactorAuth({ onVerified, onCancel }: Props) {
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Тестовый код для демонстрации
  const TEST_CODE = '123456';

  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
      setError('Введите номер телефона');
      return;
    }
    setError('');
    setStep('code');
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Имитация проверки
    setTimeout(() => {
      if (code === TEST_CODE) {
        setStep('success');
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setError('Неверный код. Попробуйте снова.');
        setIsVerifying(false);
      }
    }, 1000);
  };

  const handleResendCode = () => {
    setCode('');
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield size={32} />
          </div>
          <h2 className="text-xl font-bold">Двухфакторная аутентификация</h2>
          <p className="text-sm text-blue-100 mt-1">
            Дополнительная защита вашего аккаунта
          </p>
        </div>

        <div className="p-6">
          {/* Step 1: Phone Number */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  На этот номер будет отправлен код подтверждения
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSendCode}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Получить код
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700">
                  💡 <strong>Для демонстрации:</strong> введите любой номер телефона
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Code Verification */}
          {step === 'code' && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Код отправлен на номер
                </p>
                <p className="font-medium text-gray-900">{phoneNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код подтверждения
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {isVerifying && (
                <div className="text-center text-sm text-gray-600">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Проверяем код...
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('phone')}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={code.length !== 6 || isVerifying}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Подтвердить
                </button>
              </div>

              <button
                onClick={handleResendCode}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Отправить код повторно
              </button>

              <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-xs text-yellow-700">
                  🔑 <strong>Тестовый код:</strong> {TEST_CODE}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Аутентификация успешна!
              </h3>
              <p className="text-sm text-gray-600">
                Ваш аккаунт защищён двухфакторной аутентификацией
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
