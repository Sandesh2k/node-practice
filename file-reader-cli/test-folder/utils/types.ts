type ID = string | number;

interface Product {
  id: ID;
  name: string;
  price: number;
}

export function getProductName(product: Product): string {
  return product.name;
}