import React, { useRef } from 'react';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { CartItem, OrderCustomerInfo, Product } from '../../types';
import { formatToman, formatWeight, toPersianDigits } from '../../utils/persian';
import { X, Printer, ShieldCheck, Download, Share2, Check, MessageCircle, AlertCircle } from 'lucide-react';
import { Logo } from '../common/Logo';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customer?: Partial<OrderCustomerInfo>;
  isDraft?: boolean;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  items,
  customer,
  isDraft = true
}) => {
  const { generateInvoice, pricingConfig } = useGoldPrice();
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || items.length === 0) return null;

  // Uses the exact same central pricing engine
  const invoice = generateInvoice(items, customer, isDraft);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `✨ پیش‌فاکتور شفاف طلا و جواهر میوان (meyvan.ir) ✨\n` +
      `شماره فاکتور: ${invoice.invoiceNumber}\n` +
      `تاریخ: ${invoice.issuedAtFa}\n` +
      `نرخ مبنای ۱۸ عیار: ${invoice.goldReferencePrice.toLocaleString('fa-IR')} تومان\n` +
      `تعداد اقلام: ${items.length}\n` +
      `وزن کل طلا: ${invoice.totals.totalWeightGrams} گرم\n` +
      `مبلغ کل نهایی: ${invoice.totals.totalPayable.toLocaleString('fa-IR')} تومان\n` +
      `خریدار: ${invoice.customer.fullName}\n\n` +
      `جهت تایید نهایی و واریز به گالری میوان ارسال شد.`
    );
    window.open(`https://wa.me/+989132560616?text=${text}`, '_blank');
  };

  const handleCopySummary = () => {
    const summary = `پیش‌فاکتور میوان #${invoice.invoiceNumber} | مبلغ نهایی: ${formatToman(invoice.totals.totalPayable)}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E5DED2] text-[#0B0F14] my-4 sm:my-8 print:border-none print:shadow-none print:m-0 print:max-w-full">
        
        {/* Modal Top Actions Bar (Hidden on print) */}
        <div className="bg-[#0B080F] text-white p-4 flex items-center justify-between border-b border-[#D4AF37]/30 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-serif-luxury text-sm sm:text-base font-semibold">
                {isDraft ? 'پیش‌فاکتور رسمی و شفاف میوان' : 'فاکتور قطعی فروش طلا'}
              </h3>
              <p className="text-[11px] text-[#A89B8A]">
                محاسبه شده با موتور مرکزی قیمت‌گذاری و ضرایب مصوب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B080F] font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              title="چاپ یا ذخیره PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">چاپ / دانلود PDF</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-300 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              title="ارسال فاکتور به واتساپ گالری"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="hidden sm:inline">ارسال به واتساپ</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 text-xs bg-[#FCFAF7] print:bg-white">
          
          {/* Invoice Document Header */}
          <div className="border-b-2 border-[#0B080F] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <Logo variant="emblem" size="sm" />
              <div>
                <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#0B080F]">
                  گالری طلا و جواهر میوان (MEYVAN)
                </h1>
                <p className="text-[10px] sm:text-xs text-[#77716A] mt-0.5 font-serif-luxury tracking-wider">
                  MEYVAN GOLD &amp; JEWELRY · YAZD · SHAPING TIMELESS BEAUTY
                </p>
                <p className="text-[10px] text-[#A89B8A] mt-1">
                  شناسه صنفی: کارگاه و شوروم طلای یزد | تلفن همراه و پشتیبانی: ۰۹۱۳۲۵۶۰۶۱۶
                </p>
              </div>
            </div>

            <div className="text-left sm:text-left bg-white p-3 rounded-xl border border-[#E5DED2] text-[11px] space-y-1 w-full sm:w-auto shadow-sm">
              <div className="flex sm:justify-end gap-2">
                <span className="text-[#77716A]">شماره پیش‌فاکتور:</span>
                <span className="font-numeral font-bold text-[#0B080F]">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex sm:justify-end gap-2">
                <span className="text-[#77716A]">تاریخ و ساعت صدور:</span>
                <span className="font-numeral text-[#0B080F]">{invoice.issuedAtFa}</span>
              </div>
              <div className="flex sm:justify-end gap-2">
                <span className="text-[#77716A]">نرخ مبنای هر گرم ۱۸:</span>
                <span className="font-numeral font-bold text-[#997D24]">{formatToman(invoice.goldReferencePrice)}</span>
              </div>
              <div className="flex sm:justify-end gap-2">
                <span className="text-[#77716A]">وضعیت سند:</span>
                <span className="text-amber-700 font-semibold">پیش‌فاکتور برخط (معتبر جهت تسویه)</span>
              </div>
            </div>
          </div>

          {/* Parties Info Grid: Buyer & Seller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-[#E5DED2] space-y-1.5 shadow-sm">
              <span className="font-bold text-[#0B080F] block text-[11px] border-b pb-1 text-[#997D24]">
                مشخصات خریدار:
              </span>
              <div className="flex justify-between">
                <span className="text-[#77716A]">نام و نام خانوادگی:</span>
                <span className="font-semibold text-[#0B080F]">{invoice.customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">شماره تماس:</span>
                <span className="font-numeral text-[#0B080F]">{invoice.customer.mobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">مقصد مرسوله:</span>
                <span>{invoice.customer.province} - {invoice.customer.city}</span>
              </div>
              {invoice.customer.address && (
                <div className="text-[11px] text-[#77716A] pt-1">
                  نشانی: {invoice.customer.address}
                </div>
              )}
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#E5DED2] space-y-1.5 shadow-sm">
              <span className="font-bold text-[#0B080F] block text-[11px] border-b pb-1 text-[#997D24]">
                مشخصات فروشنده و شوروم:
              </span>
              <div className="flex justify-between">
                <span className="text-[#77716A]">نام مجموعه:</span>
                <span className="font-semibold text-[#0B080F]">گالری طلا و جواهر میوان</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">تلفن تماس مستقیم:</span>
                <span className="font-numeral font-bold text-[#0B080F]">۰۹۱۳۲۵۶۰۶۱۶</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">نشانی شوروم:</span>
                <span>یزد، خیابان قیام، بازار خان، راسته زرگران</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#77716A]">وب‌سایت رسمی:</span>
                <span className="font-sans text-[#0B080F]">meyvan.ir</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E5DED2] bg-white shadow-sm">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#0B080F] text-white text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center">ردیف</th>
                  <th className="py-2.5 px-3">شرح کالا و مشخصات</th>
                  <th className="py-2.5 px-2 text-center">عیار</th>
                  <th className="py-2.5 px-3 text-center">وزن (گرم)</th>
                  <th className="py-2.5 px-2 text-center">تعداد</th>
                  <th className="py-2.5 px-3 text-left">طلای خام</th>
                  <th className="py-2.5 px-3 text-left">اجرت ساخت</th>
                  <th className="py-2.5 px-3 text-left">سود مصوب</th>
                  <th className="py-2.5 px-3 text-left">مالیات (VAT)</th>
                  <th className="py-2.5 px-3 text-left">سنگ / سایر</th>
                  <th className="py-2.5 px-3 text-left font-bold">مبلغ کل (تومان)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED2]">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 text-center font-numeral text-[#77716A]">{toPersianDigits(idx + 1)}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0B080F]">{item.name}</div>
                      <div className="text-[10px] text-[#A89B8A] font-numeral">کد SKU: {item.sku}</div>
                    </td>
                    <td className="py-3 px-2 text-center font-numeral">{toPersianDigits(item.karat)}</td>
                    <td className="py-3 px-3 text-center font-numeral font-semibold">{formatWeight(item.weightGrams)}</td>
                    <td className="py-3 px-2 text-center font-numeral">{toPersianDigits(item.quantity)}</td>
                    <td className="py-3 px-3 text-left font-numeral text-[#202124]">{formatToman(item.rawGoldPrice)}</td>
                    <td className="py-3 px-3 text-left font-numeral text-[#202124]">{formatToman(item.wageAmount)}</td>
                    <td className="py-3 px-3 text-left font-numeral text-[#202124]">{formatToman(item.profitAmount)}</td>
                    <td className="py-3 px-3 text-left font-numeral text-[#202124]">{formatToman(item.vatAmount)}</td>
                    <td className="py-3 px-3 text-left font-numeral text-[#202124]">{formatToman(item.stonePrice)}</td>
                    <td className="py-3 px-3 text-left font-numeral font-bold text-[#997D24]">{formatToman(item.lineTotalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Basis & Legal Disclosure Notice */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DED2] text-[11px] text-[#202124] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#0B080F] block">موازین قانونی و محاسباتی این فاکتور:</span>
              <p className="leading-relaxed text-[#77716A]">
                {invoice.pricingRules.legalNote}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-[10px] text-[#77716A]">
                <span>• مبنای سود: {invoice.pricingRules.profitBase} (٪{toPersianDigits(Math.round(invoice.pricingRules.profitRate * 100))})</span>
                <span>• مبنای مالیات: {invoice.pricingRules.vatBase} (٪{toPersianDigits(Math.round(invoice.pricingRules.vatRate * 100))})</span>
                <span>• استعلام نرخ: رسمی و زنده با تایید ساعت صدور</span>
              </div>
            </div>
          </div>

          {/* Totals Breakdown Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-6 space-y-2 text-[11px] text-[#77716A] border-r-2 border-[#D4AF37] pr-3">
              <p className="font-semibold text-[#0B080F]">تعهدات و شرایط تحویل میوان:</p>
              <p>• تمام محصولات با ضمانت عیار ۱۸ (۷۵۰) و شناسنامه رسمی زرگری تحویل می‌گردند.</p>
              <p>• ارسال با پست پیشتاز بیمه‌شده کامل ارزش طلا و بسته‌بندی امن انجام می‌پذیرد.</p>
              <p>• پیش‌فاکتور فوق جهت واریز به مدت ۱۰ دقیقه معتبر بوده و پس از واریز قطعی می‌گردد.</p>
            </div>

            <div className="md:col-span-6 bg-white p-4 rounded-xl border border-[#E5DED2] space-y-2 shadow-sm text-xs">
              <div className="flex justify-between text-[#77716A]">
                <span>جمع کل وزن طلای فاکتور:</span>
                <span className="font-numeral font-bold text-[#0B080F]">{formatWeight(invoice.totals.totalWeightGrams)}</span>
              </div>
              <div className="flex justify-between text-[#77716A]">
                <span>مجموع ارزش طلای خام:</span>
                <span className="font-numeral text-[#0B080F]">{formatToman(invoice.totals.totalRawGold)}</span>
              </div>
              <div className="flex justify-between text-[#77716A]">
                <span>مجموع اجرت ساخت:</span>
                <span className="font-numeral text-[#0B080F]">{formatToman(invoice.totals.totalWage)}</span>
              </div>
              <div className="flex justify-between text-[#77716A]">
                <span>مجموع سود مصوب:</span>
                <span className="font-numeral text-[#0B080F]">{formatToman(invoice.totals.totalProfit)}</span>
              </div>
              <div className="flex justify-between text-[#77716A]">
                <span>مجموع مالیات ارزش افزوده (VAT):</span>
                <span className="font-numeral text-[#0B080F]">{formatToman(invoice.totals.totalVat)}</span>
              </div>
              {invoice.totals.totalStone > 0 && (
                <div className="flex justify-between text-[#77716A]">
                  <span>مجموع بهای نگین و متعلقات:</span>
                  <span className="font-numeral text-[#0B080F]">{formatToman(invoice.totals.totalStone)}</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-[#0B080F] flex justify-between items-baseline text-sm font-bold text-[#0B080F]">
                <span>مبلغ نهایی قابل پرداخت:</span>
                <span className="font-numeral text-base text-[#997D24]">{formatToman(invoice.totals.totalPayable)}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal Block */}
          <div className="pt-6 border-t border-[#E5DED2] grid grid-cols-2 gap-4 text-center text-xs text-[#77716A]">
            <div className="p-4 border border-dashed border-[#E5DED2] rounded-xl flex flex-col items-center justify-center min-h-[90px]">
              <span className="font-bold text-[#0B080F] mb-1">امضا و تایید خریدار</span>
              <span className="text-[10px] text-[#A89B8A]">{invoice.customer.fullName}</span>
            </div>
            <div className="p-4 border border-dashed border-[#E5DED2] rounded-xl flex flex-col items-center justify-center min-h-[90px] relative">
              <span className="font-bold text-[#0B080F] mb-1">مهر و امضای گالری طلا میوان</span>
              <span className="text-[10px] text-[#A89B8A]">شوروم مرکزی یزد — meyvan.ir</span>
              <div className="absolute right-4 bottom-2 opacity-15 pointer-events-none">
                <Logo variant="emblem" size="sm" />
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Bar (Hidden on Print) */}
        <div className="bg-[#FAF8F5] p-4 border-t border-[#E5DED2] flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-2 text-[#77716A]">
            <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
            <span>محاسبات این فاکتور ۱۰۰٪ با قیمت صفحه محصول و درگاه تسویه یکسان است.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 border border-[#E5DED2] hover:bg-white text-[#0B080F] rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد' : 'کپی خلاصه فاکتور'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ فاکتور رسمی</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
