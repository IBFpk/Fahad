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
