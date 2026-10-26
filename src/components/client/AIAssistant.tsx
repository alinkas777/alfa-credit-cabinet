import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, Send, X, Bot, User, Sparkles } from 'lucide-react';
import { creditProducts } from '../../data/synthetic';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  const { state, getCurrentCompany } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Здравствуйте! Я AI-ассистент кредитного кабинета. Помогу подобрать оптимальный продукт для вашего бизнеса. Чем могу помочь?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const company = getCurrentCompany();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Анализ потребностей
    if (lowerMessage.includes('купить') || lowerMessage.includes('оборудован') || lowerMessage.includes('развит')) {
      return `Для развития бизнеса рекомендую рассмотреть "Кредит на развитие бизнеса". Сумма до 30 млн ₽, срок до 60 месяцев, ставка от 12.9%.\n\nДля вашей компании (${company?.name}) с выручкой ${((company?.revenue || 0) / 1000000).toFixed(1)} млн ₽ это оптимальный вариант. Хотите подать заявку?`;
    }
    
    if (lowerMessage.includes('оборот') || lowerMessage.includes('кассов') || lowerMessage.includes('закупк')) {
      return `Для пополнения оборотных средств подойдёт соответствующий продукт. Сумма до 10 млн ₽, срок до 24 месяцев, ставка от 14.5%.\n\nБыстрое одобрение, минимум документов. Рассчитать примерный платёж?`;
    }
    
    if (lowerMessage.includes('быстр') || lowerMessage.includes('срочн')) {
      return `Если нужны деньги срочно, рекомендую овердрафт. Лимит до 5 млн ₽, подключение за 1 день, ставка от 16%.\n\nУдобно для кассовых разрывов. Показать условия подробнее?`;
    }
    
    if (lowerMessage.includes('рефинанс') || lowerMessage.includes('другой банк') || lowerMessage.includes('объединить')) {
      return `Программа рефинансирования позволит объединить кредиты других банков. Ставка от 11.9%, сумма до 20 млн ₽.\n\nВижу, у вас есть кредиты в других банках. Могу рассчитать выгоду рефинансирования.`;
    }
    
    if (lowerMessage.includes('ставк') || lowerMessage.includes('процент') || lowerMessage.includes('сколько')) {
      return `Ставки зависят от продукта и вашего профиля:\n\n• Кредит на развитие: 12.9-24.9%\n• Оборотные средства: 14.5-26.9%\n• Овердрафт: 16-29.9%\n• Рефинансирование: 11.9-22.9%\n\nИтоговая ставка определяется после скоринга. Для вашей компании ожидаемая ставка: ${calculateExpectedRate()}%`;
    }
    
    if (lowerMessage.includes('документ') || lowerMessage.includes('какие нужны') || lowerMessage.includes('что нужно')) {
      return `Для подачи заявки потребуются:\n\n✓ Данные компании (загрузятся автоматически)\n✓ Цель финансирования\n✓ Сумма и срок\n\nДополнительные документы (выписки, отчётность) запрашиваются только для сложных случаев. Начать оформление?`;
    }
    
    if (lowerMessage.includes('сколько могу') || lowerMessage.includes('какую сумм') || lowerMessage.includes('лимит')) {
      const maxAmount = calculateMaxAmount();
      return `На основе анализа вашего бизнеса (${company?.name}), ориентировочный лимит кредитования: до ${maxAmount} млн ₽.\n\nТочная сумма определяется после скоринга. Хотите рассчитать для конкретной суммы?`;
    }
    
    if (lowerMessage.includes('привет') || lowerMessage.includes('здравств') || lowerMessage.includes('добр')) {
      return `Здравствуйте! Рад помочь. Вижу, вы представляете ${company?.name}. Какой кредитный продукт вас интересует?`;
    }
    
    if (lowerMessage.includes('помощь') || lowerMessage.includes('помоги') || lowerMessage.includes('что умеешь')) {
      return `Я могу помочь с:\n\n• Подбором кредитного продукта\n• Расчётом платежей\n• Объяснением условий\n• Ответами на вопросы о процессе\n\nПросто опишите вашу ситуацию или задайте вопрос!`;
    }
    
    // Дефолтный ответ
    return `Понял ваш вопрос. Для более точного ответа уточните, пожалуйста:\n\n• Какая цель финансирования?\n• Какая сумма нужна?\n• На какой срок?\n\nИли выберите продукт из каталога — я помогу с оформлением.`;
  };

  const calculateExpectedRate = (): string => {
    if (!company) return '15-20';
    const profitability = company.profit / company.revenue;
    if (profitability > 0.1) return '13-16';
    if (profitability > 0.05) return '16-20';
    return '20-25';
  };

  const calculateMaxAmount = (): number => {
    if (!company) return 5;
    const revenueMillions = company.revenue / 1000000;
    return Math.round(revenueMillions * 0.5); // до 50% от выручки
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Имитация задержки ответа
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const quickQuestions = [
    'Какой продукт выбрать?',
    'Какие документы нужны?',
    'Какая ставка?',
    'Сколько могу получить?'
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all hover:scale-110 flex items-center justify-center z-50"
          title="AI-ассистент"
        >
          <MessageCircle size={24} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-semibold">AI-ассистент</h3>
                <p className="text-xs text-red-100">Онлайн</p>
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-red-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
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
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Задайте вопрос..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
