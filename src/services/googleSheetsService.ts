import Papa from 'papaparse';
import { Product } from '../types';

export const googleSheetsService = {
  async fetchProductsFromSheet(sheetUrl: string): Promise<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]> {
    // Transform edit URL to CSV export URL if needed
    let csvUrl = sheetUrl;
    if (sheetUrl.includes('/edit')) {
      csvUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv');
    }

    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('Failed to fetch sheet. Ensure it is public.');
      
      const csvData = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const products = results.data.map((row: any) => {
              // Map row details to Product fields
              // We assume headers like: Name, Price, Category, Brand, Description, Image, Images, InStock, Specifications
              return {
                name: row.Name || row.name || '',
                price: Number((row.Price || row.price || '0').toString().replace(/[^0-9.]/g, '')),
                category: row.Category || row.category || 'General',
                brand: row.Brand || row.brand || '',
                description: row.Description || row.description || '',
                image: row.Image || row.image || '',
                images: (row.Images || row.images || '').split(';').map((s: string) => s.trim()).filter(Boolean),
                inStock: (row.InStock || row.inStock || 'true').toString().toLowerCase() === 'true',
                specifications: this.parseSpecifications(row.Specifications || row.specifications || '')
              };
            });
            resolve(products as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]);
          },
          error: (error: any) => reject(error)
        });
      });
    } catch (error) {
      console.error('Sheet Sync Error:', error);
      throw error;
    }
  },

  parseSpecifications(specStr: string): Record<string, string> {
    if (!specStr) return {};
    try {
      // Try JSON first
      if (specStr.trim().startsWith('{')) {
        return JSON.parse(specStr);
      }
    } catch (e) {}

    // Fallback to key:val; key2:val2
    const specs: Record<string, string> = {};
    specStr.split(';').forEach(pair => {
      const [key, val] = pair.split(':').map(s => s.trim());
      if (key && val) {
        specs[key] = val;
      }
    });
    return specs;
  }
};
