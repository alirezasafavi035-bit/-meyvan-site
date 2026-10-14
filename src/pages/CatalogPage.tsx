import React, { useState, useMemo, useEffect, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, FilterState } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { useGoldPrice } from '../context/GoldPriceContext';
import { normalizePersianText, toPersianDigits, formatToman } from '../utils/persian';
import { Filter, SlidersHorizontal, X, Search, RotateCcw } from 'lucide-react';

interface CatalogPageProps {
  products: Product[];
}

const PAGE_SIZE = 24;

export const CatalogPage: React.FC<CatalogPageProps> = ({ products }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { calculatePrice } = useGoldPrice();
  const [isPending, startTransition] = useTransition();

  // Mobile Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Read URL query params
  const initialCategory = searchParams.get('category') || 'all';
  const initialType = searchParams.get('type') || 'all';
  const initialKarat = searchParams.get('karat') || 'all';
  const initialSort = (searchParams.get('sortBy') as FilterState['sortBy']) || 'newest';
  const initialQuery = searchParams.get('q') || '';
  const initialWishlistOnly = searchParams.get('filter') === 'wishlist';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedKarat, setSelectedKarat] = useState(initialKarat);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [stoneFilter, setStoneFilter] = useState<'all' | 'withStone' | 'noStone'>('all');
  const [sortBy, setSortBy] = useState<FilterState['sortBy']>(initialSort);
  const [maxWeight, setMaxWeight] = useState<number>(80);

  // Sync state to URL params
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === 'all' || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    setSearchParams(next, { replace: true });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
    updateUrlParams({ category: cat });
  };

  const handleTypeChange = (t: string) => {
    setSelectedType(t);
    setVisibleCount(PAGE_SIZE);
    updateUrlParams({ type: t });
  };

  const handleSortChange = (s: FilterState['sortBy']) => {
    setSortBy(s);
    setVisibleCount(PAGE_SIZE);
    updateUrlParams({ sortBy: s });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedType('all');
    setSelectedKarat('all');
    setInStockOnly(false);
    setStoneFilter('all');
    setMaxWeight(80);
    setSearchQuery('');
    setVisibleCount(PAGE_SIZE);
    setSearchParams({});
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query with Persian normalization
    if (searchQuery.trim()) {
      const normQuery = normalizePersianText(searchQuery);
      result = result.filter((p) => {
        const normName = normalizePersianText(p.name);
        const normSku = normalizePersianText(p.sku);
        const normCat = normalizePersianText(p.categoryFa);
        const normType = normalizePersianText(p.typeFa);
        return (
          normName.includes(normQuery) ||
          normSku.includes(normQuery) ||
          normCat.includes(normQuery) ||
          normType.includes(normQuery)
        );
      });
    }

    // Category or Specialized Collection Filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'earrings') {
        result = result.filter((p) => p.type === 'earrings');
      } else if (selectedCategory === 'ring') {
        result = result.filter((p) => p.type === 'ring');
      } else if (selectedCategory === 'necklace') {
        result = result.filter((p) => p.type === 'necklace' || p.type === 'pendant');
      } else if (selectedCategory === 'bracelet') {
        result = result.filter((p) => p.type === 'bracelet' || p.type === 'bangle' || p.type === 'anklet');
      } else if (selectedCategory === 'set') {
        result = result.filter((p) => p.type === 'set' || p.type === 'half_set' || p.category === 'set');
      } else if (selectedCategory === 'coin') {
        result = result.filter((p) => p.type === 'coin' || p.category === 'heavy' || p.name.includes('سکه') || p.name.includes('شمش'));
      } else if (selectedCategory === 'pendant') {
        result = result.filter((p) => p.type === 'pendant' || p.tags.includes('آویز') || p.name.includes('پلاک') || p.name.includes('آویز'));
      } else if (selectedCategory === 'men') {
        result = result.filter((p) => p.category === 'heavy' || p.tags.includes('مردانه') || p.name.includes('مردانه') || (p.type === 'ring' && p.weightGrams >= 4));
      } else if (selectedCategory === 'kids') {
        result = result.filter((p) => p.tags.includes('کودک') || p.tags.includes('بچگانه') || p.name.includes('کودک') || p.weightGrams <= 2.2);
      } else if (selectedCategory === 'economic') {
        result = result.filter((p) => p.wagePercent <= 0.15 || p.category === 'economic');
      } else {
        result = result.filter((p) => p.category === selectedCategory || p.type === selectedCategory);
      }
    }

    // Type Filter
    if (selectedType !== 'all') {
      result = result.filter((p) => p.type === selectedType || (selectedType === 'set' && (p.type === 'half_set' || p.category === 'set')) || (selectedType === 'necklace' && p.type === 'pendant') || (selectedType === 'bracelet' && (p.type === 'bangle' || p.type === 'anklet')));
    }

    // Karat
    if (selectedKarat !== 'all') {
      result = result.filter((p) => String(p.karat) === selectedKarat);
    }

    // Weight
    if (maxWeight < 80) {
      result = result.filter((p) => p.weightGrams <= maxWeight);
    }

    // In Stock
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Stone
    if (stoneFilter === 'withStone') {
      result = result.filter((p) => p.hasStone);
    } else if (stoneFilter === 'noStone') {
      result = result.filter((p) => !p.hasStone);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'bestseller') {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      if (sortBy === 'lightest') {
        return a.weightGrams - b.weightGrams;
      }
      if (sortBy === 'heaviest') {
        return b.weightGrams - a.weightGrams;
      }
      if (sortBy === 'cheapest' || sortBy === 'expensive') {
        const priceA = calculatePrice(a).totalPrice;
        const priceB = calculatePrice(b).totalPrice;
        return sortBy === 'cheapest' ? priceA - priceB : priceB - priceA;
      }
      return 0;
    });

    return result;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedKarat,
    maxWeight,
    inStockOnly,
    stoneFilter,
    sortBy,
    calculatePrice
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const categories = [
    { key: 'all', label: 'همه کالکشن‌ها' },
    { key: 'earrings', label: 'گوشواره' },
    { key: 'ring', label: 'انگشتر' },
    { key: 'necklace', label: 'گردنبند' },
    { key: 'bracelet', label: 'دستبند و النگو' },
    { key: 'set', label: 'نیم‌ست و سرویس' },
    { key: 'coin', label: 'سکه و شمش' },
    { key: 'pendant', label: 'آویز و پلاک' },
    { key: 'men', label: 'محصولات مردانه' },
    { key: 'kids', label: 'محصولات بچگانه' },
    { key: 'economic', label: 'محصولات کم‌اجرت' }
  ];

  const types = [
    { key: 'all', label: 'همه انواع' },
    { key: 'ring', label: 'انگشتر' },
    { key: 'necklace', label: 'گردنبند' },
    { key: 'pendant', label: 'آویز' },
    { key: 'earrings', label: 'گوشواره' },
    { key: 'bracelet', label: 'دستبند' },
    { key: 'bangle', label: 'النگو' },
    { key: 'anklet', label: 'پابند' },
    { key: 'set', label: 'سرویس کامل' },
    { key: 'half_set', label: 'نیم‌ست' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#0B080F]/10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
            کاتالوگ طلا و جواهر میوان
          </h1>
          <p className="text-xs text-[#A89B8A] mt-1 font-numeral">
            نمایش {toPersianDigits(filteredProducts.length)} قطعه طلا از مجموع ۵۰۰ محصول دست‌ساز
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder="جستجو در محصولات..."
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg pl-8 pr-3 py-2 text-[#0B080F] focus:border-[#D4AF37] outline-none"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A89B8A] hidden sm:inline">مرتب‌سازی:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
              className="text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-[#0B080F] focus:border-[#D4AF37] outline-none"
            >
              <option value="newest">جدیدترین محصولات</option>
              <option value="bestseller">پرفروش‌ترین‌ها</option>
              <option value="cheapest">ارزان‌ترین به گران‌ترین</option>
              <option value="expensive">گران‌ترین به ارزان‌ترین</option>
              <option value="lightest">سبک‌ترین وزن</option>
              <option value="heaviest">سنگین‌ترین وزن</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden p-2 bg-[#0B080F] text-white rounded-lg flex items-center gap-1.5 text-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فیلترها</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-[#0B080F]/5 h-fit sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0B080F]">
              <Filter className="w-4 h-4 text-[#D4AF37]" />
              <span>فیلترهای پیشرفته</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-[#A89B8A] hover:text-[#0B080F] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>بازنشانی</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <span className="block text-xs font-semibold text-[#0B080F] mb-2.5">دسته‌بندی اصلی</span>
            <div className="space-y-1">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => handleCategoryChange(c.key)}
                  className={`w-full text-right px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedCategory === c.key
                      ? 'bg-[#0B080F] text-[#D4AF37] font-semibold'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Types */}
          <div>
            <span className="block text-xs font-semibold text-[#0B080F] mb-2.5">نوع زیورآلات</span>
            <div className="flex flex-wrap gap-1.5">
              {types.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleTypeChange(t.key)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                    selectedType === t.key
                      ? 'bg-[#D4AF37] text-[#0B080F] border-[#D4AF37] font-semibold'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Karat */}
          <div>
            <span className="block text-xs font-semibold text-[#0B080F] mb-2">عیار طلا</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'all', label: 'همه' },
                { val: '18', label: '۱۸ عیار' },
                { val: '21', label: '۲۱ عیار' },
              ].map((k) => (
                <button
                  key={k.val}
                  onClick={() => setSelectedKarat(k.val)}
                  className={`py-1 text-xs rounded-lg border text-center transition-colors ${
                    selectedKarat === k.val
                      ? 'bg-[#0B080F] text-[#D4AF37] border-[#0B080F]'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* Weight Filter */}
          <div>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-semibold text-[#0B080F]">حداکثر وزن:</span>
              <span className="text-[#997D24] font-numeral">{toPersianDigits(maxWeight)} گرم</span>
            </div>
            <input
              type="range"
              min="2"
              max="80"
              step="2"
              value={maxWeight}
              onChange={(e) => setMaxWeight(Number(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          {/* Stone Status */}
          <div>
            <span className="block text-xs font-semibold text-[#0B080F] mb-2">نگین و جواهر</span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setStoneFilter('all')}
                className={`py-1 rounded-lg border ${
                  stoneFilter === 'all' ? 'bg-[#0B080F] text-[#D4AF37]' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                همه
              </button>
              <button
                onClick={() => setStoneFilter('withStone')}
                className={`py-1 rounded-lg border ${
                  stoneFilter === 'withStone' ? 'bg-[#0B080F] text-[#D4AF37]' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                نگین‌دار
              </button>
              <button
                onClick={() => setStoneFilter('noStone')}
                className={`py-1 rounded-lg border ${
                  stoneFilter === 'noStone' ? 'bg-[#0B080F] text-[#D4AF37]' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                بدون نگین
              </button>
            </div>
          </div>

          {/* Only in Stock */}
          <label className="flex items-center gap-2 cursor-pointer pt-2 border-t border-neutral-100">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded accent-[#D4AF37]"
            />
            <span className="text-xs text-[#0B080F]">فقط کالاهای آماده ارسال (موجود)</span>
          </label>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {visibleProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
              <p className="text-base font-semibold text-[#0B080F] mb-2">
                هیچ محصولی با فیلترهای انتخابی یافت نشد.
              </p>
              <p className="text-xs text-[#A89B8A] mb-6">
                می‌توانید فیلترها را حذف کرده یا عبارت دیگری را جستجو نمایید.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#0B080F] text-white text-xs font-semibold rounded-xl hover:bg-[#D4AF37] hover:text-[#0B080F] transition-colors"
              >
                حذف همه فیلترها
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Responsive Grid: 2 cols on mobile, 3 cols on desktop */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="px-8 py-3 bg-white border border-[#D4AF37] text-[#0B080F] hover:bg-[#D4AF37] hover:text-[#0B080F] text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    نمایش بیشتر ({toPersianDigits(filteredProducts.length - visibleCount)} محصول دیگر)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="font-bold text-sm text-[#0B080F]">فیلترهای محصولات</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <span className="block text-xs font-semibold text-[#0B080F] mb-2">دسته‌بندی</span>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      handleCategoryChange(c.key);
                      setIsFilterDrawerOpen(false);
                    }}
                    className={`w-full text-right px-3 py-2 rounded-lg text-xs ${
                      selectedCategory === c.key ? 'bg-[#0B080F] text-[#D4AF37] font-bold' : 'text-neutral-600'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full py-3 bg-[#0B080F] text-white text-xs font-bold rounded-xl"
            >
              مشاهده نتایج ({toPersianDigits(filteredProducts.length)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
