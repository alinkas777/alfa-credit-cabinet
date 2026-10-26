import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, Send, X, User, Clock } from 'lucide-react';

interface Message {
  id: string;
  role: 'client' | 'analyst';
  content: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export function AnalystChat() {
  const { state, getCurrentCompany } = useApp();
  const [isOpen, setIsOpen] = useState(true); // Открыт по умолчанию
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'analyst',
      content: 'Здравствуйте! Я аналитик банка. Готов помочь вам с любыми вопросами о кредитных продуктах и процессе подачи заявки. Чем могу помочь?',
      timestamp: new Date(),
      status: 'delivered',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const company = getCurrentCompany();
  const currentApplication = state.applications.find(a => a.companyId === state.currentCompanyId);

  const analystResponses = [
    'Здравствуйте! Чем могу помочь? Готов ответить на вопросы о кредитных продуктах и процессе подачи заявки.',
    'Рад помочь! Уточните, какой кредитный продукт вас интересует?',
    'Понял ваш вопрос. Для более точного ответа расскажите подробнее о целях финансирования.',
    'Отлично! Рекомендую рассмотреть наши продукты. Могу помочь с выбором оптимального варианта.',
    'Спасибо за интерес! Наши специалисты готовы помочь с оформлением заявки.',
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const clientMessage: Message = {
      id: Date.now().toString(),
      role: 'client',
      content: input,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, clientMessage]);
    setInput('');
    setIsTyping(true);

    // Имитация ответа аналитика
    setTimeout(() => {
      const response = analystResponses[Math.floor(Math.random() * analystResponses.length)];
      const analystMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'analyst',
        content: response,
        timestamp: new Date(),
        status: 'delivered',
      };
      setMessages(prev => [...prev, analystMessage]);
      setIsTyping(false);
    }, 2000 + Math.random() * 2000);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 left-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all flex items-center justify-center z-50 group"
          title="Чат с аналитиком"
        >
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
          <MessageCircle size={28} className="relative z-10" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="w-2 h-2 bg-white rounded-full"></span>
          </span>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Чат с аналитиком
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Аналитик банка</h3>
                <p className="text-xs text-blue-100">Онлайн • Отвечает в течение 5 мин</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Начните диалог с аналитиком</p>
                <p className="text-xs text-gray-400 mt-1">Задайте вопрос по вашей заявке</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'client'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${
                    msg.role === 'client' ? 'justify-end' : 'justify-start'
                  }`}>
                    <Clock size={10} />
                    <span className="text-xs opacity-70">
                      {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === 'client' && msg.status === 'read' && (
                      <span className="text-xs">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Напишите сообщение..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
