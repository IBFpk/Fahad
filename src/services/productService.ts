import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Category } from '../types';

export const productService = {
  async getProducts() {
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'products');
      return [];
    }
  },

  async getCategories() {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'categories');
      return [];
    }
  },

  async getProductById(id: string) {
    try {
      const docRef = doc(db, 'products', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Product;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `products/${id}`);
      return null;
    }
  },

  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
      return null;
    }
  },

  async addCategory(name: string) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), { name });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
      return null;
    }
  },

  async updateProduct(id: string, product: Partial<Product>) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...product,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
      return false;
    }
  },

  async bulkUpsertProducts(products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) {
    try {
      const batch = await import('firebase/firestore').then(m => m.writeBatch(db));
      const productsRef = collection(db, 'products');
      const categoriesRef = collection(db, 'categories');
      
      let createdCount = 0;
      let updatedCount = 0;

      // Get existing products to find matches by name
      const existingSnapshot = await getDocs(productsRef);
      const existingMap = new Map<string, string>(); // name -> id
      existingSnapshot.forEach(doc => {
        existingMap.set(doc.data().name.trim().toLowerCase(), doc.id);
      });

      // Get existing categories
      const categorySnapshot = await getDocs(categoriesRef);
      const categorySet = new Set(categorySnapshot.docs.map(d => d.data().name.trim().toLowerCase()));

      for (const p of products) {
        const nameTrimmed = p.name.trim();
        const nameLower = nameTrimmed.toLowerCase();
        
        // Add category if not exists
        if (p.category && !categorySet.has(p.category.trim().toLowerCase())) {
          const catDoc = doc(categoriesRef);
          batch.set(catDoc, { name: p.category.trim() });
          categorySet.add(p.category.trim().toLowerCase());
        }

        if (existingMap.has(nameLower)) {
          // Update existing
          const docRef = doc(db, 'products', existingMap.get(nameLower)!);
          batch.update(docRef, {
            ...p,
            name: nameTrimmed, // Keep trimmed name
            updatedAt: serverTimestamp()
          });
          updatedCount++;
        } else {
          // Add new
          const docRef = doc(productsRef);
          batch.set(docRef, {
            ...p,
            name: nameTrimmed, // Keep trimmed name
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          createdCount++;
        }
      }

      await batch.commit();
      return { success: true, createdCount, updatedCount };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
      return { success: false, createdCount: 0, updatedCount: 0 };
    }
  },

  async deleteProduct(id: string) {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
      return false;
    }
  }
};
