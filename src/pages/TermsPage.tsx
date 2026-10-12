import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-right text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
      <div className="border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
          قوانین، مقررات و صدور فاکتور رسمی
        </h1>
        <p className="text-xs text-[#A89B8A]">
          به‌روزرسانی: مهرماه ۱۴۰۵ — مطابق قوانین رسمی اتحادیه طلا و جواهر جمهوری اسلامی ایران
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-6">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            ۱. اصالت عیار طلا و فاکتور رسمی
          </h2>
          <p>
            کلیه محصولات میوان از طلای ۱۸ عیار استاندارد (۷۵۰) ساخته شده و فاکتور رسمی و معتبر همراه با قید وزن، عیار، شماره سریال و مهر اتحادیه صادر می‌شود. این فاکتور سند قانونی مالکیت شماست.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            ۲. نوسان نرخ طلا و قفل قیمت
          </h2>
          <p>
            با توجه به نوسانات لحظه‌ای بازار طلا، به محض ورود به صفحه تسویه حساب و ایجاد پیش‌فاکتور، قیمت به مدت ۱۰ دقیقه برای خریدار قفل می‌گردد. در صورت عدم تکمیل فرآیند ظرف این مدت، سفارش با نرخ جدید مجدداً محاسبه خواهد شد.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F]">۳. ارسال و بیمه مرسولات</h2>
          <p>
            تمام سفارش‌های ارسالی با پست پیشتاز یا شرکت‌های پستی معتبر دارای بیمه کامل ارزش طلا می‌باشند. در صورت هرگونه مفقودی یا آسیب احتمالی در مسیر حمل، مسئولیت کامل بر عهده گالری میوان است.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#0B080F]">۴. شفافیت هویت، مجوزها و پیش‌فاکتور واقعی</h2>
          <p>
            اعتماد مشتریان بزرگ‌ترین سرمایه میوان است. تا زمان تکمیل فرآیندهای اداری و سامانه‌های اتصال خودکار، وضعیت مجوزها و احراز هویت‌ها به شکل شفاف و واقعی اعلام می‌شود و هیچ ادعای غیرواقعی مطرح نمی‌گردد. شماره تماس مستقیم ۰۹۱۳۲۵۶۰۶۱۶ و نشانی کارگاه و شوروم یزد در دسترس بوده و پیش‌فاکتورها پیش از پرداخت نهایی قابل بررسی و تطبیق دقیق می‌باشند.
          </p>
        </section>
      </div>
    </div>
  );
};
