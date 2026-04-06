"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ui";
import { Product } from "@/lib/types";
import { themeStyles } from "@/lib/store-theme";

function buildCartSignature(
  productId: number,
  selectedOptions: { group_name: string; option_value: string; price_delta: number }[],
  notes: string
) {
  return JSON.stringify({
    productId,
    notes: notes.trim(),
    options: [...selectedOptions].sort((a, b) => a.group_name.localeCompare(b.group_name))
  });
}

export function StorefrontProductCard({
  slug,
  product,
  color
}: {
  slug: string;
  product: Product;
  color: string;
}) {
  const theme = themeStyles(color);

  function addToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    const raw = localStorage.getItem(`cart:${slug}`);
    const cart = raw ? JSON.parse(raw) : [];
    const selectedOptions: { group_name: string; option_value: string; price_delta: number }[] = [];
    const signature = buildCartSignature(product.id, selectedOptions, "");
    const existingIndex = cart.findIndex(
      (item: {
        product_id: number;
        selected_options?: { group_name: string; option_value: string; price_delta: number }[];
        notes?: string;
      }) => buildCartSignature(item.product_id, item.selected_options || [], item.notes || "") === signature
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
      cart[existingIndex].unit_price = product.price;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        quantity: 1,
        unit_price: product.price,
        image: product.images[0]?.image_url,
        selected_options: [],
        notes: ""
      });
    }

    localStorage.setItem(`cart:${slug}`, JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
  }

  return (
    <Link href={`/s/${slug}/products/${product.id}`} className="block">
      <ProductCard
        name={product.name}
        price={product.price}
        image={product.images[0]?.image_url}
        subtitle={product.description}
        accentColor={color}
        action={
          <button type="button" onClick={addToCart} className="w-full rounded-2xl px-4 py-3 text-sm font-black md:py-3.5" style={theme.button}>
            إضافة للسلة
          </button>
        }
      />
    </Link>
  );
}
