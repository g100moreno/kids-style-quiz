import { fetchAllProducts } from "./client.js";
import { matchProducts } from "./matcher.js";

export { fetchAllProducts, matchProducts };

export async function fetchAndMatch({ shopify, answers, config }) {
  const products = await fetchAllProducts(shopify);
  return matchProducts(products, answers, config);
}
