import React, { useState, useEffect } from 'react';

import { StorefrontItemsWrapper } from './styles';

import IndividualItem from './IndividualItem';

import { Product } from '../../schema/schema';

import { arrayOfFavorites } from '../../api/supabase/queries/user_queries';

function Storefront({ products }: { products: Product[] }) {
  const [Favorites, setFavorites] = useState<Product[]>([]);
  async function fetchProducts() {
    const data = (await arrayOfFavorites()) as Product[];
    setFavorites(data);
  }
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <StorefrontItemsWrapper>
      {products.map(productVal => (
        <IndividualItem
          products={Favorites}
          product={productVal}
          key={productVal.id}
        />
      ))}
    </StorefrontItemsWrapper>
  );
}

export default Storefront;
