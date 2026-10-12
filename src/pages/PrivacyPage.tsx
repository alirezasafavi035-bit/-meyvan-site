import React from 'react';
import { Lock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-right text-xs sm:text-sm text-[#0B080F]/80 leading-relaxed">
      <div className="border-b pb-6">
        <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F] mb-2">
          سیاست حفظ حریم خصوصی
        </h1>
        <p className="text-xs text-[#A89B8A]">
          تعهد میوان به حفظ امنیت داده‌ها و اطلاعات کاربران
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border space-y-4">
        <p className="flex items-center gap-2 font-bold text-sm text-[#0B080F]">
          <Lock className="w-5 h-5 text-[#D4AF37]" />
          امنیت اطلاعات هویتی و آدرس‌ها
        </p>
        <p>
          فروشگاه آنلاین طلا و جواهر میوان اطلاعات شخصی کاربران شامل شماره تلفن، آدرس پستی و نام را صرفاً به منظور پردازش، بیمه و ارسال فیزیکی مرسولات پستی استفاده کرده و تحت هیچ شرایطی در اختیار اشخاص یا سازمان‌های ثالث قرار نمی‌دهد.
        </p>
      </div>
    </div>
  );
};
