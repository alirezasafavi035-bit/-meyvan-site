import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, FilterState } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { useGoldPrice } from '../context/GoldPriceContext';
import { useLanguage } from '../context/LanguageContext';
import { normalizePersianText } from '../utils/persian';
import { Filter, SlidersHorizontal, X, Search, RotateCcw } from 'lucide-react';

interface CatalogPageProps {
  products: Product[];
}

const PAGE_SIZE = 24;

export const CatalogPage: React.FC<CatalogPageProps> = ({ products }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { calculatePrice } = useGoldPrice();
  const { t, formatNum, formatGrams, getCategoryTitle, getTypeTitle, language } = useLanguage();

  // Mobile Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Read URL query params
  const initialCategory = searchParams.get('category') || 'all';
  const initialType = searchParams.get('type') || 'all';
  const initialKarat = searchParams.get('karat') || 'all';
  const initialSort = (searchParams.get('sortBy') as FilterState['sortBy']) || 'newest';
  const initialQuery = searchParams.get('q') || '';

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

  const handleTypeChange = (tVal: string) => {
    setSelectedType(tVal);
    setVisibleCount(PAGE_SIZE);
    updateUrlParams({ type: tVal });
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

    // Search query with Persian & Latin normalization
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase().trim();
      const normQuery = normalizePersianText(searchQuery);
      result = result.filter((p) => {
        const normName = normalizePersianText(p.name);
        const normSku = p.sku.toLowerCase();
        const normCat = normalizePersianText(p.categoryFa);
        const normType = normalizePersianText(p.typeFa);
        const nameEn = (p.nameEn || '').toLowerCase();
        return (
          normName.includes(normQuery) ||
          normSku.includes(qLower) ||
          normCat.includes(normQuery) ||
          normType.includes(normQuery) ||
          nameEn.includes(qLower) ||
          p.tags.some((tTag) => normalizePersianText(tTag).includes(normQuery))
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
      result = result.filter(
        (p) =>
          p.type === selectedType ||
          (selectedType === 'set' && (p.type === 'half_set' || p.category === 'set')) ||
          (selectedType === 'necklace' && p.type === 'pendant') ||
          (selectedType === 'bracelet' && (p.type === 'bangle' || p.type === 'anklet'))
      );
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
    { key: 'all', label: getCategoryTitle('all') },
    { key: 'earrings', label: getCategoryTitle('earrings') },
    { key: 'ring', label: getCategoryTitle('ring') },
    { key: 'necklace', label: getCategoryTitle('necklace') },
    { key: 'bracelet', label: getCategoryTitle('bracelet') },
    { key: 'set', label: getCategoryTitle('set') },
    { key: 'coin', label: getCategoryTitle('coin') },
    { key: 'pendant', label: getCategoryTitle('pendant') },
    { key: 'men', label: getCategoryTitle('men') },
    { key: 'kids', label: getCategoryTitle('kids') },
    { key: 'economic', label: getCategoryTitle('economic') }
  ];

  const types = [
    { key: 'all', label: getTypeTitle('all') },
    { key: 'ring', label: getTypeTitle('ring') },
    { key: 'necklace', label: getTypeTitle('necklace') },
    { key: 'pendant', label: getTypeTitle('pendant') },
    { key: 'earrings', label: getTypeTitle('earrings') },
    { key: 'bracelet', label: getTypeTitle('bracelet') },
    { key: 'bangle', label: getTypeTitle('bangle') },
    { key: 'anklet', label: getTypeTitle('anklet') },
    { key: 'set', label: getTypeTitle('set') },
    { key: 'half_set', label: getTypeTitle('half_set') }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#0B080F]/10 gap-4 text-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-[#0B080F]">
            {t('catalog.title')}
          </h1>
          <p className="text-xs text-[#A89B8A] mt-1 font-numeral">
            {t('catalog.count_summary', {
              count: formatNum(filteredProducts.length),
              total: formatNum(products.length)
            })}
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
              placeholder={t('catalog.search_placeholder')}
              className="w-full text-xs bg-white border border-neutral-300 rounded-lg ltr:pl-8 ltr:pr-3 rtl:pr-8 rtl:pl-3 py-2 text-[#0B080F] focus:border-[#D4AF37] outline-none"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute ltr:left-2.5 rtl:right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A89B8A] hidden sm:inline">{t('sort.label')}</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
              className="text-xs bg-white border border-neutral-300 rounded-lg px-3 py-2 text-[#0B080F] focus:border-[#D4AF37] outline-none"
            >
              <option value="newest">{t('sort.newest')}</option>
              <option value="bestseller">{t('sort.bestseller')}</option>
              <option value="cheapest">{t('sort.cheapest')}</option>
              <option value="expensive">{t('sort.expensive')}</option>
              <option value="lightest">{t('sort.lightest')}</option>
              <option value="heaviest">{t('sort.heaviest')}</option>
            </select>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden p-2 bg-[#0B080F] text-white rounded-lg flex items-center gap-1.5 text-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{t('catalog.filter.open_btn')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-[#0B080F]/5 h-fit sticky top-28 text-start">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-sm text-[#0B080F]">
              <Filter className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('catalog.filter.open_btn')}</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-[#A89B8A] hover:text-[#0B080F] flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{t('catalog.filter.reset')}</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <span className="block text-xs font-semibold text-[#0B080F] mb-2.5">
              {t('catalog.filter.category')}
            </span>
            <div className="space-y-1">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => handleCategoryChange(c.key)}
                  className={`w-full text-start px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
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
            <span className="block text-xs font-semibold text-[#0B080F] mb-2.5">
              {t('catalog.filter.type')}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {types.map((tItem) => (
                <button
                  key={tItem.key}
                  onClick={() => handleTypeChange(tItem.key)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors ${
                    selectedType === tItem.key
                      ? 'bg-[#D4AF37] text-[#0B080F] border-[#D4AF37] font-semibold'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  {tItem.label}
                </button>
              ))}
            </div>
          </div>

          {/* Karat */}
          <div>
            <span className="block text-xs font-semibold text-[#0B080F] mb-2">
              {t('catalog.filter.karat')}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'all', label: language === 'fa' ? 'همه' : 'All' },
                { val: '18', label: language === 'fa' ? '۱۸ عیار' : '18K' },
                { val: '21', label: language === 'fa' ? '۲۱ عیار' : '21K' },
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
              <span className="font-semibold text-[#0B080F]">{t('catalog.filter.max_weight')}</span>
              <span className="text-[#997D24] font-numeral">{formatGrams(maxWeight)}</span>
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
            <span className="block text-xs font-semibold text-[#0B080F] mb-2">
              {language === 'fa' ? 'نگین و جواهر' : 'Gemstones'}
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setStoneFilter('all')}
                className={`py-1 rounded-lg border ${
                  stoneFilter === 'all' ? 'bg-[#0B080F] text-[#D4AF37]' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {language === 'fa' ? 'همه' : 'All'}
              </button>
              <button
                onClick={() => setStoneFilter('withStone')}
                className={`py-1 rounded-lg border ${
                  stoneFilter === 'withStone' ? 'bg-[#0B080F] text-[#D4AF37]' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {language === 'fa' ? 'نگین‌دار' : 'Gems'}
              </button>
              <button
                onClick={() => setStoneFilter('noStone')}
                className={`py-1 rounded-lg border ${
                  stoneFilter === 'noStone' ? 'bg-[#0B080F] text-[#D4AF37]' : 'border-neutral-200 text-neutral-600'
                }`}
              >
                {language === 'fa' ? 'بدون نگین' : 'Plain'}
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
            <span className="text-xs text-[#0B080F]">{t('catalog.filter.in_stock')}</span>
          </label>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {visibleProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
              <p className="text-base font-semibold text-[#0B080F] mb-2">
                {language === 'fa'
                  ? 'هیچ محصولی با فیلترهای انتخابی یافت نشد.'
                  : 'No jewelry pieces match your active filters.'}
              </p>
              <p className="text-xs text-[#A89B8A] mb-6">
                {language === 'fa'
                  ? 'می‌توانید فیلترها را حذف کرده یا عبارت دیگری را جستجو نمایید.'
                  : 'You can reset filters or try searching for a different keyword.'}
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-[#0B080F] text-white text-xs font-semibold rounded-xl hover:bg-[#D4AF37] hover:text-[#0B080F] transition-colors"
              >
                {t('catalog.filter.reset')}
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
                <div className="text-center pt-8">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                    className="px-8 py-3 bg-white hover:bg-neutral-50 text-[#0B080F] border border-neutral-300 hover:border-[#D4AF37] text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    {t('catalog.load_more')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 text-start">
            <div className="flex items-center justify-between pb-4 border-b">
              <span className="font-bold text-sm text-[#0B080F]">{t('catalog.filter.open_btn')}</span>
              <button onClick={() => setIsFilterDrawerOpen(false)}>
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Category Options */}
            <div>
              <span className="block text-xs font-semibold mb-2">{t('catalog.filter.category')}</span>
              <div className="space-y-1">
                {categories.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => {
                      handleCategoryChange(c.key);
                      setIsFilterDrawerOpen(false);
                    }}
                    className={`w-full text-start px-2 py-1.5 rounded-lg text-xs ${
                      selectedCategory === c.key
                        ? 'bg-[#0B080F] text-[#D4AF37] font-semibold'
                        : 'text-neutral-600'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset CTA */}
            <button
              onClick={() => {
                handleResetFilters();
                setIsFilterDrawerOpen(false);
              }}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-[#0B080F] text-xs font-semibold rounded-xl"
            >
              {t('catalog.filter.reset')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
