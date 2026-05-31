import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import type { Product, WhatsAppNumber } from '../types';

const WHATSAPP_MESSAGE = encodeURIComponent("Hello! I'm interested in your perfumes.");

const WhatsAppIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function WhatsAppButton({ numbers }: { numbers: WhatsAppNumber[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (numbers.length === 0) return null;

  if (numbers.length === 1) {
    return (
      <a
        href={`https://wa.me/${numbers[0].number}?text=${WHATSAPP_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 group"
        aria-label="Contact us on WhatsApp"
      >
        <WhatsAppIcon />
        <span className="text-sm font-medium max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Contact Us
        </span>
      </a>
    );
  }

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white rounded-2xl shadow-xl border border-stone-100 py-2 min-w-[180px]">
          {numbers.map((n) => (
            <a
              key={n.id}
              href={`https://wa.me/${n.number}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors"
            >
              <span className="text-green-500 flex-shrink-0"><WhatsAppIcon /></span>
              <span className="text-sm font-medium text-stone-800">{n.label}</span>
            </a>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Contact us on WhatsApp"
      >
        <WhatsAppIcon />
      </button>
    </div>
  );
}

export function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [whatsappNumbers, setWhatsappNumbers] = useState<WhatsAppNumber[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to load products. Please try again later.');
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    }

    async function fetchWhatsAppNumbers() {
      const { data } = await supabase
        .from('whatsapp_numbers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });
      setWhatsappNumbers(data ?? []);
    }

    fetchProducts();
    fetchWhatsAppNumbers();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🌸</span>
          <div>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">CEP Perfumes</h1>
            <p className="text-xs text-stone-400 leading-none">Premium Fragrances</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-50 to-stone-100 border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
            Discover Your Signature Scent
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Curated collection of premium perfumes for every occasion.
          </p>
        </div>
      </div>

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="aspect-square bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-5 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-stone-400">
            <p className="text-lg">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <p className="text-xl">No products available yet.</p>
            <p className="mt-2 text-sm">Check back soon!</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} CEP Perfumes. All rights reserved.
        </div>
      </footer>

      <WhatsAppButton numbers={whatsappNumbers} />
    </div>
  );
}
