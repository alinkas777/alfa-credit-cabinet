import { useState } from 'react';
import { Upload, FileText, CheckCircle, X, Loader2, Sparkles } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedData?: Record<string, string>;
}

export function DocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      const doc: Document = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || 'application/octet-stream',
        status: 'uploading',
        progress: 0,
      };

      setDocuments(prev => [...prev, doc]);

      // Имитация загрузки
      simulateUpload(doc.id);
    });
  };

  const simulateUpload = (docId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Переход к обработке
        setDocuments(prev => prev.map(d => 
          d.id === docId ? { ...d, progress: 100, status: 'processing' } : d
        ));

        // Имитация OCR обработки
        setTimeout(() => {
          simulateOCR(docId);
        }, 1500);
      } else {
        setDocuments(prev => prev.map(d => 
          d.id === docId ? { ...d, progress } : d
        ));
      }
    }, 200);
  };

  const simulateOCR = (docId: string) => {
    // Имитация извлечённых данных
    const extractedData = {
      'Выручка': `${(Math.random() * 50 + 10).toFixed(1)} млн ₽`,
      'Прибыль': `${(Math.random() * 10 + 1).toFixed(1)} млн ₽`,
      'Дата': new Date().toLocaleDateString('ru-RU'),
      'Организация': 'ООО "Пример"',
    };

    setDocuments(prev => prev.map(d => 
      d.id === docId ? { ...d, status: 'completed', extractedData } : d
    ));
  };

  const removeDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 size={16} className="text-blue-600 animate-spin" />;
      case 'processing':
        return <Sparkles size={16} className="text-purple-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'error':
        return <X size={16} className="text-red-600" />;
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'uploading': return 'Загрузка...';
      case 'processing': return 'Распознавание...';
      case 'completed': return 'Готово';
      case 'error': return 'Ошибка';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Upload size={20} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Загрузка документов</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Загрузите финансовые документы для автоматического распознавания данных
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <Upload size={48} className={`mx-auto mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <p className="text-sm font-medium text-gray-700 mb-1">
          Перетащите файлы сюда или нажмите для выбора
        </p>
        <p className="text-xs text-gray-500 mb-3">
          PDF, JPG, PNG до 10 MB
        </p>
        <label className="inline-block">
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
            Выбрать файлы
          </span>
        </label>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Загруженные документы</h4>
          {documents.map(doc => (
            <div key={doc.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText size={20} className="text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{doc.size}</p>
                  
                  {/* Progress Bar */}
                  {(doc.status === 'uploading' || doc.status === 'processing') && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{getStatusText(doc.status)}</span>
                        <span>{Math.round(doc.progress)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            doc.status === 'processing' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${doc.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(doc.status)}
                    <span className="text-xs text-gray-600">{getStatusText(doc.status)}</span>
                  </div>

                  {/* Extracted Data */}
                  {doc.status === 'completed' && doc.extractedData && (
                    <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                        <Sparkles size={12} />
                        Распознанные данные:
                      </p>
                      <div className="space-y-1">
                        {Object.entries(doc.extractedData).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-medium text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                      <button className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium">
                        Использовать эти данные →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-xs text-blue-700">
          💡 <strong>Как это работает:</strong> Система автоматически распознает финансовые показатели из загруженных документов и предложит заполнить соответствующие поля.
        </p>
      </div>
    </div>
  );
}
