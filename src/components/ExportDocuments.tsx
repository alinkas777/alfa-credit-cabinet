import { CreditApplication } from '../types';
import { Download } from 'lucide-react';

interface Props {
  application: CreditApplication;
  companyName: string;
  productName: string;
}

export function ExportDocuments({ application, companyName, productName }: Props) {
  const handleExportContract = () => {
    const decision = application.decision;
    if (!decision) return;

    const contractHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Кредитный договор ${application.id}</title>
        <style>
          body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
          h1 { text-align: center; font-size: 18px; }
          h2 { font-size: 14px; margin-top: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin: 15px 0; }
          .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; }
          .signature { margin-top: 50px; display: flex; justify-content: space-between; }
          .sig-block { width: 45%; }
          .sig-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>КРЕДИТНЫЙ ДОГОВОР № ${application.id.slice(-8).toUpperCase()}</h1>
          <p>г. Москва &nbsp;&nbsp;&nbsp; ${new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <p>
          <strong>АО «Альфа-Банк»</strong>, именуемое в дальнейшем «Банк», в лице уполномоченного представителя, 
          с одной стороны, и <strong>${companyName}</strong> (ИНН: ${application.companyId}), 
          именуемое в дальнейшем «Заёмщик», с другой стороны, заключили настоящий договор о нижеследующем:
        </p>

        <h2>1. ПРЕДМЕТ ДОГОВОРА</h2>
        <div class="section">
          <p>1.1. Банк обязуется предоставить Заёмщику кредит в размере и на условиях, указанных в настоящем договоре.</p>
          <p>1.2. Заёмщик обязуется возвратить полученную сумму кредита и уплатить проценты за его использование.</p>
        </div>

        <h2>2. УСЛОВИЯ КРЕДИТОВАНИЯ</h2>
        <div class="section">
          <div class="row"><span class="label">Кредитный продукт:</span><span>${productName}</span></div>
          <div class="row"><span class="label">Сумма кредита:</span><span>${((decision.approvedAmount || 0) / 1000000).toFixed(2)} млн ₽</span></div>
          <div class="row"><span class="label">Срок кредита:</span><span>${decision.approvedTerm} месяцев</span></div>
          <div class="row"><span class="label">Годовая процентная ставка:</span><span>${decision.approvedRate}%</span></div>
          <div class="row"><span class="label">Цель кредитования:</span><span>${application.purpose}</span></div>
          <div class="row"><span class="label">Дата заключения:</span><span>${new Date().toLocaleDateString('ru-RU')}</span></div>
        </div>

        <h2>3. ПОРЯДОК ПРЕДОСТАВЛЕНИЯ КРЕДИТА</h2>
        <div class="section">
          <p>3.1. Банк предоставляет кредит путём перечисления денежных средств на расчётный счёт Заёмщика.</p>
          <p>3.2. Заёмщик вправе использовать кредитные средства в соответствии с заявленной целью.</p>
        </div>

        <h2>4. ПОРЯДОК ВОЗВРАТА КРЕДИТА</h2>
        <div class="section">
          <p>4.1. Заёмщик возвращает кредит путём ежемесячных аннуитетных платежей.</p>
          <p>4.2. Дата ежемесячного платежа — число, соответствующее дате заключения договора.</p>
        </div>

        <h2>5. ОТВЕТСТВЕННОСТЬ СТОРОН</h2>
        <div class="section">
          <p>5.1. В случае нарушения Заёмщиком сроков возврата кредита Банк вправе начислить неустойку в размере 20% годовых от суммы задолженности.</p>
        </div>

        <h2>6. ПОДПИСИ СТОРОН</h2>
        <div class="signature">
          <div class="sig-block">
            <strong>БАНК:</strong><br>
            АО «Альфа-Банк»<br>
            <div class="sig-line">Уполномоченный представитель</div>
          </div>
          <div class="sig-block">
            <strong>ЗАЁМЩИК:</strong><br>
            ${companyName}<br>
            <div class="sig-line">Руководитель</div>
          </div>
        </div>

        <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #666;">
          <p>Документ сформирован автоматически в системе «Умный кредитный кабинет»</p>
          <p>Идентификатор заявки: ${application.id}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(contractHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleExportSchedule = () => {
    const decision = application.decision;
    if (!decision) return;

    const amount = decision.approvedAmount || 0;
    const rate = (decision.approvedRate || 0) / 100 / 12;
    const term = decision.approvedTerm || 12;
    const monthlyPayment = amount * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);

    let scheduleHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>График платежей</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
          h1 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          tr:nth-child(even) { background-color: #fafafa; }
          .total { font-weight: bold; background-color: #fff3cd; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>ГРАФИК ПЛАТЕЖЕЙ</h1>
        <p>Кредитный договор № ${application.id.slice(-8).toUpperCase()}</p>
        <p>Заёмщик: ${companyName}</p>
        <p>Сумма кредита: ${(amount / 1000000).toFixed(2)} млн ₽ | Ставка: ${decision.approvedRate}% | Срок: ${term} мес.</p>
        
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Дата платежа</th>
              <th>Основной долг</th>
              <th>Проценты</th>
              <th>Ежемесячный платёж</th>
              <th>Остаток долга</th>
            </tr>
          </thead>
          <tbody>
    `;

    let remainingDebt = amount;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() + 1);

    for (let i = 1; i <= term; i++) {
      const interest = remainingDebt * rate;
      const principal = monthlyPayment - interest;
      remainingDebt -= principal;

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i - 1);

      scheduleHtml += `
        <tr>
          <td>${i}</td>
          <td>${paymentDate.toLocaleDateString('ru-RU')}</td>
          <td>${Math.round(principal).toLocaleString('ru-RU')} ₽</td>
          <td>${Math.round(interest).toLocaleString('ru-RU')} ₽</td>
          <td>${Math.round(monthlyPayment).toLocaleString('ru-RU')} ₽</td>
          <td>${Math.max(0, Math.round(remainingDebt)).toLocaleString('ru-RU')} ₽</td>
        </tr>
      `;
    }

    scheduleHtml += `
          <tr class="total">
            <td colspan="4">ИТОГО:</td>
            <td>${Math.round(monthlyPayment * term).toLocaleString('ru-RU')} ₽</td>
            <td>0 ₽</td>
          </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(scheduleHtml);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportContract}
        className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Download size={12} /> Договор
      </button>
      <button
        onClick={handleExportSchedule}
        className="flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
      >
        <Download size={12} /> График платежей
      </button>
    </div>
  );
}
