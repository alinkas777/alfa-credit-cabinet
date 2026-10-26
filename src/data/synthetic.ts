import { CreditProduct, Company, CreditApplication, NewsItem } from '../types';

export const creditProducts: CreditProduct[] = [
  {
    id: 'prod-1',
    name: 'Кредит на развитие бизнеса',
    description: 'Финансирование для масштабирования: оборудование, новые направления, расширение',
    minAmount: 500000,
    maxAmount: 30000000,
    minTerm: 6,
    maxTerm: 60,
    rateFrom: 12.9,
    rateTo: 24.9,
    icon: 'trending-up',
    category: 'investment',
    requirements: ['Бизнес от 6 месяцев', 'Выручка от 3 млн/год', 'Без просрочек']
  },
  {
    id: 'prod-2',
    name: 'Пополнение оборотных средств',
    description: 'Короткие деньги для текущих операций: закупки, сезонность, кассовые разрывы',
    minAmount: 300000,
    maxAmount: 10000000,
    minTerm: 3,
    maxTerm: 24,
    rateFrom: 14.5,
    rateTo: 26.9,
    icon: 'refresh-cw',
    category: 'working_capital',
    requirements: ['Бизнес от 3 месяцев', 'Выручка от 1 млн/год']
  },
  {
    id: 'prod-3',
    name: 'Овердрафт',
    description: 'Быстрый доступ к деньгам при кассовых разрывах. Лимит на расчётный счёт',
    minAmount: 100000,
    maxAmount: 5000000,
    minTerm: 1,
    maxTerm: 12,
    rateFrom: 16.0,
    rateTo: 29.9,
    icon: 'zap',
    category: 'overdraft',
    requirements: ['Расчётный счёт в Альфа-Банке', 'Оборот от 500 тыс/мес']
  },
  {
    id: 'prod-4',
    name: 'Рефинансирование',
    description: 'Объедините кредиты других банков в один с выгодной ставкой',
    minAmount: 500000,
    maxAmount: 20000000,
    minTerm: 12,
    maxTerm: 60,
    rateFrom: 11.9,
    rateTo: 22.9,
    icon: 'repeat',
    category: 'refinancing',
    requirements: ['Действующие кредиты в других банках', 'Без текущих просрочек', 'Бизнес от 12 мес.']
  }
];

