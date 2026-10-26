import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Clock, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { showToast } from '../ToastContainer';

interface Reminder {
  id: string;
  type: 'info' | 'warning' | 'success' | 'action';
  title: string;
  message: string;
  icon: React.ReactNode;
  delay: number; // мс до показа
  shown: boolean;
}

export function SmartReminders() {
  const { state } = useApp();
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const newReminders: Reminder[] = [];

    // Проверяем заявки в обработке
    const pendingApps = state.applications.filter(a => 
      ['submitted', 'data_validation', 'data_enrichment', 'scoring', 'review'].includes(a.status)
    );

    if (pendingApps.length > 0) {
      const oldestPending = pendingApps.reduce((oldest, app) => {
        const appTime = new Date(app.updatedAt).getTime();
        const oldestTime = new Date(oldest.updatedAt).getTime();
        return appTime < oldestTime ? app : oldest;
      });

      const hoursSinceUpdate = (Date.now() - new Date(oldestPending.updatedAt).getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate > 24) {
        newReminders.push({
          id: 'pending-24h',
          type: 'warning',
          title: 'Заявка в обработке',
          message: `Ваша заявка ожидает решения более 24 часов. Мы уже работаем над ней.`,
          icon: <Clock size={16} />,
          delay: 3000,
          shown: false,
        });
      }
    }

    // Проверяем одобренные заявки без действия
    const approvedWithoutAction = state.applications.filter(a => 
      ['approved', 'approved_with_changes'].includes(a.status)
    );

    if (approvedWithoutAction.length > 0) {
      newReminders.push({
        id: 'approved-action',
        type: 'action',
        title: 'Примите решение по заявке',
        message: `У вас есть одобренная заявка. Примите условия и подпишите договор.`,
        icon: <CheckCircle size={16} />,
        delay: 5000,
        shown: false,
      });
    }

    // Напоминание о профиле
    const company = state.companies.find(c => c.id === state.currentCompanyId);
    if (company && company.creditHistory.length === 0) {
      newReminders.push({
        id: 'no-credit-history',
        type: 'info',
        title: 'Кредитная история',
        message: `У вашей компании пока нет кредитной истории. Это может повлиять на условия кредитования.`,
        icon: <Info size={16} />,
        delay: 8000,
        shown: false,
      });
    }

    // Напоминание о высокой долговой нагрузке
    if (company) {
      const monthlyRevenue = company.revenue / 12;
      const totalPayments = company.existingLoans
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + l.monthlyPayment, 0);
      const debtRatio = totalPayments / monthlyRevenue;

      if (debtRatio > 0.3) {
        newReminders.push({
          id: 'high-debt',
          type: 'warning',
          title: 'Высокая долговая нагрузка',
          message: `Ваша долговая нагрузка ${(debtRatio * 100).toFixed(0)}%. Рассмотрите возможность погашения части кредитов.`,
          icon: <AlertCircle size={16} />,
          delay: 10000,
          shown: false,
        });
      }
    }

    // Напоминание о сезонности
    const currentMonth = new Date().getMonth();
    if ([11, 0, 1].includes(currentMonth)) { // Декабрь, Январь, Февраль
      newReminders.push({
        id: 'seasonal',
        type: 'info',
        title: 'Сезонное предложение',
        message: `В конце года банки чаще одобряют заявки. Подайте заявку сейчас!`,
        icon: <Bell size={16} />,
        delay: 15000,
        shown: false,
      });
    }

    setReminders(newReminders);

    // Показываем напоминания с задержкой
    newReminders.forEach(reminder => {
      setTimeout(() => {
        if (!reminder.shown) {
          showToast({
            type: reminder.type === 'action' ? 'success' : reminder.type === 'warning' ? 'warning' : 'info',
            title: reminder.title,
            message: reminder.message,
            duration: 7000,
          });
          setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, shown: true } : r));
        }
      }, reminder.delay);
    });
  }, [state.applications, state.currentCompanyId]);

  return null; // Компонент не рендерит UI, только показывает toast-уведомления
}
