import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, HelpCircle } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  position: { top: string; left?: string; right?: string };
  highlight?: string;
}

export function InteractiveTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps: Step[] = [
    {
      title: 'Добро пожаловать!',
      description: 'Это интерактивный тур по кредитному кабинету. Мы покажем вам основные возможности.',
      position: { top: '50%', left: '50%' },
    },
    {
      title: 'Выбор компании',
      description: 'Здесь вы можете переключаться между своими компаниями для управления заявками.',
      position: { top: '80px', left: '20px' },
      highlight: 'select',
    },
    {
      title: 'Каталог продуктов',
      description: 'Изучите доступные кредитные продукты и выберите подходящий для вашего бизнеса.',
      position: { top: '150px', left: '50%' },
      highlight: 'products',
    },
    {
      title: 'AI-ассистент',
      description: 'Наш AI-помощник ответит на вопросы и поможет подобрать оптимальный продукт.',
      position: { top: '50%', right: '20px' },
      highlight: 'ai',
    },
    {
      title: 'Подача заявки',
      description: 'Заполните форму заявки. AI-подсказки помогут указать правильные данные.',
      position: { top: '300px', left: '50%' },
      highlight: 'form',
    },
    {
      title: 'Отслеживание статуса',
      description: 'Следите за прогрессом вашей заявки в реальном времени.',
      position: { top: '400px', left: '50%' },
      highlight: 'tracker',
    },
    {
      title: 'Переключение режимов',
      description: 'Вы можете переключиться в режим банка, чтобы увидеть процесс обработки заявки.',
      position: { top: '80px', right: '100px' },
      highlight: 'switch',
    },
    {
      title: 'Готово!',
      description: 'Тур завершён. Теперь вы знаете все основные возможности. Удачной работы!',
      position: { top: '50%', left: '50%' },
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      setIsOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsCompleted(true);
  };

  // Показываем туториал при первом посещении
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => {
        setIsOpen(true);
      }, 1000);
    }
  }, []);

  const markAsSeen = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  useEffect(() => {
    if (isCompleted) {
      markAsSeen();
    }
  }, [isCompleted]);

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setCurrentStep(0);
          setIsCompleted(false);
        }}
        className="fixed bottom-6 left-6 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all hover:scale-110 flex items-center justify-center z-50"
        title="Интерактивный тур"
      >
        <HelpCircle size={24} />
      </button>
    );
  }

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[60]" onClick={handleClose} />

      {/* Tooltip */}
      <div
        className="fixed z-[70] bg-white rounded-xl shadow-2xl p-6 max-w-md"
        style={{
          top: step.position.top,
          left: step.position.left,
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-purple-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-600 mb-6">{step.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Назад
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check size={16} />
                Завершить
              </>
            ) : (
              <>
                Далее
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Skip Link */}
        <button
          onClick={handleClose}
          className="w-full mt-3 text-xs text-gray-500 hover:text-gray-700 text-center transition-colors"
        >
          Пропустить тур
        </button>
      </div>

      {/* Highlight Element (Optional) */}
      {step.highlight && (
        <div
          className="fixed z-[65] pointer-events-none"
          style={{
            top: step.position.top,
            left: step.position.left,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-32 h-32 border-4 border-purple-500 rounded-full animate-pulse opacity-30" />
        </div>
      )}
    </>
  );
}
