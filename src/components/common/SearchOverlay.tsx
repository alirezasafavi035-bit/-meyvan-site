import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { normalizePersianText, formatToman, toPersianDigits } from '../../utils/persian';
import { useGoldPrice } from '../../context/GoldPriceContext';
import { Search, X, ArrowLeft } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, products }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { calculatePrice } = useGoldPrice();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const normalized = normalizePersianText(debouncedQuery);
    return products
      .filter((p) => {
        const pName = normalizePersianText(p.name);
        const pSku = normalizePersianText(p.sku);
        const pCat = normalizePersianText(p.categoryFa);
        const pType = normalizePersianText(p.typeFa);
        const pTags = p.tags.map((t) => normalizePersianText(t)).join(' ');
        return (
          pName.includes(normalized) ||
          pSku.includes(normalized) ||
          pCat.includes(normalized) ||
          pType.includes(normalized) ||
          pTags.includes(normalized)
        );
      })
      .slice(0, 8);
  }, [debouncedQuery, products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md p-4 sm:p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-[#14101A] border border-[#D4AF37]/30 text-white rounded-2xl shadow-2xl overflow-hidden mt-6 sm:mt-12">
        {/* Search Input Box */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی نام جواهر، مدل (کارتیه، ونکلیف)، کد محصول یا دسته‌بندی..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/40 outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1 text-white/50 hover:text-white text-xs"
            >
              انصراف
            </button>
          )}
        </div>

        {/* Popular Tags */}
        {!debouncedQuery && (
          <div className="p-5 sm:p-6 text-xs">
            <span className="text-white/40 block mb-3">جستجوهای پرطرفدار طلا و جواهر:</span>
            <div className="flex flex-wrap gap-2">
              {[
                'انگشتر ونکلیف',
                'دستبند کارتیه',
                'النگو یزد',
                'سرویس برلیان',
                'گردنبند مروارید',
                'طلای مینیمال',
                'نیم‌ست عروس'
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] text-white/70 border border-white/10 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List */}
        {debouncedQuery && (
          <div className="max-h-96 overflow-y-auto divide-y divide-white/5 p-2">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-white/40 text-xs">
                موردی مطابق با «{debouncedQuery}» یافت نشد.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const breakdown = calculatePrice(product);
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      onClose();
                      navigate(`/product/${product.slug}`);
                    }}
                    className="p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-black/40 rounded-lg overflow-hidden shrink-0 border border-white/10 flex items-center justify-center p-1">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/logo.svg';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">
                          {product.name}
                        </h4>
                        <div className="text-[11px] text-white/50 flex items-center gap-2 mt-0.5">
                          <span className="font-numeral">کد: {product.sku}</span>
                          <span>·</span>
                          <span>{product.categoryFa}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-xs sm:text-sm font-bold text-[#D4AF37] font-numeral">
                        {formatToman(breakdown.totalPrice)}
                      </div>
                      <div className="text-[10px] text-white/40 flex items-center justify-end gap-1 mt-0.5">
                        <span>مشاهده</span>
                        <ArrowLeft className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {filteredProducts.length > 0 && (
              <div className="p-3 text-center border-t border-white/5">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/catalog?q=${encodeURIComponent(debouncedQuery)}`);
                  }}
                  className="text-xs text-[#D4AF37] hover:underline"
                >
                  مشاهده همه نتایج برای «{debouncedQuery}» در فروشگاه
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
