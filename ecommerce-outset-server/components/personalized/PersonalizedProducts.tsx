import React, { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import { ProductService } from '../../services/product';
import { useUserStore } from '../../store/userStore';
import { usePreferencesStore } from '../../store/preferencesStore';

interface PersonalizedProductsProps {
  category?: string;
  maxProducts?: number;
  showPrice?: boolean;
  onProductClick?: (product: Product) => void;
}

export const PersonalizedProducts: React.FC<PersonalizedProductsProps> = ({
  category,
  maxProducts = 4,
  showPrice = true,
  onProductClick
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserStore();
  const { preferences } = usePreferencesStore();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const service = new ProductService();
        const fetchedProducts = await service.getPersonalizedProducts({
          userId: user.id,
          category,
          maxCount: maxProducts,
          preferences: {
            priceRange: preferences.priceRange,
            preferredCategories: preferences.preferredCategories,
            excludedCategories: preferences.excludedCategories
          }
        });
        setProducts(fetchedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [user, category, maxProducts, preferences]);

  if (isLoading) {
    return <div className="products-loading">Loading products...</div>;
  }

  if (error) {
    return <div className="products-error">Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div className="products-empty">No products to display</div>;
  }

  return (
    <div className="personalized-products">
      <h2 className="products-title">Recommended for You</h2>
      <div className="products-grid">
        {products.map(product => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => onProductClick?.(product)}
          >
            <div className="product-image">
              <img
                src={product.imageUrl}
                alt={product.name}
                loading="lazy"
              />
            </div>
            <div className="product-content">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              {showPrice && (
                <div className="product-price">
                  <span className="current-price">${product.price}</span>
                  {product.originalPrice && (
                    <span className="original-price">${product.originalPrice}</span>
                  )}
                </div>
              )}
              <div className="product-meta">
                <span className="product-category">{product.category}</span>
                {product.rating && (
                  <span className="product-rating">
                    {product.rating} ⭐
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 