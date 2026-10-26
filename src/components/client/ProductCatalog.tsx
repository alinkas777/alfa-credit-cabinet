import { useApp } from '../../context/AppContext';
import { TrendingUp, RefreshCw, Zap, Repeat, ArrowRight } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'trending-up': <TrendingUp size={24} />,
  'refresh-cw': <RefreshCw size={24} />,
  'zap': <Zap size={24} />,
  'repeat': <Repeat size={24} />,
};

interface Props {
  onSelect: (productId: string) => void;
}

export function ProductCatalog({ onSelect }: Props) {
  const { state } = useApp();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Кредитные продукты</h2>
        <p className="text-gray-500 mt-1">Выберите подходящий продукт для вашего бизнеса</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {state.products.map(product => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-red-200 transition-all group cursor-pointer"
            onClick={() => onSelect(product.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                {iconMap[product.icon]}
              </div>
              <ArrowRight size={20} className="text-gray-300 group-hover:text-red-600 transition-colors" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{product.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-400">Сумма</p>
                <p className="text-sm font-medium text-gray-900">
                  {(product.minAmount / 1000000).toFixed(1)} – {(product.maxAmount / 1000000).toFixed(0)} млн ₽
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Срок</p>
                <p className="text-sm font-medium text-gray-900">
                  {product.minTerm} – {product.maxTerm} мес.
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ставка от</p>
                <p className="text-sm font-medium text-red-600">{product.rateFrom}% годовых</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-2">Требования:</p>
              <ul className="space-y-1">
                {product.requirements.map((req, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
