import type { Product } from '../types';
import { getImageUrl } from '../lib/supabase';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const imageUrl = product.image_url ? getImageUrl(product.image_url) : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
      <div className="aspect-square bg-stone-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-stone-900 text-base leading-snug">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-sm text-stone-500 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}
        <p className="mt-3 text-lg font-bold text-amber-800">
          ${Number(product.price).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
