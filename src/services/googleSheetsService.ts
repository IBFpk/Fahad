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
              const mainImage = this.transformDriveUrl(row.Image || row.image || '');
              const galleryImages = (row.Images || row.images || '')
                .split(';')
                .map((s: string) => this.transformDriveUrl(s.trim()))
                .filter(Boolean);

              return {
                name: row.Name || row.name || '',
                price: Number((row.Price || row.price || '0').toString().replace(/[^0-9.]/g, '')),
                category: row.Category || row.category || 'General',
                brand: row.Brand || row.brand || '',
                description: (row.Description || row.description || '')
                  .split(';')
                  .map((s: string) => s.trim())
                  .join('\n'),
                image: mainImage,
                images: galleryImages,
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

  transformDriveUrl(url: string): string {
    if (!url) return '';
    
    // Clean URL and trim whitespace
    let cleanUrl = url.trim();
    
    // Ensure https if it's a protocol-relative or http URL
    if (cleanUrl.startsWith('//')) cleanUrl = 'https:' + cleanUrl;
    if (cleanUrl.startsWith('http:')) cleanUrl = cleanUrl.replace('http:', 'https:');

    if (!cleanUrl.includes('drive.google.com')) return cleanUrl;

    try {
      let fileId = '';
      if (cleanUrl.includes('/file/d/')) {
        const parts = cleanUrl.split('/file/d/');
        if (parts[1]) fileId = parts[1].split('/')[0];
      } else if (cleanUrl.includes('id=')) {
        const urlParams = new URL(cleanUrl).searchParams;
        fileId = urlParams.get('id') || '';
      } else if (cleanUrl.includes('/d/')) {
        const parts = cleanUrl.split('/d/');
        if (parts[1]) fileId = parts[1].split('/')[0];
      }

      if (fileId) {
        // This endpoint is generally more reliable for high-resolution hotlinking
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    } catch (e) {
      console.error('Error parsing drive URL:', cleanUrl);
    }
    return cleanUrl;
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
