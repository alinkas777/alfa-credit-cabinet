import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'processing';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationSystem() {
  const { state } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const prevApplicationsRef = useState(state.applications.length)[0];

  // Отслеживаем изменения в заявках
  useEffect(() => {
    const newNotifications: Notification[] = [];

    state.applications.forEach(app => {
      const lastStatus = app.statusHistory[app.statusHistory.length - 1];
      const notificationId = `${app.id}-${lastStatus.to}-${lastStatus.timestamp}`;

      // Проверяем, есть ли уже такое уведомление
      if (!notifications.find(n => n.id === notificationId)) {
        const company = state.companies.find(c => c.id === app.companyId);
        const product = state.products.find(p => p.id === app.productId);

        let notification: Notification | null = null;

        switch (app.status) {
          case 'submitted':
            notification = {
              id: notificationId,
              type: 'info',
              title: 'Новая заявка',
              message: `${company?.name} подала заявку на "${product?.name}"`,
              timestamp: new Date(lastStatus.timestamp),
              read: false,
            };
            break;
          case 'approved':
            notification = {
              id: notificationId,
              type: 'success',
              title: 'Заявка одобрена',
              message: `${company?.name}: одобрено ${(app.decision?.approvedAmount || 0) / 1000000} млн ₽`,
              timestamp: new Date(lastStatus.timestamp),
              read: false,
            };
            break;
          case 'rejected':
            notification = {
              id: notificationId,
              type: 'warning',
              title: 'Отказ по заявке',
              message: `${company?.name}: отказ в кредитовании`,
              timestamp: new Date(lastStatus.timestamp),
              read: false,
            };
            break;
          case 'scoring':
            notification = {
              id: notificationId,
              type: 'processing',
              title: 'Скоринг завершён',
              message: `${company?.name}: оценка ${app.scoringResult?.totalScore || 0}/100`,
              timestamp: new Date(lastStatus.timestamp),
              read: false,
            };
            break;
        }

        if (notification) {
          newNotifications.push(notification);
        }
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 20));
    }
  }, [state.applications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-green-600" />;
      case 'warning': return <AlertCircle size={16} className="text-red-600" />;
      case 'info': return <Info size={16} className="text-blue-600" />;
      case 'processing': return <Clock size={16} className="text-yellow-600" />;
    }
  };

  const getBgColor = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-red-50';
      case 'info': return 'bg-blue-50';
      case 'processing': return 'bg-yellow-50';
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Уведомления</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Прочитать все
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Уведомлений пока нет
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 last:border-0 ${getBgColor(notification.type, notification.read)} hover:bg-gray-50 transition-colors cursor-pointer`}
                    onClick={() => {
                      setNotifications(prev =>
                        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                      );
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