export const companies: Company[] = [
  {
    id: 'company-1',
    name: 'ООО "ТехноСервис Плюс"',
    inn: '7712345678',
    ogrn: '1177746123456',
    okved: '62.01 - Разработка компьютерного программного обеспечения',
    registrationDate: '2019-03-15',
    address: 'г. Москва, ул. Ленина, д. 42, оф. 301',
    director: 'Иванов Пётр Сергеевич',
    type: 'ooo',
    revenue: 18500000,
    profit: 3200000,
    employees: 15,
    existingLoans: [
      {
        id: 'loan-1',
        bank: 'Сбербанк',
        amount: 2000000,
        remainingAmount: 800000,
        monthlyPayment: 185000,
        status: 'active'
      }
    ],
    creditHistory: [
      {
        id: 'ch-1',
        bank: 'Сбербанк',
        amount: 2000000,
        startDate: '2023-01-15',
        endDate: '2025-01-15',
        overdueDays: 0,
        status: 'active'
      },
      {
        id: 'ch-2',
        bank: 'ВТБ',
        amount: 500000,
        startDate: '2021-06-01',
        endDate: '2022-06-01',
        overdueDays: 0,
        status: 'paid'
      }
    ]
  },
  {
    id: 'company-2',
    name: 'ИП Козлова Анна Михайловна',
    inn: '772345678901',
    ogrn: '320774600123456',
    okved: '47.91 - Торговля розничная через интернет',
    registrationDate: '2020-08-20',
    address: 'г. Москва, ул. Пушкина, д. 10, кв. 55',
    director: 'Козлова Анна Михайловна',
    type: 'ip',
    revenue: 6200000,
    profit: 890000,
    employees: 3,
    existingLoans: [],
    creditHistory: [
      {
        id: 'ch-3',
        bank: 'Тинькофф',
        amount: 300000,
        startDate: '2022-03-01',
        endDate: '2022-09-01',
        overdueDays: 5,
        status: 'paid'
      }
    ]
  },
  {
    id: 'company-3',
    name: 'ООО "СтройМастер"',
    inn: '7734567890',
    ogrn: '1157746987654',
    okved: '41.20 - Строительство жилых и нежилых зданий',
    registrationDate: '2015-11-10',
    address: 'г. Москва, ул. Строителей, д. 8',
    director: 'Петров Алексей Николаевич',
    type: 'ooo',
    revenue: 85000000,
    profit: 12000000,
    employees: 45,
    existingLoans: [
      {
        id: 'loan-2',
        bank: 'Альфа-Банк',
        amount: 15000000,
        remainingAmount: 9500000,
        monthlyPayment: 650000,
        status: 'active'
      },
      {
        id: 'loan-3',
        bank: 'Газпромбанк',
        amount: 5000000,
        remainingAmount: 2100000,
        monthlyPayment: 420000,
        status: 'active'
      }
    ],
    creditHistory: [
      {
        id: 'ch-4',
        bank: 'Альфа-Банк',
        amount: 15000000,
        startDate: '2023-06-01',
        endDate: '2028-06-01',
        overdueDays: 0,
        status: 'active'
      },
      {
        id: 'ch-5',
        bank: 'Газпромбанк',
        amount: 5000000,
        startDate: '2024-01-15',
        endDate: '2027-01-15',
        overdueDays: 0,
        status: 'active'
      },
      {
        id: 'ch-6',
        bank: 'Сбербанк',
        amount: 8000000,
        startDate: '2018-03-01',
        endDate: '2021-03-01',
        overdueDays: 0,
        status: 'paid'
      }
    ]
  },
  {
    id: 'company-4',
    name: 'ООО "ФудДеливери"',
    inn: '7745678901',
    ogrn: '122774600567890',
    okved: '56.10 - Деятельность ресторанов и услуги по доставке продуктов питания',
    registrationDate: '2022-02-14',
    address: 'г. Москва, ул. Тверская, д. 15',
    director: 'Сидорова Мария Игоревна',
    type: 'ooo',
    revenue: 4800000,
    profit: -200000,
    employees: 8,
    existingLoans: [
      {
        id: 'loan-4',
        bank: 'Тинькофф',
        amount: 1000000,
        remainingAmount: 750000,
        monthlyPayment: 95000,
        status: 'active'
      }
    ],
    creditHistory: [
      {
        id: 'ch-7',
        bank: 'Тинькофф',
        amount: 1000000,
        startDate: '2024-01-01',
        endDate: '2025-01-01',
        overdueDays: 12,
        status: 'active'
      }
    ]
  }
];

