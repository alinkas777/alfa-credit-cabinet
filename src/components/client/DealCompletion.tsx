import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CreditApplication } from '../../types';
import { ExportDocuments } from '../ExportDocuments';
import {
  CheckCircle, FileSignature, Download, Clock,
  Shield, ArrowRight, PartyPopper, Copy, Check
} from 'lucide-react';

interface Props {
  application: CreditApplication;
  onComplete: () => void;
}

type DealStep = 'review' | 'signing' | 'issued';

export function DealCompletion({ application, onComplete }: Props) {
  const { state, dispatch, getCompany, getProduct } = useApp();
  const [step, setStep] = useState<DealStep>('review');
  const [isSigning, setIsSigning] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [agreements, setAgreements] = useState({
    contract: false,
    personalData: false,
    creditHistory: false
  });

  const company = getCompany(application.companyId);
  const product = getProduct(application.productId);
  const decision = application.decision;

  // Тестовый SMS-код
  const testCode = '482913';

  if (!decision || !company || !product) return null;

  const handleSendCode = () => {
    setCodeSent(true);
    // В реальности тут был бы запрос к SMS-сервису
  };

  const handleVerifyCode = () => {
    if (smsCode === testCode) {
      setIsSigning(true);
      setTimeout(() => {
        setIsSigning(false);
        setStep('signing');
        // Переводим в статус оформления документов
        // Используем ADVANCE_APPLICATION, который переведёт approved -> documents_pending
        dispatch({ type: 'ADVANCE_APPLICATION', payload: application.id });
      }, 1500);
    }
  };

  const handleIssue = () => {
    setIsIssuing(true);
    setTimeout(() => {
      setIsIssuing(false);
      setStep('issued');
      // Финализируем заявку
      // Здесь можно было бы добавить отдельный action для завершения
    }, 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(testCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const allAgreed = agreements.contract && agreements.personalData && agreements.creditHistory;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {[
          { id: 'review', label: 'Условия', icon: CheckCircle },
          { id: 'signing', label: 'Подписание', icon: FileSignature },
          { id: 'issued', label: 'Выдано', icon: PartyPopper },
        ].map((s, idx) => {
          const stepOrder = ['review', 'signing', 'issued'];
          const currentIdx = stepOrder.indexOf(step);
          const thisIdx = stepOrder.indexOf(s.id);
          const isCompleted = thisIdx < currentIdx;
          const isCurrent = thisIdx === currentIdx;

          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-red-600 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {isCompleted ? <Check size={18} /> : <s.icon size={18} />}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  isCurrent ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>{s.label}</span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  thisIdx < currentIdx ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step: Review Conditions */}
      {step === 'review' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle size={24} /> Ваше предложение готово
            </h2>
            <p className="text-green-100 mt-1">Проверьте условия и примите решение</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Decision explanation */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Почему такие условия?</h3>
              <p className="text-sm text-blue-700">
                На основе анализа вашего бизнеса ({company.name}), финансовой отчётности и кредитной истории
                мы подготовили индивидуальное предложение. Ставка рассчитана с учётом стабильности бизнеса
                и платёжной дисциплины.
              </p>
              {decision.type === 'approved_with_changes' && (
                <p className="text-sm text-blue-700 mt-2">
                  <strong>Обратите внимание:</strong> сумма скорректирована относительно запрошенной
                  с учётом текущей долговой нагрузки.
                </p>
              )}
            </div>

            {/* Conditions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Условия кредитования</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <ConditionRow label="Кредитный продукт" value={product.name} />
                <ConditionRow label="Сумма кредита" value={`${((decision.approvedAmount || 0) / 1000000).toFixed(2)} млн ₽`} highlight />
                <ConditionRow label="Срок" value={`${decision.approvedTerm} месяцев`} />
                <ConditionRow label="Годовая ставка" value={`${decision.approvedRate}%`} highlight />
                <ConditionRow label="Цель" value={application.purpose} />
                <ConditionRow label="Заёмщик" value={company.name} />
                <ConditionRow label="ИНН" value={company.inn} />
              </div>
            </div>

            {/* Monthly payment estimate */}
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Ежемесячный платёж (аннуитет)</p>
                  <p className="text-xs text-red-500 mt-0.5">Ориентировочный расчёт</p>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  {calculateMonthlyPayment(
                    decision.approvedAmount || 0,
                    decision.approvedRate || 0,
                    decision.approvedTerm || 12
                  ).toLocaleString('ru-RU')} ₽
                </p>
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Согласия</h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.contract}
                  onChange={(e) => setAgreements({...agreements, contract: e.target.checked})}
                  className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Я ознакомлен(а) и согласен(на) с условиями кредитного договора
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.personalData}
                  onChange={(e) => setAgreements({...agreements, personalData: e.target.checked})}
                  className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Согласен(на) на обработку персональных данных
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.creditHistory}
                  onChange={(e) => setAgreements({...agreements, creditHistory: e.target.checked})}
                  className="mt-1 w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Согласен(на) на запрос кредитной истории в бюро кредитных историй
                </span>
              </label>
            </div>

            <button
              onClick={handleSendCode}
              disabled={!allAgreed}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Принять предложение <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Signing */}
      {step === 'review' && codeSent && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Подтверждение подписания</h3>
          <p className="text-sm text-gray-600 mb-4">
            Для подписания договора введите код из SMS, отправленный на номер руководителя.
          </p>
          <div className="bg-yellow-50 rounded-lg p-3 mb-4 flex items-center justify-between">
            <span className="text-xs text-yellow-700">Тестовый код для демонстрации:</span>
            <div className="flex items-center gap-2">
              <code className="text-sm font-bold text-yellow-800">{testCode}</code>
              <button onClick={handleCopyCode} className="text-yellow-600 hover:text-yellow-800">
                {codeCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              placeholder="Введите код"
              maxLength={6}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
            <button
              onClick={handleVerifyCode}
              disabled={smsCode.length < 6}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isSigning ? (
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : 'Подписать'}
            </button>
          </div>
        </div>
      )}

      {step === 'signing' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileSignature size={24} /> Договор подписан
            </h2>
            <p className="text-green-100 mt-1">Подтвердите выдачу кредитных средств</p>
          </div>

          <div className="p-6 space-y-5">
              {/* Signed documents */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Подписанные документы</h3>
                  <ExportDocuments
                    application={application}
                    companyName={company.name}
                    productName={product.name}
                  />
                </div>
                {[
                  { name: 'Кредитный договор', number: `КД-${application.id.slice(-6).toUpperCase()}` },
                  { name: 'График платежей', number: `ГП-${application.id.slice(-6).toUpperCase()}` },
                  { name: 'Согласие на обработку ПДн', number: `ПД-${application.id.slice(-6).toUpperCase()}` },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={18} className="text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.number}</p>
                      </div>
                    </div>
                    <button className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1">
                      <Download size={12} /> Скачать
                    </button>
                  </div>
                ))}
              </div>
            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Сумма к выдаче</p>
                  <p className="text-lg font-bold text-gray-900">
                    {((decision.approvedAmount || 0) / 1000000).toFixed(2)} млн ₽
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">На счёт</p>
                  <p className="text-sm font-medium text-gray-900">Расчётный счёт компании</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleIssue}
              disabled={isIssuing}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isIssuing ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Выпускаем средства...
                </>
              ) : (
                <>
                  <Shield size={18} /> Выпустить средства на счёт
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Issued */}
      {step === 'issued' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <PartyPopper size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Кредит выдан!</h2>
            <p className="text-green-100 mt-2">
              Средства зачислены на расчётный счёт компании
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Final summary */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">Итоги сделки</h3>
              <div className="space-y-2">
                <ConditionRow label="Сумма выдана" value={`${((decision.approvedAmount || 0) / 1000000).toFixed(2)} млн ₽`} highlight />
                <ConditionRow label="Дата выдачи" value={new Date().toLocaleDateString('ru-RU')} />
                <ConditionRow label="Срок" value={`${decision.approvedTerm} месяцев`} />
                <ConditionRow label="Ставка" value={`${decision.approvedRate}% годовых`} />
                <ConditionRow
                  label="Ежемесячный платёж"
                  value={`${calculateMonthlyPayment(
                    decision.approvedAmount || 0,
                    decision.approvedRate || 0,
                    decision.approvedTerm || 12
                  ).toLocaleString('ru-RU')} ₽`}
                />
                <ConditionRow label="Дата первого платежа" value={getNextMonthDate()} />
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Что дальше</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <Clock size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                  График платежей доступен в разделе «Документы»
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <Clock size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                  Платежи будут автоматически списываться с расчётного счёта
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <Clock size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                  Уведомления о предстоящих платежах будут приходить в кабинет
                </li>
              </ul>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Вернуться в кабинет
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConditionRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  );
}

function calculateMonthlyPayment(amount: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) return amount / termMonths;
  const monthlyRate = annualRate / 100 / 12;
  const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment);
}

function getNextMonthDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString('ru-RU');
}
