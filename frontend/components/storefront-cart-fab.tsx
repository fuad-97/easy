"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { currency } from "@/lib/format";
import { themeStyles } from "@/lib/store-theme";

interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
}

export function StorefrontCartFab({ slug, color = "#C2410C" }: { slug: string; color?: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const theme = themeStyles(color);

  useEffect(() => {
    const storageKey = `cart:${slug}`;

    const readCart = () => {
      const raw = localStorage.getItem(storageKey);
      setCart(raw ? JSON.parse(raw) : []);
    };

    readCart();
    window.addEventListener("focus", readCart);
    window.addEventListener("storage", readCart);

    const interval = window.setInterval(readCart, 1200);

    return () => {
      window.removeEventListener("focus", readCart);
      window.removeEventListener("storage", readCart);
      window.clearInterval(interval);
    };
  }, [slug]);

  const itemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0), [cart]);

  return (
    <Link
      href={`/s/${slug}/checkout`}
      className="fixed left-4 top-4 z-50 flex h-14 w-14 items-center justify-center rounded-full md:left-6 md:top-6"
      style={{ ...theme.button, boxShadow: `0 18px 40px ${color}59` }}
      aria-label="السلة"
    >
      <span className="text-2xl leading-none">🛒</span>
      <span className="absolute -right-1 -top-1 min-w-6 rounded-full bg-white px-1.5 py-1 text-center text-[11px] font-black" style={{ color }}>
        {itemCount}
      </span>
      {itemCount > 0 ? (
        <span className="absolute left-16 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-2 text-xs font-bold shadow-soft md:inline-flex" style={{ color }}>
          {currency(total)}
        </span>
      ) : null}
    </Link>
  );
}
