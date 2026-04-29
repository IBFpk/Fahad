import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
import { Plus, Trash2, Loader2, Save, LogIn, LogOut, UserCheck, Camera, Pencil, X, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { settingsService, WhatsAppSettings } from '../services/settingsService';
import { motion } from 'motion/react';

export const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: '',
    description: '',
    image: '',
    images: [],
    brand: '',
    inStock: true,
    specifications: {}
  });

  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    whatsapp: '',
    whatsappTemplate: ''
  });

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadData();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, c, s] = await Promise.all([
      productService.getProducts(), 
      productService.getCategories(),
      settingsService.getWhatsAppSettings()
    ]);
    setProducts(p);
    setCategories(c);
    setWhatsappSettings(s);
    setLoading(false);
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => auth.signOut();

  const optimizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const optimized = await optimizeImage(file);
      if (!formData.image) {
        setFormData({ ...formData, image: optimized });
      } else {
        setFormData({ ...formData, images: [...(formData.images || []), optimized] });
      }
    } catch (err) {
      alert("Image processing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      setTimeout(() => setConfirmingId(null), 3000); // Reset after 3 seconds
      return;
    }
    
    setLoading(true);
    try {
      await productService.deleteProduct(id);
      await loadData();
      setConfirmingId(null);
    } catch (err) {
      alert("Delete failed.");
      setLoading(false);
    }
  };

  const addSpec = () => {
    if (newSpecKey && newSpecVal) {
      setFormData({
        ...formData,
        specifications: { ...(formData.specifications || {}), [newSpecKey]: newSpecVal }
      });
      setNewSpecKey('');
      setNewSpecVal('');
    }
  };

  const removeSpec = (k: string) => {
    const updated = { ...(formData.specifications || {}) };
    delete updated[k];
    setFormData({ ...formData, specifications: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) return;

    // Auto-add pending spec if exists
    let finalSpecs = { ...(formData.specifications || {}) };
    if (newSpecKey && newSpecVal) {
      finalSpecs[newSpecKey] = newSpecVal;
    }

    setLoading(true);
    try {
      const dataToSave = { ...formData, specifications: finalSpecs };
      if (editingId) {
        await productService.updateProduct(editingId, dataToSave);
      } else {
        await productService.addProduct(dataToSave as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
      }
      await loadData();
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', price: 0, category: '', description: '', image: '', images: [], brand: '', inStock: true, specifications: {} });
      setNewSpecKey('');
      setNewSpecVal('');
    } catch (error) {
      alert("Action failed. Ensure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await settingsService.updateWhatsAppSettings(whatsappSettings);
      setShowSettings(false);
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-brand-blue mb-6">
          <UserCheck size={40} />
        </div>
        <h1 className="text-3xl font-black mb-4">Admin Authentication</h1>
        <p className="text-gray-500 mb-8 max-w-md"> Please sign in with your authorized Google account. </p>
        <button onClick={handleLogin} className="flex items-center gap-3 bg-brand-blue text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all active:scale-[0.98]">
          <LogIn size={20} /> Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Logged in as: <span className="font-semibold">{user.email}</span></p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            <SettingsIcon size={20} /> Settings
          </button>
          <button 
            onClick={() => {
              setIsAdding(!isAdding);
              if (isAdding) setEditingId(null);
            }} 
            className="flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200"
          >
            {isAdding ? 'Cancel' : <><Plus size={20} /> Add Product</>}
          </button>
          <button onClick={handleLogout} className="p-3 text-gray-400 hover:text-brand-red">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative"
          >
            <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <MessageSquare className="text-brand-blue" /> WhatsApp Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">
                  WhatsApp Number (with country code, no +)
                </label>
                <input 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                  value={whatsappSettings.whatsapp}
                  onChange={e => setWhatsappSettings({...whatsappSettings, whatsapp: e.target.value})}
                  placeholder="923350237370"
                />
                <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Example: 923001234567 for Pakistan</p>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Message Template</label>
                <textarea 
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none text-sm leading-relaxed"
                  value={whatsappSettings.whatsappTemplate}
                  onChange={e => setWhatsappSettings({...whatsappSettings, whatsappTemplate: e.target.value})}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Available Placeholders:</span>
                  {['{{item_title}}', '{{price}}', '{{item_url}}', '{{image_url}}'].map(p => (
                    <code key={p} className="text-[9px] bg-blue-50 text-brand-blue px-1.5 py-0.5 rounded font-mono font-bold uppercase">{p}</code>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full py-4 bg-brand-blue text-white rounded-xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-lg shadow-blue-200"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Settings</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-xl mb-12">
          <h2 className="text-2xl font-black mb-8">{editingId ? 'Edit Product' : 'New Product'}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Product Name</label>
                  <input required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Brand</label>
                  <input className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Price</label>
                  <input type="number" required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Category</label>
                <input list="cats" required className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                <datalist id="cats">
                  {categories.map(c => <option key={c.id} value={c.name} />)}
                  <option value="Split AC" /><option value="Refrigerator" /><option value="LED TV" /><option value="Washing Machine" />
                </datalist>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Description</label>
                <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Product Photos</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[formData.image, ...(formData.images || [])].filter(Boolean).map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-white group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button" 
                        onClick={() => {
                          const allImages = [formData.image, ...(formData.images || [])].filter(Boolean);
                          const updated = allImages.filter((_, idx) => idx !== i);
                          setFormData({
                            ...formData,
                            image: updated[0] || '',
                            images: updated.slice(1)
                          });
                        }} 
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group">
                    <Camera size={20} className="text-gray-400 group-hover:text-brand-blue transition-colors" />
                    <span className="text-[8px] font-bold text-gray-400 mt-1 uppercase">Add</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Technical Specs & Features</label>
                
                {/* List of already added specs */}
                <div className="space-y-2 mb-4">
                  {Object.entries(formData.specifications || {}).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center bg-blue-50/50 border border-blue-100 px-4 py-3 rounded-xl text-sm group">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-tighter">{k}</span>
                        <span className="font-bold text-gray-900">{v}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeSpec(k)} 
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new spec inputs */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase text-center">Add New Specification</p>
                  <div className="flex flex-col gap-2">
                    <input 
                      placeholder="Label (e.g. Color)" 
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue transition-colors" 
                      value={newSpecKey} 
                      onChange={e => setNewSpecKey(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && e.preventDefault()}
                    />
                    <div className="flex gap-2">
                      <input 
                        placeholder="Value (e.g. Black)" 
                        className="flex-grow px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brand-blue transition-colors" 
                        value={newSpecVal} 
                        onChange={e => setNewSpecVal(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSpec();
                          }
                        }}
                      />
                      <button 
                        type="button" 
                        onClick={addSpec} 
                        className="px-4 bg-brand-blue text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center shrink-0"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 italic text-center">Tip: Click "+" to add then "Save Product" at bottom</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 active:scale-[0.99] transition-all">
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={22} /> {editingId ? 'Update Product' : 'Save Product'}</>}
          </button>
        </form>
      )}

          {/* Grid View for Mobile / Card view */}
          <div className="block md:hidden space-y-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 items-center shadow-sm">
                <div className="w-20 h-20 flex-shrink-0">
                  <img src={p.image} className="w-full h-full rounded-xl object-cover bg-gray-50" alt="" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-sm leading-tight mb-1 truncate text-gray-900">{p.name}</h3>
                  <p className="text-brand-blue font-black text-xs">PKR {p.price.toLocaleString()}</p>
                  <div className="flex gap-3 mt-3">
                    <button 
                      onClick={() => handleEdit(p)} 
                      className="flex-1 bg-blue-50 text-brand-blue py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all ${
                        confirmingId === p.id 
                          ? 'bg-red-600 text-white shadow-lg scale-105' 
                          : 'bg-red-50 text-red-500'
                      }`}
                    >
                      <Trash2 size={14} /> {confirmingId === p.id ? 'Confirm?' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
              <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt="" />
                    <span className="font-bold text-gray-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-8 py-4"><span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded uppercase">{p.category}</span></td>
                <td className="px-8 py-4 font-black">PKR {p.price.toLocaleString()}</td>
                <td className="px-8 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2.5 text-gray-400 hover:text-brand-blue hover:bg-white rounded-xl transition-all shadow-sm"><Pencil size={18} /></button>
                    <button 
                      onClick={() => handleDelete(p.id)} 
                      className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 ${
                        confirmingId === p.id 
                          ? 'bg-red-600 text-white scale-110' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-white'
                      }`}
                      title={confirmingId === p.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 size={18} />
                      {confirmingId === p.id && <span className="text-[10px] font-black uppercase">Confirm?</span>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
