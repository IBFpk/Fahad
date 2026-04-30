import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
import { Plus, Trash2, Loader2, Save, LogIn, LogOut, UserCheck, Camera, Pencil, X, MessageSquare, Settings as SettingsIcon, Megaphone, Sparkles, Flame, Info } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { settingsService, WhatsAppSettings, PromotionSettings } from '../services/settingsService';
import { motion, AnimatePresence } from 'motion/react';

export const Admin = () => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [authMode, setAuthMode] = useState<'google' | 'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

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

  const [promoSettings, setPromoSettings] = useState<PromotionSettings>({
    active: false,
    text: '',
    type: 'info'
  });

  const [settingsTab, setSettingsTab] = useState<'whatsapp' | 'promo'>('whatsapp');

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
    const [p, c, s, promo] = await Promise.all([
      productService.getProducts(), 
      productService.getCategories(),
      settingsService.getWhatsAppSettings(),
      settingsService.getPromotionSettings()
    ]);
    setProducts(p);
    setCategories(c);
    setWhatsappSettings(s);
    setPromoSettings(promo);
    setLoading(false);
  };

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      setAuthError(error.message || "Login failed");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error("Email login failed", error);
      setAuthError("Invalid credentials or Email provider not enabled in Firebase.");
    } finally {
      setLoading(false);
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
      // Check if category exists in our local list, if not add it to DB
      const categoryExists = categories.some(c => c.name.toLowerCase() === formData.category?.toLowerCase());
      if (!categoryExists && formData.category) {
        await productService.addCategory(formData.category);
      }

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
      if (settingsTab === 'whatsapp') {
        await settingsService.updateWhatsAppSettings(whatsappSettings);
      } else {
        await settingsService.updatePromotionSettings(promoSettings);
      }
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
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-[2rem] border border-gray-100 shadow-2xl shadow-blue-900/10 w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-brand-blue mb-8 mx-auto rotate-3">
            <UserCheck size={40} />
          </div>
          
          <h1 className="text-3xl font-black mb-2">Admin Panel</h1>
          <p className="text-gray-500 mb-8 font-medium">Please sign in to manage your store.</p>
          
          {authError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 italic">
              {authError}
            </div>
          )}

          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-8">
            <button 
              onClick={() => setAuthMode('email')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-black transition-all ${authMode === 'email' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
            >
              Email Login
            </button>
            <button 
                onClick={() => setAuthMode('google')}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-black transition-all ${authMode === 'google' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
            >
              Google
            </button>
          </div>

          <AnimatePresence mode="wait">
            {authMode === 'email' ? (
              <motion.form 
                key="email-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleEmailLogin} 
                className="space-y-4"
              >
                <div className="text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue transition-all" 
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div className="text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Password</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand-blue transition-all" 
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-blue-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={20} /> Login with Email</>}
                </button>
                
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-4">
                  Note: You must enable Email Login and add your account in Firebase Console first.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="google-auth"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <button 
                  onClick={handleLogin} 
                  className="w-full py-5 border-2 border-gray-100 text-gray-900 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  <img src="https://www.gstatic.com/firebase/anonymous-scan.png" className="w-5 h-5 hidden" alt="" />
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-6 max-w-[240px] mx-auto leading-relaxed">
                  Requires "Authorized Domains" setup in Firebase console.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button 
            onClick={() => {
              setSettingsTab('promo');
              setShowSettings(true);
            }}
            className="flex items-center gap-2 bg-orange-50 text-orange-600 border border-orange-100 px-6 py-3 rounded-xl font-bold hover:bg-orange-100 transition-all shadow-sm"
          >
            <Megaphone size={20} /> Promotion
          </button>
          <button 
            onClick={() => {
              setSettingsTab('whatsapp');
              setShowSettings(true);
            }}
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
              <SettingsIcon className="text-brand-blue" /> Store Settings
            </h2>

            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
              <button 
                onClick={() => setSettingsTab('whatsapp')}
                className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${settingsTab === 'whatsapp' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
              >
                WhatsApp
              </button>
              <button 
                onClick={() => setSettingsTab('promo')}
                className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${settingsTab === 'promo' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
              >
                Promo Banner
              </button>
            </div>

            <div className="space-y-6">
              {settingsTab === 'whatsapp' ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <h4 className="text-xs font-black text-gray-900 uppercase">Active Banner</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Show banner on homepage</p>
                    </div>
                    <button 
                      onClick={() => setPromoSettings({...promoSettings, active: !promoSettings.active})}
                      className={`w-12 h-6 rounded-full transition-all relative ${promoSettings.active ? 'bg-brand-blue' : 'bg-gray-300'}`}
                    >
                      <motion.div 
                        animate={{ x: promoSettings.active ? 26 : 2 }}
                        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Promotion Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'sale', icon: Flame, label: 'Sale' },
                        { id: 'new', icon: Sparkles, label: 'New' },
                        { id: 'info', icon: Info, label: 'Info' }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setPromoSettings({...promoSettings, type: type.id as any})}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${promoSettings.type === type.id ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-50 bg-gray-50 text-gray-400 opacity-60'}`}
                        >
                          <type.icon size={18} />
                          <span className="text-[9px] font-black uppercase mt-1">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Banner Text</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none text-sm leading-relaxed"
                      value={promoSettings.text}
                      onChange={e => setPromoSettings({...promoSettings, text: e.target.value})}
                      placeholder="Enter promotion text here..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Link URL (Optional)</label>
                    <input 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                      value={promoSettings.link || ''}
                      onChange={e => setPromoSettings({...promoSettings, link: e.target.value})}
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}

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
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Description</label>
                  <span className="text-[10px] text-brand-blue font-bold uppercase">Markdown Supported</span>
                </div>
                <textarea 
                  rows={6} 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none resize-none focus:ring-2 focus:ring-brand-blue transition-all" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Enter features... Use - for bullet points."
                />
                <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">Use line breaks for new paragraphs. Use `- feature` for bullet points.</p>
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
