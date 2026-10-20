import React, { useRef } from 'react';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { CartItem, OrderCustomerInfo } from '../../types';
import { formatToman, formatWeight, toPersianDigits } from '../../utils/persian';
import { X, Printer, ShieldCheck, Share2, Check, MessageCircle, AlertCircle } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useLanguage } from '../../context/LanguageContext';

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
  const { generateInvoice } = useGoldPrice();
  const { t, language } = useLanguage();
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
    const summary = `${isDraft ? t('invoice.pre_title') : t('invoice.final_title')} #${invoice.invoiceNumber} | ${invoice.totals.totalPayable.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')} ${t('currency')}`;
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
                {isDraft ? t('invoice.pre_title') : t('invoice.final_title')}
              </h3>
              <p className="text-[11px] text-[#A89B8A]">
                {language === 'fa' ? 'محاسبه شده با موتور مرکزی قیمت‌گذاری و ضرایب مصوب' : 'Calculated via central pricing engine & Union statutory rules'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B080F] font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              title={t('invoice.print_btn')}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('invoice.print_btn')}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-300 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              title={t('invoice.whatsapp_btn')}
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="hidden sm:inline">{t('invoice.whatsapp_btn')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 text-xs bg-[#FCFAF7] print:bg-white text-start">
          
          {/* Invoice Document Header */}
          <div className="border-b-2 border-[#0B080F] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3.5">
              <Logo variant="emblem" size="sm" />
              <div>
                <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#0B080F]">
                  {language === 'fa' ? 'گالری طلا و جواهر میوان (MEYVAN)' : 'MEYVAN Fine Jewelry Atelier'}
                </h1>
                <p className="text-[10px] sm:text-xs text-[#77716A] mt-0.5 font-serif-luxury tracking-wider">
                  MEYVAN GOLD &amp; JEWELRY · YAZD · TIMELESS BRILLIANCE
                </p>
                <p className="text-[10px] text-[#A89B8A] mt-1">
                  {language === 'fa' ? 'شناسه صنفی: کارگاه و شوروم طلای یزد | تلفن همراه: ۰۹۱۳۲۵۶۰۶۱۶' : 'Central Atelier: Yazd Gold Bazaar | Hotline: +98 913 256 0616'}
                </p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#E5DED2] text-[11px] space-y-1 w-full sm:w-auto shadow-sm text-start">
              <div className="flex justify-between gap-2">
                <span className="text-[#77716A]">{t('invoice.number_label')}</span>
                <span className="font-numeral font-bold text-[#0B080F]">
                  {language === 'fa' ? toPersianDigits(invoice.invoiceNumber) : invoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#77716A]">{t('invoice.date_label')}</span>
                <span className="font-numeral text-[#0B080F]">
                  {language === 'fa' ? invoice.issuedAtFa : new Date().toLocaleDateString('en-US')}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#77716A]">{language === 'fa' ? 'نرخ مبنای هر گرم ۱۸:' : '18K Benchmark Rate:'}</span>
                <span className="font-numeral font-bold text-[#997D24]">
                  {language === 'fa' ? formatToman(invoice.goldReferencePrice) : `${invoice.goldReferencePrice.toLocaleString('en-US')} Tomans`}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#77716A]">{language === 'fa' ? 'وضعیت سند:' : 'Doc Status:'}</span>
                <span className="text-amber-700 font-semibold">
                  {language === 'fa' ? 'پیش‌فاکتور برخط (معتبر)' : 'Official Pre-Invoice'}
                </span>
              </div>
            </div>
          </div>

          {/* Parties Info Grid: Buyer & Seller */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-[#E5DED2] space-y-1.5 shadow-sm text-start">
              <span className="font-bold text-[#0B080F] block text-[11px] border-b pb-1 text-[#997D24]">
                {language === 'fa' ? 'مشخصات خریدار:' : 'Buyer Information:'}
              </span>
              <div className="flex justify-between">
                <span className="text-[#77716A]">{language === 'fa' ? 'نام و نام خانوادگی:' : 'Full Name:'}</span>
                <span className="font-semibold text-[#0B080F]">{invoice.customer.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">{language === 'fa' ? 'شماره تماس:' : 'Phone Number:'}</span>
                <span className="font-numeral text-[#0B080F]">
                  {language === 'fa' ? toPersianDigits(invoice.customer.mobile || '') : invoice.customer.mobile}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">{language === 'fa' ? 'مقصد مرسوله:' : 'Destination:'}</span>
                <span>{invoice.customer.province} - {invoice.customer.city}</span>
              </div>
              {invoice.customer.address && (
                <div className="text-[11px] text-[#77716A] pt-1">
                  {language === 'fa' ? 'نشانی: ' : 'Address: '}{invoice.customer.address}
                </div>
              )}
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-[#E5DED2] space-y-1.5 shadow-sm text-[11px] text-start">
              <span className="font-bold text-[#0B080F] block text-[11px] border-b pb-1 text-[#997D24]">
                {language === 'fa' ? 'مشخصات فروشنده و کارگاه:' : 'Seller & Atelier Info:'}
              </span>
              <div className="flex justify-between">
                <span className="text-[#77716A]">{language === 'fa' ? 'واحد صنفی:' : 'Store Name:'}</span>
                <span className="font-semibold text-[#0B080F]">
                  {language === 'fa' ? 'گالری طلا و جواهر میوان' : 'MEYVAN Gold Gallery'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">{language === 'fa' ? 'اتحادیه مربوطه:' : 'Union License:'}</span>
                <span className="font-numeral text-[#0B080F]">
                  {language === 'fa' ? 'اتحادیه طلا و جواهر یزد' : 'Yazd Gold & Jewelry Guild'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">{language === 'fa' ? 'نشانی شوروم:' : 'Atelier Address:'}</span>
                <span>{t('footer.showroom_address')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#77716A]">{language === 'fa' ? 'تلفن تماس:' : 'Direct Phone:'}</span>
                <span className="font-numeral font-bold text-[#0B080F]">
                  {language === 'fa' ? '۰۹۱۳۲۵۶۰۶۱۶' : '+98 913 256 0616'}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-xl border border-[#E5DED2] bg-white shadow-sm">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#0B080F] text-white text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center">{language === 'fa' ? 'ردیف' : '#'}</th>
                  <th className="py-2.5 px-3 text-start">{t('invoice.col_desc')}</th>
                  <th className="py-2.5 px-2 text-center">{t('invoice.col_karat')}</th>
                  <th className="py-2.5 px-3 text-center">{t('invoice.col_weight')}</th>
                  <th className="py-2.5 px-2 text-center">{language === 'fa' ? 'تعداد' : 'Qty'}</th>
                  <th className="py-2.5 px-3 text-start">{t('invoice.col_raw_gold')}</th>
                  <th className="py-2.5 px-3 text-start">{t('invoice.col_wage')}</th>
                  <th className="py-2.5 px-3 text-start">{t('invoice.col_profit')}</th>
                  <th className="py-2.5 px-3 text-start">{t('invoice.col_vat')}</th>
                  <th className="py-2.5 px-3 text-start">{t('invoice.col_stone')}</th>
                  <th className="py-2.5 px-3 text-start font-bold">{t('invoice.col_subtotal')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED2]">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 px-3 text-center font-numeral text-[#77716A]">
                      {language === 'fa' ? toPersianDigits(idx + 1) : idx + 1}
                    </td>
                    <td className="py-3 px-3 text-start">
                      <div className="font-bold text-[#0B080F]">{item.name}</div>
                      <div className="text-[10px] text-[#A89B8A] font-numeral">SKU: {item.sku}</div>
                    </td>
                    <td className="py-3 px-2 text-center font-numeral">
                      {language === 'fa' ? toPersianDigits(item.karat) : item.karat}
                    </td>
                    <td className="py-3 px-3 text-center font-numeral font-semibold">
                      {language === 'fa' ? formatWeight(item.weightGrams) : `${item.weightGrams.toFixed(2)} g`}
                    </td>
                    <td className="py-3 px-2 text-center font-numeral">
                      {language === 'fa' ? toPersianDigits(item.quantity) : item.quantity}
                    </td>
                    <td className="py-3 px-3 text-start font-numeral text-[#202124]">
                      {language === 'fa' ? formatToman(item.rawGoldPrice) : item.rawGoldPrice.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-3 text-start font-numeral text-[#202124]">
                      {language === 'fa' ? formatToman(item.wageAmount) : item.wageAmount.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-3 text-start font-numeral text-[#202124]">
                      {language === 'fa' ? formatToman(item.profitAmount) : item.profitAmount.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-3 text-start font-numeral text-[#202124]">
                      {language === 'fa' ? formatToman(item.vatAmount) : item.vatAmount.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-3 text-start font-numeral text-[#202124]">
                      {language === 'fa' ? formatToman(item.stonePrice) : item.stonePrice.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-3 text-start font-numeral font-bold text-[#997D24]">
                      {language === 'fa' ? formatToman(item.lineTotalPrice) : `${item.lineTotalPrice.toLocaleString('en-US')} ${t('currency')}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Basis & Legal Disclosure Notice */}
          <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DED2] text-[11px] text-[#202124] flex items-start gap-2.5 text-start">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#0B080F] block">
                {language === 'fa' ? 'موازین قانونی و محاسباتی این فاکتور:' : 'Statutory Pricing Compliance:'}
              </span>
              <p className="leading-relaxed text-[#77716A]">
                {invoice.pricingRules.legalNote}
              </p>
              <div className="flex flex-wrap gap-4 pt-1 text-[10px] text-[#77716A]">
                <span>• {language === 'fa' ? `مبنای سود: ${invoice.pricingRules.profitBase} (٪${toPersianDigits(Math.round(invoice.pricingRules.profitRate * 100))})` : `Profit Rate: 7% on Wage + Raw`}</span>
                <span>• {language === 'fa' ? `مبنای مالیات: ${invoice.pricingRules.vatBase} (٪${toPersianDigits(Math.round(invoice.pricingRules.vatRate * 100))})` : `VAT Rate: 10% on Wage + Profit`}</span>
                <span>• {language === 'fa' ? 'استعلام نرخ: رسمی و زنده با تایید ساعت صدور' : 'Gold Rate: Real-time TGJU Benchmark'}</span>
              </div>
            </div>
          </div>

          {/* Totals Breakdown Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end text-start">
            <div className="md:col-span-6 space-y-2 text-[11px] text-[#77716A] border-s-2 border-[#D4AF37] ps-3">
              <p className="font-semibold text-[#0B080F]">{language === 'fa' ? 'تعهدات و شرایط تحویل میوان:' : 'Meyvan Delivery Commitments:'}</p>
              <p>• {language === 'fa' ? 'تمام محصولات با ضمانت عیار ۱۸ (۷۵۰) و شناسنامه رسمی زرگری تحویل می‌گردند.' : 'All pieces delivered with 18K (750 purity) certificate of authenticity.'}</p>
              <p>• {language === 'fa' ? 'ارسال با پست پیشتاز بیمه‌شده کامل ارزش طلا و بسته‌بندی امن انجام می‌پذیرد.' : 'Dispatched via insured express mail with 100% full declared value protection.'}</p>
              <p>• {language === 'fa' ? 'پیش‌فاکتور فوق جهت واریز به مدت ۱۰ دقیقه معتبر بوده و پس از واریز قطعی می‌گردد.' : 'Price is locked for 10 minutes from pre-invoice issuance.'}</p>
            </div>

            <div className="md:col-span-6 bg-white p-4 rounded-xl border border-[#E5DED2] space-y-2 shadow-sm text-xs">
              <div className="flex justify-between text-[#77716A]">
                <span>{t('invoice.totals.weight')}</span>
                <span className="font-numeral font-bold text-[#0B080F]">
                  {language === 'fa' ? formatWeight(invoice.totals.totalWeightGrams) : `${invoice.totals.totalWeightGrams.toFixed(2)} g`}
                </span>
              </div>
              <div className="flex justify-between text-[#77716A]">
                <span>{t('invoice.col_raw_gold')}:</span>
                <span className="font-numeral text-[#0B080F]">
                  {language === 'fa' ? formatToman(invoice.totals.totalRawGold) : `${invoice.totals.totalRawGold.toLocaleString('en-US')} ${t('currency')}`}
                </span>
              </div>
              <div className="flex justify-between text-[#77716A]">
                <span>{t('invoice.col_wage')}:</span>
                <span className="font-numeral text-[#0B080F]">
                  {language === 'fa' ? formatToman(invoice.totals.totalWage) : `${invoice.totals.totalWage.toLocaleString('en-US')} ${t('currency')}`}
                </span>
              </div>
              <div className="flex justify-between text-[#77716A]">
                <span>{t('invoice.col_profit')}:</span>
                <span className="font-numeral text-[#0B080F]">
                  {language === 'fa' ? formatToman(invoice.totals.totalProfit) : `${invoice.totals.totalProfit.toLocaleString('en-US')} ${t('currency')}`}
                </span>
              </div>
              <div className="flex justify-between text-[#77716A]">
                <span>{t('invoice.col_vat')}:</span>
                <span className="font-numeral text-[#0B080F]">
                  {language === 'fa' ? formatToman(invoice.totals.totalVat) : `${invoice.totals.totalVat.toLocaleString('en-US')} ${t('currency')}`}
                </span>
              </div>
              {invoice.totals.totalStone > 0 && (
                <div className="flex justify-between text-[#77716A]">
                  <span>{t('invoice.col_stone')}:</span>
                  <span className="font-numeral text-[#0B080F]">
                    {language === 'fa' ? formatToman(invoice.totals.totalStone) : `${invoice.totals.totalStone.toLocaleString('en-US')} ${t('currency')}`}
                  </span>
                </div>
              )}
              
              <div className="pt-2 border-t border-[#0B080F] flex justify-between items-baseline text-sm font-bold text-[#0B080F]">
                <span>{t('invoice.totals.total')}</span>
                <span className="font-numeral text-base text-[#997D24]">
                  {language === 'fa' ? formatToman(invoice.totals.totalPayable) : `${invoice.totals.totalPayable.toLocaleString('en-US')} ${t('currency')}`}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal Block */}
          <div className="pt-6 border-t border-[#E5DED2] grid grid-cols-2 gap-4 text-center text-xs text-[#77716A]">
            <div className="p-4 border border-dashed border-[#E5DED2] rounded-xl flex flex-col items-center justify-center min-h-[90px]">
              <span className="font-bold text-[#0B080F] mb-1">
                {language === 'fa' ? 'امضا و تایید خریدار' : 'Buyer Signature & Acceptance'}
              </span>
              <span className="text-[10px] text-[#A89B8A]">{invoice.customer.fullName}</span>
            </div>
            <div className="p-4 border border-dashed border-[#E5DED2] rounded-xl flex flex-col items-center justify-center min-h-[90px] relative">
              <span className="font-bold text-[#0B080F] mb-1">
                {language === 'fa' ? 'مهر و امضای گالری طلا میوان' : 'Official Meyvan Stamped Seal'}
              </span>
              <span className="text-[10px] text-[#A89B8A]">
                {language === 'fa' ? 'شوروم مرکزی یزد — meyvan.ir' : 'Central Yazd Atelier — meyvan.ir'}
              </span>
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
            <span>
              {language === 'fa'
                ? 'محاسبات این فاکتور ۱۰۰٪ با قیمت صفحه محصول و درگاه تسویه یکسان است.'
                : '100% price consistency between product page, invoice and checkout.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 border border-[#E5DED2] hover:bg-white text-[#0B080F] rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? (language === 'fa' ? 'کپی شد' : 'Copied!') : (language === 'fa' ? 'کپی خلاصه فاکتور' : 'Copy Summary')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#0B080F] hover:bg-[#D4AF37] text-white hover:text-[#0B080F] font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('invoice.print_btn')}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
