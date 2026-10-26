import { newsItems } from '../../data/synthetic';
import { Newspaper, TrendingUp, Package, Gift, Info } from 'lucide-react';

const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  'rate': { icon: <TrendingUp size={14} />, color: 'bg-green-100 text-green-700' },
  'product': { icon: <Package size={14} />, color: 'bg-blue-100 text-blue-700' },
  'program': { icon: <Gift size={14} />, color: 'bg-purple-100 text-purple-700' },
  'news': { icon: <Info size={14} />, color: 'bg-gray-100 text-gray-700' },
};

export function NewsFeed() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper size={16} className="text-gray-500" />
        <h3 className="font-medium text-gray-900 text-sm">Новости для бизнеса</h3>
      </div>
      <div className="space-y-3">
        {newsItems.map(item => {
          const config = categoryConfig[item.category] || categoryConfig['news'];
          return (
            <div key={item.id} className="group cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.summary}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.date).toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
