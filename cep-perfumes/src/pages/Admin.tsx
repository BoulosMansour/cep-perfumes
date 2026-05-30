import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, STORAGE_BUCKET, getImageUrl } from '../lib/supabase';
import type { Product, ProductInsert } from '../types';

// ─── Auth ────────────────────────────────────────────────────────────────────

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <span className="text-3xl">🌸</span>
          <h1 className="mt-2 text-xl font-bold text-stone-900">Admin Portal</h1>
          <p className="text-sm text-stone-400 mt-1">CEP Perfumes</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────

interface ProductFormProps {
  editing: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

function ProductForm({ editing, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [price, setPrice] = useState(editing ? String(editing.price) : '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editing?.image_url ? getImageUrl(editing.image_url) : null
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    return path;
  };

  const deleteImage = async (path: string) => {
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let imagePath = editing?.image_url ?? null;

      if (imageFile) {
        if (editing?.image_url) {
          await deleteImage(editing.image_url);
        }
        imagePath = await uploadImage(imageFile);
      }

      const payload: ProductInsert = {
        name: name.trim(),
        description: description.trim() || null,
        price: parseFloat(price),
        image_url: imagePath,
      };

      if (editing) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }

      onSave();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-stone-900 mb-4">
        {editing ? 'Edit Product' : 'Add New Product'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="e.g. Oud Royale"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Description <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
            placeholder="Brief description of the fragrance…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Price ($) *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Image <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          {imagePreview && (
            <div className="mb-2 relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                  if (fileRef.current) fileRef.current.value = '';
                }}
                className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ session }: { session: Session }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    closeForm();
    fetchProducts();
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    setDeleteError('');

    try {
      if (product.image_url) {
        await supabase.storage.from(STORAGE_BUCKET).remove([product.image_url]);
      }
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h1 className="text-lg font-bold text-stone-900 leading-none">Admin Portal</h1>
              <p className="text-xs text-stone-400">CEP Perfumes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-stone-400 truncate max-w-[160px]">
              {session.user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-stone-500 hover:text-stone-800 border border-stone-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Add button */}
        {!formOpen && (
          <div className="flex justify-end">
            <button
              onClick={openAdd}
              className="bg-amber-700 hover:bg-amber-800 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors flex items-center gap-2"
            >
              <span className="text-lg leading-none">+</span>
              Add Product
            </button>
          </div>
        )}

        {/* Form */}
        {formOpen && (
          <ProductForm editing={editingProduct} onSave={handleSave} onCancel={closeForm} />
        )}

        {/* Delete error */}
        {deleteError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {deleteError}
          </p>
        )}

        {/* Product list */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
                <div className="aspect-video bg-stone-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <p className="text-lg">No products yet.</p>
            <p className="mt-1 text-sm">Click "Add Product" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const imageUrl = product.image_url ? getImageUrl(product.image_url) : null;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm"
                >
                  <div className="aspect-video bg-stone-50 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-200">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-stone-900 truncate">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{product.description}</p>
                    )}
                    <p className="mt-1 font-bold text-amber-800 text-sm">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex-1 text-xs font-medium border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg py-1.5 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="flex-1 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg py-1.5 transition-colors disabled:opacity-50"
                      >
                        {deletingId === product.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return <Dashboard session={session} />;
}
