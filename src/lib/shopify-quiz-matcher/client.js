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

function normalize(node, domain) {
  const { amount, currencyCode } = node.priceRange.minVariantPrice;
  return {
    id: node.id,
    title: node.title,
    description: node.description,
    price: parseFloat(amount),
    currency: currencyCode,
    image: node.featuredImage?.url ?? null,
    imageAlt: node.featuredImage?.altText ?? node.title,
    productUrl: node.onlineStoreUrl ?? `https://${domain}/products/${node.handle}`,
    tags: node.tags.map((t) => t.toLowerCase()),
  };
}

export async function fetchAllProducts({ domain, storefrontToken }) {
  const endpoint = `https://${domain}/api/2024-10/graphql.json`;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontToken,
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

    return data.products.edges.map(({ node }) => normalize(node, domain));
  } catch (err) {
    console.error("Shopify fetch error:", err);
    return [];
  }
}
