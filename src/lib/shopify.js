const DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN;
const TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN;
const ENDPOINT = `https://${DOMAIN}/api/2024-10/graphql.json`;

const QUERY = `{
  products(first: 250) {
    edges {
      node {
        id
        title
        description
        handle
        tags
        onlineStoreUrl
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        featuredImage {
          url
          altText
        }
      }
    }
  }
}`;

export async function fetchProducts() {
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": TOKEN,
      },
      body: JSON.stringify({ query: QUERY }),
    });

    if (!res.ok) {
      console.error("Shopify fetch failed:", res.status, res.statusText);
      return [];
    }

    const { data, errors } = await res.json();

    if (errors?.length) {
      console.error("Shopify GraphQL errors:", errors);
      return [];
    }

    return data.products.edges.map(({ node }) => {
      const { amount, currencyCode } = node.priceRange.minVariantPrice;
      return {
        id: node.id,
        title: node.title,
        description: node.description,
        price: parseFloat(amount),
        currency: currencyCode,
        image: node.featuredImage?.url ?? null,
        imageAlt: node.featuredImage?.altText ?? node.title,
        productUrl: node.onlineStoreUrl ?? `https://${DOMAIN}/products/${node.handle}`,
        tags: node.tags.map((t) => t.toLowerCase()),
      };
    });
  } catch (err) {
    console.error("Shopify fetch error:", err);
    return [];
  }
}
