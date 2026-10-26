import { useApp } from '../../context/AppContext';
import { Company } from '../../types';
import { Building2, Users, TrendingUp, Calendar, MapPin, FileText } from 'lucide-react';

interface Props {
  company?: Company;
  compact?: boolean;
}

export function CompanyInfo({ company: propCompany, compact }: Props) {
  const { getCurrentCompany } = useApp();
  const company = propCompany || getCurrentCompany();

  if (!company) return null;

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Building2 size={18} className="text-gray-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{company.name}</p>
            <p className="text-xs text-gray-500">ИНН {company.inn}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-400">Выручка</p>
            <p className="text-sm font-semibold text-gray-900">{(company.revenue / 1000000).toFixed(1)} млн</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <p className="text-xs text-gray-400">Сотрудники</p>
            <p className="text-sm font-semibold text-gray-900">{company.employees}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">О компании</h2>
        <p className="text-gray-500 mt-1">Данные о вашей организации</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-gray-500" />
            Основные данные
          </h3>
          <div className="space-y-3">
            <InfoRow label="Наименование" value={company.name} />
            <InfoRow label="ИНН" value={company.inn} />
            <InfoRow label="ОГРН" value={company.ogrn} />
            <InfoRow label="Тип" value={company.type === 'ooo' ? 'ООО' : 'ИП'} />
            <InfoRow label="Руководитель" value={company.director} />
            <InfoRow label="ОКВЭД" value={company.okved} />
            <InfoRow label="Адрес" value={company.address} />
            <InfoRow label="Дата регистрации" value={new Date(company.registrationDate).toLocaleDateString('ru-RU')} />
          </div>
        </div>

        {/* Financial */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-gray-500" />
            Финансовые показатели
          </h3>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Годовая выручка</p>
              <p className="text-2xl font-bold text-gray-900">{(company.revenue / 1000000).toFixed(1)} млн ₽</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Годовая прибыль</p>
              <p className={`text-2xl font-bold ${company.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(company.profit / 1000000).toFixed(1)} млн ₽
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Рентабельность</p>
              <p className={`text-2xl font-bold ${company.profit / company.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {((company.profit / company.revenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users size={14} />
              <span>{company.employees} сотрудников</span>
            </div>
          </div>
        </div>

        {/* Existing Loans */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-gray-500" />
            Текущие обязательства
          </h3>
          {company.existingLoans.length === 0 ? (
            <p className="text-sm text-gray-500">Нет активных кредитов</p>
          ) : (
            <div className="space-y-3">
              {company.existingLoans.map(loan => (
                <div key={loan.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{loan.bank}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      loan.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      loan.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {loan.status === 'active' ? 'Активен' : loan.status === 'overdue' ? 'Просрочен' : 'Закрыт'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <span>Остаток: {(loan.remainingAmount / 1000000).toFixed(2)} млн</span>
                    <span>Платёж: {(loan.monthlyPayment / 1000).toFixed(0)} тыс/мес</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Credit History */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            Кредитная история
          </h3>
          {company.creditHistory.length === 0 ? (
            <p className="text-sm text-gray-500">Кредитная история отсутствует</p>
          ) : (
            <div className="space-y-3">
              {company.creditHistory.map(entry => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{entry.bank}</p>
                    <p className="text-xs text-gray-500">
                      {(entry.amount / 1000000).toFixed(1)} млн • {new Date(entry.startDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.status === 'paid' ? 'bg-green-100 text-green-700' :
                      entry.status === 'active' ? 'bg-blue-100 text-blue-700' :
                      entry.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {entry.status === 'paid' ? 'Погашен' : entry.status === 'active' ? 'Активен' : entry.status === 'overdue' ? 'Просрочен' : 'Закрыт'}
                    </span>
                    {entry.overdueDays > 0 && (
                      <p className="text-xs text-red-500 mt-0.5">Просрочка: {entry.overdueDays} дн.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}
