import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Product, Category } from '../types';
import { Plus, Trash2, Loader2, Save, LogIn, LogOut, UserCheck, Camera, Pencil, X, MessageSquare, Settings as SettingsIcon, Megaphone, Sparkles, Flame, Info, Download, Upload } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signInWithEmailAndPassword } from 'firebase/auth';
import { settingsService, WhatsAppSettings, PromotionSettings, BrandSettings, BankAccount } from '../services/settingsService';
import { googleSheetsService } from '../services/googleSheetsService';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

export const Admin = () => {
  const { refreshSettings } = useSettings();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('https://docs.google.com/spreadsheets/d/1Ie8NX7tOSEus_UvFV3-qEqF1WEb8Wz2zZS3zghhD8CQ/edit?usp=sharing');
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
    whatsappTemplate: '',
    shareTemplate: ''
  });

  const [promoSettings, setPromoSettings] = useState<PromotionSettings>({
    active: false,
    text: '',
    type: 'info'
  });

  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    businessName: '',
    businessSub: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    instagramUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    logoType: 'icon',
    logoUrl: '',
    ogImageUrl: '',
    bankAccounts: []
  });

  // State for adding a new bank account in settings
  const [newBankName, setNewBankName] = useState('');
  const [newAccountTitle, setNewAccountTitle] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newIban, setNewIban] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newColor, setNewColor] = useState('bg-blue-50 border-blue-200');

  const [settingsTab, setSettingsTab] = useState<'whatsapp' | 'promo' | 'brand' | 'backup'>('brand');

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // Backup file state
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [backupImporting, setBackupImporting] = useState(false);

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
    const [p, c, s, promo, brand] = await Promise.all([
      productService.getProducts(), 
      productService.getCategories(),
      settingsService.getWhatsAppSettings(),
      settingsService.getPromotionSettings(),
      settingsService.getBrandSettings()
    ]);
    setProducts(p);
    setCategories(c);
    setWhatsappSettings(s);
    setPromoSettings(promo);
    setBrandSettings(brand);
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
  
  const handleSync = async () => {
    if (!sheetUrl) return;
    setSyncing(true);
    try {
      const sheetProducts = await googleSheetsService.fetchProductsFromSheet(sheetUrl);
      if (sheetProducts.length === 0) {
        alert("No products found in the sheet. Check your headers.");
        return;
      }
      
      const result = await productService.bulkUpsertProducts(sheetProducts);
      if (result.success) {
        alert(`Sync Complete!\n\n- Updated: ${result.updatedCount}\n- Created: ${result.createdCount}\n- Total: ${sheetProducts.length}`);
        await loadData();
        setShowSyncModal(false);
      } else {
        alert("Bulk update failed check console for details.");
      }
    } catch (err: any) {
      alert("Sync failed: " + err.message);
    } finally {
      setSyncing(false);
    }
  };

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
      } else if (settingsTab === 'promo') {
        await settingsService.updatePromotionSettings(promoSettings);
      } else if (settingsTab === 'brand') {
        await settingsService.updateBrandSettings(brandSettings);
      }
      refreshSettings();
      setShowSettings(false);
      alert("Settings saved successfully!");
    } catch (err: any) {
      console.error("Failed to save settings", err);
      alert("Failed to save settings: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        products: products,
        whatsappSettings: whatsappSettings,
        promoSettings: promoSettings,
        brandSettings: brandSettings
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `app-backup-${(brandSettings.businessName || 'universal').replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export backup data.");
    }
  };

  const handleImportBackup = async () => {
    if (!backupFile) {
      alert("Please select a valid backup JSON file first.");
      return;
    }
    
    if (!confirm("Are you sure you want to restore? This will bulk upsert all products and overwrite all store settings from the backup. This cannot be undone.")) {
      return;
    }

    setBackupImporting(true);
    try {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        try {
          const jsonText = e.target?.result as string;
          const data = JSON.parse(jsonText);
          
          if (!data || (!data.brandSettings && !data.products)) {
            throw new Error("Invalid backup file format. Must contain at least brandSettings or products.");
          }

          // Restore brand settings
          if (data.brandSettings) {
            await settingsService.updateBrandSettings(data.brandSettings);
            setBrandSettings(data.brandSettings);
          }
          // Restore WhatsApp settings
          if (data.whatsappSettings) {
            await settingsService.updateWhatsAppSettings(data.whatsappSettings);
            setWhatsappSettings(data.whatsappSettings);
          }
          // Restore Promo settings
          if (data.promoSettings) {
            await settingsService.updatePromotionSettings(data.promoSettings);
            setPromoSettings(data.promoSettings);
          }
          // Restore Products
          if (data.products && Array.isArray(data.products) && data.products.length > 0) {
            await productService.bulkUpsertProducts(data.products);
          }

          refreshSettings();
          await loadData();
          alert("Backup restored successfully!");
          setShowSettings(false);
        } catch (err: any) {
          alert("Error parsing backup: " + err.message);
        } finally {
          setBackupImporting(false);
          setBackupFile(null);
        }
      };
      fileReader.readAsText(backupFile);
    } catch (err) {
      alert("Failed to import backup data.");
      setBackupImporting(false);
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
            onClick={() => setShowSyncModal(true)}
            className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-6 py-3 rounded-xl font-bold hover:bg-green-100 transition-all shadow-sm"
          >
            <Sparkles size={20} /> Bulk Sync
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

      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative"
          >
            <button onClick={() => setShowSyncModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
              <Sparkles className="text-green-600" /> Google Sheets Sync
            </h2>
            
            <p className="text-gray-500 text-sm mb-6">
              Update your products in bulk using a public Google Sheet. Matching is done by <strong>Name</strong>.
            </p>

            <div className="mb-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Google Sheet URL</label>
              <input 
                className="w-full px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-sm" 
                value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>

            <div className="bg-blue-50 p-5 rounded-2xl mb-8">
              <h4 className="text-xs font-black text-brand-blue uppercase mb-3 px-1">Required Headers:</h4>
              <div className="flex flex-wrap gap-2">
                {['Name', 'Price', 'Category', 'Brand', 'Description', 'Image', 'Images', 'InStock', 'Specifications'].map(h => (
                  <span key={h} className="bg-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-gray-600 border border-blue-100 shadow-sm">{h}</span>
                ))}
              </div>
              <p className="text-[9px] text-blue-400 font-bold uppercase mt-4 text-center">
                Use ";" for Multiple Images & ":" for Specs (e.g. Weight: 10kg; Color: White)
              </p>
            </div>

            <button 
              onClick={handleSync}
              disabled={syncing}
              className="w-full py-5 bg-green-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-green-900/20 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {syncing ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Sync Products Now</>}
            </button>
          </motion.div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <SettingsIcon className="text-brand-blue" /> Store & System Settings
            </h2>

            <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-xl mb-6">
              <button 
                onClick={() => setSettingsTab('brand')}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${settingsTab === 'brand' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
              >
                Business Info
              </button>
              <button 
                onClick={() => setSettingsTab('whatsapp')}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${settingsTab === 'whatsapp' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
              >
                WhatsApp
              </button>
              <button 
                onClick={() => setSettingsTab('promo')}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${settingsTab === 'promo' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
              >
                Promo Banner
              </button>
              <button 
                onClick={() => setSettingsTab('backup')}
                className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${settingsTab === 'backup' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-400'}`}
              >
                Backup & Restore
              </button>
            </div>

            <div className="space-y-6">
              {settingsTab === 'brand' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Business Name</label>
                      <input 
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        value={brandSettings.businessName}
                        onChange={e => setBrandSettings({...brandSettings, businessName: e.target.value})}
                        placeholder="e.g. FAHAD ELECTRONICS"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Subtitle / Brand Descriptor</label>
                      <input 
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        value={brandSettings.businessSub}
                        onChange={e => setBrandSettings({...brandSettings, businessSub: e.target.value})}
                        placeholder="e.g. BEAUTY SHOP"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Business Description / Tagline</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none text-sm leading-relaxed"
                      value={brandSettings.description}
                      onChange={e => setBrandSettings({...brandSettings, description: e.target.value})}
                      placeholder="About your business..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Contact Address</label>
                    <input 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                      value={brandSettings.address}
                      onChange={e => setBrandSettings({...brandSettings, address: e.target.value})}
                      placeholder="Full shop / office address"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Phone / Tel Number</label>
                      <input 
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        value={brandSettings.phone}
                        onChange={e => setBrandSettings({...brandSettings, phone: e.target.value})}
                        placeholder="e.g. 021-32761001"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Business Email</label>
                      <input 
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        value={brandSettings.email}
                        onChange={e => setBrandSettings({...brandSettings, email: e.target.value})}
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Logo Type</label>
                      <select 
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                        value={brandSettings.logoType || 'icon'}
                        onChange={e => setBrandSettings({...brandSettings, logoType: e.target.value as any})}
                      >
                        <option value="icon">Standard Vector Icon (Gem)</option>
                        <option value="custom_image">Custom Image Logo URL</option>
                      </select>
                    </div>
                    {brandSettings.logoType === 'custom_image' && (
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Logo Image URL</label>
                        <input 
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all"
                          value={brandSettings.logoUrl || ''}
                          onChange={e => setBrandSettings({...brandSettings, logoUrl: e.target.value})}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">WhatsApp / Social Share Preview Image (OG Image URL)</label>
                    <input 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all text-sm"
                      value={brandSettings.ogImageUrl || ''}
                      onChange={e => setBrandSettings({...brandSettings, ogImageUrl: e.target.value})}
                      placeholder="e.g. https://example.com/share-banner.jpg"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      This image will appear in the preview box when you share your website link on WhatsApp, Facebook, or Twitter. Recommended size: 1200x630px. If left empty, it will automatically fall back to your custom logo image or standard banner.
                    </p>
                  </div>

                  {/* GOOGLE MAPS SETTINGS */}
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Google Maps Location</h3>
                    <div>
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Map Search Query / Address</label>
                      <input 
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all text-sm"
                        value={brandSettings.mapQuery || ''}
                        onChange={e => setBrandSettings({...brandSettings, mapQuery: e.target.value})}
                        placeholder="e.g. Hashoo Center Saddar Karachi"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">This query is used to load the interactive Google map on the About page. You can enter an address, shop name, or coordinates.</p>
                    </div>
                  </div>

                  {/* BUSINESS HOURS SECTION */}
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Business Hours</h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const hoursList = brandSettings.businessHours || [
                          { day: 'Monday', hours: '11:00 AM - 9:00 PM' },
                          { day: 'Tuesday', hours: '11:00 AM - 9:00 PM' },
                          { day: 'Wednesday', hours: '11:00 AM - 9:00 PM' },
                          { day: 'Thursday', hours: '11:00 AM - 9:00 PM' },
                          { day: 'Friday', hours: '11:00 AM - 9:00 PM (Closed 1-2 PM)' },
                          { day: 'Saturday', hours: '11:00 AM - 9:00 PM' },
                          { day: 'Sunday', hours: 'Closed' }
                        ];
                        const dayObj = hoursList.find(h => h.day === day) || { day, hours: '' };
                        return (
                          <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                            <span className="text-xs font-bold text-gray-700 w-24 uppercase tracking-wider">{day}</span>
                            <div className="flex gap-2 flex-1">
                              <input 
                                className="flex-1 px-3 py-1.5 bg-white rounded-lg outline-none border border-gray-200 text-xs focus:ring-1 focus:ring-brand-blue"
                                value={dayObj.hours}
                                onChange={e => {
                                  const updatedHours = hoursList.map(h => {
                                    if (h.day === day) {
                                      return { ...h, hours: e.target.value };
                                    }
                                    return h;
                                  });
                                  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                  const finalHours = allDays.map(d => {
                                    const existing = updatedHours.find(h => h.day === d);
                                    if (existing) return existing;
                                    const def = hoursList.find(h => h.day === d) || { day: d, hours: '11:00 AM - 9:00 PM' };
                                    return d === day ? { day: d, hours: e.target.value } : def;
                                  });
                                  setBrandSettings({...brandSettings, businessHours: finalHours});
                                }}
                                placeholder="e.g. 11:00 AM - 9:00 PM or Closed"
                              />
                              <button 
                                type="button"
                                onClick={() => {
                                  const updatedHours = hoursList.map(h => {
                                    if (h.day === day) {
                                      return { ...h, hours: 'Closed' };
                                    }
                                    return h;
                                  });
                                  setBrandSettings({...brandSettings, businessHours: updatedHours});
                                }}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-black uppercase transition-colors"
                              >
                                Closed
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* BANK ACCOUNTS SECTION */}
                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Bank Accounts for Payments</h3>
                    
                    {/* List Existing Bank Accounts */}
                    <div className="space-y-3 mb-6">
                      {(brandSettings.bankAccounts || []).map((account, index) => (
                        <div key={index} className={`p-4 rounded-xl border flex justify-between items-center ${account.color || 'bg-blue-50 border-blue-100'}`}>
                          <div>
                            <p className="text-xs font-black uppercase text-gray-900">{account.bank}</p>
                            <p className="text-[11px] font-semibold text-gray-600">Title: {account.title} | Acc: {account.acc}</p>
                            <p className="text-[10px] text-gray-400 font-mono">IBAN: {account.iban}</p>
                          </div>
                          <button 
                            onClick={() => {
                              const updatedAccounts = [...brandSettings.bankAccounts];
                              updatedAccounts.splice(index, 1);
                              setBrandSettings({...brandSettings, bankAccounts: updatedAccounts});
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {(!brandSettings.bankAccounts || brandSettings.bankAccounts.length === 0) && (
                        <p className="text-xs text-gray-400 italic">No bank accounts added yet.</p>
                      )}
                    </div>

                    {/* Add Bank Account form */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                      <p className="text-xs font-black text-gray-900 uppercase">Add Bank Account</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input 
                          className="px-3 py-2 bg-white rounded-lg text-xs outline-none border border-gray-200"
                          placeholder="Bank Name (e.g. Meezan Bank)"
                          value={newBankName}
                          onChange={e => setNewBankName(e.target.value)}
                        />
                        <input 
                          className="px-3 py-2 bg-white rounded-lg text-xs outline-none border border-gray-200"
                          placeholder="Account Title"
                          value={newAccountTitle}
                          onChange={e => setNewAccountTitle(e.target.value)}
                        />
                        <input 
                          className="px-3 py-2 bg-white rounded-lg text-xs outline-none border border-gray-200"
                          placeholder="Account Number"
                          value={newAccountNumber}
                          onChange={e => setNewAccountNumber(e.target.value)}
                        />
                        <input 
                          className="px-3 py-2 bg-white rounded-lg text-xs outline-none border border-gray-200"
                          placeholder="IBAN"
                          value={newIban}
                          onChange={e => setNewIban(e.target.value)}
                        />
                        <input 
                          className="px-3 py-2 bg-white rounded-lg text-xs outline-none border border-gray-200 sm:col-span-2"
                          placeholder="Branch (Optional)"
                          value={newBranch}
                          onChange={e => setNewBranch(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-gray-400 mr-2">Color Style:</span>
                        {[
                          { class: 'bg-blue-50 border-blue-200', label: 'Blue' },
                          { class: 'bg-purple-50 border-purple-200', label: 'Purple' },
                          { class: 'bg-yellow-50 border-yellow-200', label: 'Yellow' },
                          { class: 'bg-green-50 border-green-200', label: 'Green' },
                          { class: 'bg-red-50 border-red-200', label: 'Red' },
                          { class: 'bg-orange-50 border-orange-200', label: 'Orange' }
                        ].map(c => (
                          <button
                            key={c.class}
                            type="button"
                            onClick={() => setNewColor(c.class)}
                            className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border transition-all ${newColor === c.class ? 'border-gray-900 ring-2 ring-gray-200 scale-105' : 'border-gray-200 opacity-60'}`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newBankName || !newAccountTitle || !newAccountNumber || !newIban) {
                            alert("Please fill Bank Name, Title, Account Number, and IBAN to add.");
                            return;
                          }
                          const newAccount: BankAccount = {
                            bank: newBankName,
                            title: newAccountTitle,
                            acc: newAccountNumber,
                            iban: newIban,
                            branch: newBranch || undefined,
                            color: newColor
                          };
                          setBrandSettings({
                            ...brandSettings,
                            bankAccounts: [...(brandSettings.bankAccounts || []), newAccount]
                          });
                          // Clear fields
                          setNewBankName('');
                          setNewAccountTitle('');
                          setNewAccountNumber('');
                          setNewIban('');
                          setNewBranch('');
                        }}
                        className="w-full py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors"
                      >
                        + Append Bank Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'whatsapp' && (
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
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Buy Template (Contact Shop)</label>
                    <textarea 
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none text-sm leading-relaxed"
                      value={whatsappSettings.whatsappTemplate}
                      onChange={e => setWhatsappSettings({...whatsappSettings, whatsappTemplate: e.target.value})}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase">Placeholders:</span>
                      {['{{item_title}}', '{{brand}}', '{{price}}', '{{item_url}}'].map(p => (
                        <code key={p} className="text-[9px] bg-blue-50 text-brand-blue px-1.5 py-0.5 rounded font-mono font-bold uppercase">{p}</code>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Share Template (Social Sharing)</label>
                    <textarea 
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none text-sm leading-relaxed"
                      value={whatsappSettings.shareTemplate || ''}
                      onChange={e => setWhatsappSettings({...whatsappSettings, shareTemplate: e.target.value})}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase">Placeholders:</span>
                      {['{{item_title}}', '{{brand}}', '{{price}}', '{{item_url}}'].map(p => (
                        <code key={p} className="text-[9px] bg-blue-50 text-brand-blue px-1.5 py-0.5 rounded font-mono font-bold uppercase">{p}</code>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {settingsTab === 'promo' && (
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

              {settingsTab === 'backup' && (
                <div className="space-y-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  {/* Export Section */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Download size={18} className="text-brand-blue" /> Backup Store Data
                    </h4>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Download a single JSON file containing all products, categories, active promotions, WhatsApp message templates, and brand information. Use this to restore your shop's setup at any time.
                    </p>
                    <button 
                      onClick={handleExportBackup}
                      className="w-full py-4 bg-brand-blue text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                      <Download size={20} /> Export System Backup (.json)
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Import Section */}
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Upload size={18} className="text-green-600" /> Restore Point (Import Backup)
                    </h4>
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                      Restore your application state by uploading a previously downloaded backup JSON file. <strong>Warning:</strong> This will bulk upsert all imported products and completely overwrite your current configurations.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-100/50 transition-colors relative overflow-hidden">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                              {backupFile ? backupFile.name : "Select backup JSON file"}
                            </p>
                          </div>
                          <input 
                            type="file" 
                            accept=".json" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setBackupFile(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      </div>

                      {backupFile && (
                        <button 
                          onClick={handleImportBackup}
                          disabled={backupImporting}
                          className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-100 disabled:opacity-50"
                        >
                          {backupImporting ? <Loader2 className="animate-spin" /> : <><Upload size={20} /> Restore Point Now</>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab !== 'backup' && (
                <button 
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="w-full py-4 bg-brand-blue text-white rounded-xl font-black flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-lg shadow-blue-200"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Settings</>}
                </button>
              )}
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
                <div className="relative">
                  <select 
                    required={!formData.category}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none appearance-none border border-transparent focus:ring-2 focus:ring-brand-blue text-sm cursor-pointer pr-10"
                    value={
                      categories.some(c => c.name.trim().toLowerCase() === formData.category?.trim().toLowerCase()) 
                        ? categories.find(c => c.name.trim().toLowerCase() === formData.category?.trim().toLowerCase())?.name 
                        : (formData.category ? 'custom' : '')
                    }
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setFormData({...formData, category: ''});
                      } else {
                        setFormData({...formData, category: val});
                      }
                    }}
                  >
                    <option value="">-- Select Category --</option>
                    {/* Unique sorted list of categories */}
                    {Array.from(new Set([
                      ...categories.map(c => c.name.trim()),
                      "Split AC", "Refrigerator", "LED TV", "Washing Machine"
                    ])).sort().map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                    <option value="custom" className="font-bold text-brand-blue">+ Create Custom Category...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>

                {/* If custom is selected, or if the input doesn't match any of the standard categories */}
                {(!Array.from(new Set([
                  ...categories.map(c => c.name.trim().toLowerCase()),
                  "split ac", "refrigerator", "led tv", "washing machine"
                ])).includes(formData.category?.trim().toLowerCase()) || formData.category === '') && (
                  <div className="mt-3 animate-fadeIn">
                    <label className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1 block">Custom Category Name</label>
                    <input 
                      type="text"
                      placeholder="Type your new category name..."
                      required
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border border-gray-200 text-sm focus:ring-2 focus:ring-brand-blue"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                )}
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
                      <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
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
                  <img src={p.image} className="w-full h-full rounded-xl object-cover bg-gray-50" alt="" referrerPolicy="no-referrer" />
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
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover bg-gray-100" alt="" referrerPolicy="no-referrer" />
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
