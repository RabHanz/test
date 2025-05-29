import React from 'react';
import { usePersonalization } from '../hooks/usePersonalization';
import { InteractionType } from '../types/personalization';

interface PersonalizedProductsProps {
  maxProducts?: number;
}

export function PersonalizedProducts({ maxProducts = 4 }: PersonalizedProductsProps) {
  const {
    getPersonalizedProducts,
    trackUserInteraction,
    context,
  } = usePersonalization();

  const products = getPersonalizedProducts().slice(0, maxProducts);

  React.useEffect(() => {
    if (products.length > 0) {
      trackUserInteraction(InteractionType.PRODUCT_RECOMMENDATION_VIEW, {
        productIds: products.map((p) => p.id),
        persona: context.persona,
        engagementLevel: context.engagementLevel,
      });
    }
  }, [products, context, trackUserInteraction]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="personalized-products">
      <h3>Recommended for You</h3>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image"
            />
            <h4>{product.name}</h4>
            <p className="product-price">${product.price.toFixed(2)}</p>
            <p className="product-description">{product.description}</p>
            <button
              className="view-product-button"
              onClick={() =>
                trackUserInteraction(InteractionType.PRODUCT_CLICK, {
                  productId: product.id,
                  persona: context.persona,
                })
              }
            >
              View Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 