import React, { useState, useEffect } from 'react';
import {
  Tractor,
  Search,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Calendar,
  Building2,
  User
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getProducts } from '../services/api';
import { MACHINERY_CATEGORIES } from '../services/mockData';
import { formatNPR } from '../utils/nepaliValidators';
import { formatDisplayDate } from '../services/nepaliDate';
import Modal from '../components/common/Modal';

export default function Products() {
  const { t, isNepali } = useLanguage();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts(search, category);
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('navProducts')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isNepali
              ? 'केन्द्रीय मेसिनरी क्याटलग, प्रमाणित इन्जिन नम्बर, फोटो ग्यालरी र अनुदान इतिहास'
              : 'Registered agricultural machinery with photo gallery and historical subsidy links'}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search engine number, brand, model..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {MACHINERY_CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>
              {isNepali ? c.nameNe : c.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-semibold animate-pulse">
          Loading machinery catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <Tractor className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No machinery registered</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition flex flex-col"
            >
              {/* Photo Banner */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                {p.photo_urls && p.photo_urls.length > 0 ? (
                  <img
                    src={p.photo_urls[0]}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}

                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                    {p.category}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  {p.hasActiveSubsidy ? (
                    <span className="px-2 py-0.5 rounded-md bg-gov-700 text-white text-[11px] font-bold shadow">
                      Subsidized
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-slate-700 text-white text-[11px] font-semibold">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>

              {/* Machine Specs */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{p.name}</h3>
                  <p className="text-xs text-slate-500">{p.brand} {p.model_no && `• ${p.model_no}`}</p>

                  <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Normalized Engine Number
                    </span>
                    <span className="font-mono font-extrabold text-slate-900 text-xs">
                      {p.engine_number}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {p.subsidy ? `${p.subsidy.subsidy_year_bs} BS` : 'No subsidy yet'}
                  </span>
                  <button
                    onClick={() => setSelectedProduct(p)}
                    className="px-3 py-1 bg-slate-100 hover:bg-gov-100 text-slate-700 hover:text-gov-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Record</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL WITH PHOTO GALLERY */}
      <Modal
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct?.name || 'Machinery Record'}
        maxWidth="max-w-2xl"
      >
        {selectedProduct && (
          <div className="space-y-4 text-xs text-slate-700">
            {/* Photo Gallery */}
            {selectedProduct.photo_urls && selectedProduct.photo_urls.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {selectedProduct.photo_urls.map((u, i) => (
                  <img
                    key={i}
                    src={u}
                    alt="Gallery"
                    className="rounded-xl border border-slate-200 aspect-video object-cover"
                  />
                ))}
              </div>
            )}

            {/* Specifications Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block font-semibold">Normalized Engine Number:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{selectedProduct.engine_number}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Chassis Number:</span>
                <span className="font-mono text-slate-800">{selectedProduct.chassis_no || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Category:</span>
                <span className="font-semibold text-slate-800">{selectedProduct.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Manufacturer:</span>
                <span className="font-semibold text-slate-800">{selectedProduct.brand}</span>
              </div>
            </div>

            {/* Linked Subsidy History */}
            {selectedProduct.hasActiveSubsidy && selectedProduct.subsidy ? (
              <div className="p-4 bg-gov-50/70 rounded-2xl border border-gov-200 space-y-2">
                <span className="font-bold text-gov-900 text-xs block">Active Subsidy Grant:</span>
                <div className="flex items-center justify-between">
                  <span>Granting Office:</span>
                  <strong>{selectedProduct.office?.name}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Beneficiary Farmer:</span>
                  <strong>{selectedProduct.farmer?.name} ({selectedProduct.farmer?.phone})</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Disbursed Amount:</span>
                  <strong>{formatNPR(selectedProduct.subsidy.amount)} ({selectedProduct.subsidy.percentage}%)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fiscal Year:</span>
                  <strong>{selectedProduct.subsidy.subsidy_year_bs} BS</strong>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic">No subsidy has been disbursed for this machine yet.</p>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

