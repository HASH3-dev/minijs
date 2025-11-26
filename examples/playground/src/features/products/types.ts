export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
}
