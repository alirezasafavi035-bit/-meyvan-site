import React from 'react';
import { InvoiceData } from '../../types';
import { formatToman, formatWeight, toPersianDigits } from '../../utils/persian';
import { X, Printer, ShieldCheck, Download, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';

interface InvoiceModalProps {
  invoice: InvoiceData;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E5DED2] flex flex-col my-4 print:border-none print:shadow-none print:rounded-none print:max-w-none print:m-0">
        
        {/* Modal Top Bar - Hidden in Print */}
        <div className="bg-[#0B0F14] text-white p-4 sm:px-6 flex items-center justify-between border-b border-[#D4AF37]/30 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-serif-luxury tracking-widest text-[#D4AF37] uppercase">
              MEYVAN INVOICE
            </span>
            <span className="text-white/40">|</span>
            <span className="text-xs text-white/80">
              {invoice.isDraft ? 'پیش‌نمایش فاکتور شفاف پیش از خرید' : 'فاکتور نهایی و تاییدیه سفارش'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#E5C358] text-[#0B0F14] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              title="چاپ یا ذخیره به عنوان PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ فاکتور</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="بستن پنجره"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-10 space-y-6 text-[#0B0F14] text-xs bg-white print:p-6" id="printable-invoice">
          
          {/* 1. Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-[#E5DED2] gap-4">
            <div className="space-y-1">
              <Logo variant="horizontal" size="md" />
              <p className="text-[11px] text-[#77716A] pt-1">
                {invoice.seller.brandSlogan}
              </p>
              <div className="inline-block mt-2 px-2.5 py-1 bg-[#F7F5EE] border border-[#E5DED2] rounded text-[10px] text-[#202124]">
                {invoice.isDraft ? 'صورت‌حساب شفاف برخط (پیش‌فاکتور)' : 'فاکتور رسمی فروش طلا'}
              </div>
            </div>

            <div className="text-left sm:text-left space-y-1.5 text-xs text-[#77716A]">
              <div>
                <span className="font-semibold text-[#0B0F14]">شماره فاکتور: </span>
                <span className="font-numeral font-bold text-[#0B0F14]">{toPersianDigits(invoice.invoiceNumber)}</span>
              </div>
              <div>
                <span className="font-semibold text-[#0B0F14]">تاریخ صدور: </span>
                <span>{invoice.issuedAtFa}</span>
              </div>
              <div>
                <span className="font-semibold text-[#0B0F14]">نرخ مبنای طلای ۱۸ عیار: </span>
                <span className="font-numeral text-[#D4AF37] font-bold">{formatToman(invoice.goldReferencePrice)}</span>
              </div>
            </div>
          </div>

          {/* 2. Seller and Customer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#F7F5EE] border border-[#E5DED2]">
            {/* Seller */}
            <div className="space-y-1 text-[11px]">
              <span className="font-bold text-[#0B0F14] block mb-1">مشخصات فروشنده:</span>
              <p className="text-[#202124]">{invoice.seller.name}</p>
              <p className="text-[#77716A]">{invoice.seller.showroomAddress}</p>
              <p className="text-[#77716A]">تلفن تماس و پشتیبانی: <span className="font-numeral">{invoice.seller.telephone}</span></p>
            </div>

            {/* Customer */}
            <div className="space-y-1 text-[11px] border-t sm:border-t-0 sm:border-r sm:border-[#E5DED2] pt-3 sm:pt-0 sm:pr-4">
              <span className="font-bold text-[#0B0F14] block mb-1">مشخصات خریدار:</span>
              <p className="text-[#202124]">{invoice.customer.fullName || 'خریدار گرامی'}</p>
              <p className="text-[#77716A]">شماره تماس: <span className="font-numeral">{toPersianDigits(invoice.customer.mobile)}</span></p>
              <p className="text-[#77716A] line-clamp-2">نشانی: {invoice.customer.address} (استان {invoice.customer.province}، شهر {invoice.customer.city})</p>
            </div>
          </div>

          {/* 3. Itemized Product Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse border border-[#E5DED2] text-[11px]">
              <thead>
                <tr className="bg-[#0B0F14] text-white">
                  <th className="p-2.5 border border-[#202124] font-medium text-center w-8">ردیف</th>
                  <th className="p-2.5 border border-[#202124] font-medium">شرح کالا و کد</th>
                  <th className="p-2.5 border border-[#202124] font-medium text-center">عیار</th>
                  <th className="p-2.5 border border-[#202124] font-medium text-center">وزن (گرم)</th>
                  <th className="p-2.5 border border-[#202124] font-medium text-center w-12">تعداد</th>
                  <th className="p-2.5 border border-[#202124] font-medium text-center">ارزش طلای خام</th>
                  <th className="p-2.5 border border-[#202124] font-medium text-center">اجرت ساخت</th>
                  <th className="p-2.5 border border-[#202124] font-medium text-center">سود (۷٪)</th>
                  <th className="p-2.5 border border-[#202124] font-medium text-center">مالیات (۹٪)</th>
                  <th className="p-2.5 border border-[#202124] font-medium text-left">مبلغ کل ردیف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED2]">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#F7F5EE]/50 transition-colors">
                    <td className="p-2.5 border border-[#E5DED2] text-center font-numeral">{toPersianDigits(idx + 1)}</td>
                    <td className="p-2.5 border border-[#E5DED2]">
                      <span className="font-semibold block">{item.name}</span>
                      <span className="text-[10px] text-[#77716A] font-numeral">کد: {item.sku}</span>
                    </td>
                    <td className="p-2.5 border border-[#E5DED2] text-center font-numeral">{toPersianDigits(item.karat)}</td>
                    <td className="p-2.5 border border-[#E5DED2] text-center font-numeral">{formatWeight(item.weightGrams)}</td>
                    <td className="p-2.5 border border-[#E5DED2] text-center font-numeral">{toPersianDigits(item.quantity)}</td>
                    <td className="p-2.5 border border-[#E5DED2] text-center font-numeral">{formatToman(item.rawGoldPrice)}</td>
                    <td className="p-2.5 border border-[#E5DED2] text-center font-numeral">{formatToman(item.wageAmount)}</td>
                    <td className="p-2.5 border border-[#E5DED2] text-center font-numeral">{formatToman(item.profitAmount)}</td>
                    <td className="p-2.5 border border-[#E5DED2] text-center font-numeral">{formatToman(item.vatAmount)}</td>
                    <td className="p-2.5 border border-[#E5DED2] text-left font-bold font-numeral text-[#0B0F14]">{formatToman(item.lineTotalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Total Summary Box */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            {/* Legal and Pricing Rules Explanation */}
            <div className="flex-1 space-y-2 text-[10px] text-[#77716A] bg-[#F7F5EE] p-3.5 rounded-xl border border-[#E5DED2]">
              <div className="flex items-start gap-1.5 text-[#0B0F14] font-semibold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>مستند قانونی و شفافیت محاسبه:</span>
              </div>
              <p className="leading-relaxed">
                {invoice.pricingRules.legalNote}
              </p>
              <div className="pt-1.5 border-t border-[#E5DED2] space-y-1 text-[10px]">
                <p>• مبنای محاسبه سود: {invoice.pricingRules.profitBase} (نرخ قانونی مصوب اتحادیه ۷٪)</p>
                <p>• مبنای شمول مالیات بر ارزش افزوده: {invoice.pricingRules.vatBase} (نرخ ۹٪)</p>
                <p>• کلیه اوزان با ترازوی کالیبره استاندارد آزمایشگاهی سنجش و در فاکتور نهایی درج می‌شوند.</p>
              </div>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E5DED2] text-[#77716A]">
                <span>مجموع وزن طلای خالص:</span>
                <span className="font-bold font-numeral text-[#0B0F14]">{formatWeight(invoice.totals.totalWeightGrams)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5DED2] text-[#77716A]">
                <span>مجموع بهای طلای خام:</span>
                <span className="font-numeral text-[#0B0F14]">{formatToman(invoice.totals.totalRawGold)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5DED2] text-[#77716A]">
                <span>مجموع اجرت ساخت:</span>
                <span className="font-numeral text-[#0B0F14]">{formatToman(invoice.totals.totalWage)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5DED2] text-[#77716A]">
                <span>مجموع سود فروشنده (۷٪):</span>
                <span className="font-numeral text-[#0B0F14]">{formatToman(invoice.totals.totalProfit)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5DED2] text-[#77716A]">
                <span>مجموع مالیات بر ارزش افزوده (۹٪):</span>
                <span className="font-numeral text-[#0B0F14]">{formatToman(invoice.totals.totalVat)}</span>
              </div>
              {invoice.totals.totalStone > 0 && (
                <div className="flex justify-between py-1 border-b border-[#E5DED2] text-[#77716A]">
                  <span>مجموع ارزش سنگ و نگین:</span>
                  <span className="font-numeral text-[#0B0F14]">{formatToman(invoice.totals.totalStone)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t-2 border-[#0B0F14] font-bold text-sm text-[#0B0F14]">
                <span>مبلغ نهایی فاکتور:</span>
                <span className="font-numeral text-base text-[#D4AF37]">{formatToman(invoice.totals.totalPayable)}</span>
              </div>
            </div>
          </div>

          {/* 5. Footer Signatures and Disclaimer */}
          <div className="pt-6 border-t border-[#E5DED2] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#77716A] gap-4">
            <div>
              <p>مهر و امضای گالری طلا و جواهر میوان (MEYVAN)</p>
              <p className="mt-1">صادر شده از طریق سامانه شفافیت محاسبات قیمت میوان</p>
            </div>
            <div className="text-left sm:text-left font-serif-luxury tracking-widest text-[#D4AF37]">
              MEYVAN · MORE THAN JUST JEWELRY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