export const initialApplications: CreditApplication[] = [
  {
    id: 'app-demo-1',
    companyId: 'company-3',
    productId: 'prod-1',
    requestedAmount: 10000000,
    requestedTerm: 36,
    purpose: 'Закупка строительной техники и расширение парка оборудования',
    status: 'review',
    createdAt: '2026-07-08T10:30:00.000Z',
    updatedAt: '2026-07-10T14:20:00.000Z',
    statusHistory: [
      { from: 'draft', to: 'draft', timestamp: '2026-07-08T10:30:00.000Z', comment: 'Заявка создана', actor: 'client' },
      { from: 'draft', to: 'submitted', timestamp: '2026-07-08T10:31:00.000Z', comment: 'Заявка отправлена на рассмотрение', actor: 'client' },
      { from: 'submitted', to: 'data_validation', timestamp: '2026-07-08T10:32:00.000Z', comment: 'Данные проверены на полноту и корректность', actor: 'system' },
      { from: 'data_validation', to: 'data_enrichment', timestamp: '2026-07-08T10:33:00.000Z', comment: 'Получены данные из ЕГРЮЛ, БКИ и ФНС', actor: 'system' },
      { from: 'data_enrichment', to: 'scoring', timestamp: '2026-07-08T10:34:00.000Z', comment: 'Скоринговая оценка завершена', actor: 'system' },
      { from: 'scoring', to: 'review', timestamp: '2026-07-09T09:00:00.000Z', comment: 'Заявка передана на рассмотрение аналитику', actor: 'system' },
    ],
    scoringResult: {
      totalScore: 78,
      riskLevel: 'low',
      factors: [
        { name: 'Возраст бизнеса', value: '10 лет', impact: 8, description: 'Стабильный бизнес старше 3 лет' },
        { name: 'Рентабельность', value: '14.1%', impact: 4, description: 'Умеренная рентабельность' },
        { name: 'Долговая нагрузка', value: '13%', impact: 7, description: 'Низкая долговая нагрузка' },
        { name: 'Кредитная история', value: 'Без просрочек', impact: 8, description: 'Идеальная платёжная дисциплина' },
        { name: 'Сумма/Выручка', value: '12%', impact: 5, description: 'Запрашиваемая сумма адекватна выручке' },
        { name: 'Масштаб бизнеса', value: '85 млн ₽', impact: 5, description: 'Крупный бизнес — стабильность' },
      ],
      recommendation: 'approve'
    }
  },
  {
    id: 'app-demo-2',
    companyId: 'company-1',
    productId: 'prod-2',
    requestedAmount: 3000000,
    requestedTerm: 12,
    purpose: 'Пополнение оборотных средств для выполнения контракта',
    status: 'data_enrichment',
    createdAt: '2026-07-10T08:15:00.000Z',
    updatedAt: '2026-07-10T08:17:00.000Z',
    statusHistory: [
      { from: 'draft', to: 'draft', timestamp: '2026-07-10T08:15:00.000Z', comment: 'Заявка создана', actor: 'client' },
      { from: 'draft', to: 'submitted', timestamp: '2026-07-10T08:16:00.000Z', comment: 'Заявка отправлена на рассмотрение', actor: 'client' },
      { from: 'submitted', to: 'data_validation', timestamp: '2026-07-10T08:16:30.000Z', comment: 'Данные проверены на полноту и корректность', actor: 'system' },
      { from: 'data_validation', to: 'data_enrichment', timestamp: '2026-07-10T08:17:00.000Z', comment: 'Получены данные из ЕГРЮЛ, БКИ и ФНС', actor: 'system' },
    ]
  }
];

export const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Снижены ставки по кредитам на развитие',
    summary: 'Для компаний в сфере IT и производства ставки снижены на 1-2 п.п. до конца квартала.',
    date: '2026-07-10',
    category: 'rate',
    relevantFor: ['investment', 'working_capital']
  },
  {
    id: 'news-2',
    title: 'Новая программа для микробизнеса',
    summary: 'Запустите бизнес с поддержкой: кредит до 500 000 ₽ без залога на 12 месяцев.',
    date: '2026-07-08',
    category: 'product',
    relevantFor: ['working_capital', 'overdraft']
  },
  {
    id: 'news-3',
    title: 'Государственная субсидия на цифровизацию',
    summary: 'Получите до 1 млн ₽ на внедрение цифровых решений. Кредит под 5% годовых.',
    date: '2026-07-05',
    category: 'program',
    relevantFor: ['investment']
  },
  {
    id: 'news-4',
    title: 'Кешбэк 2% на бизнес-карту',
    summary: 'Повышенный кешбэк на АЗС, рекламу и облачные сервисы до 30 сентября.',
    date: '2026-07-03',
    category: 'news',
    relevantFor: ['working_capital', 'overdraft', 'investment', 'refinancing']
  }
];
