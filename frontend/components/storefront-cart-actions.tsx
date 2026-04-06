"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { themeStyles } from "@/lib/store-theme";

interface CartItem {
  product_id: number;
  quantity: number;
}

export function StorefrontCheckoutLink({
  slug,
  color = "#C2410C",
  className = "",
  variant = "solid"
}: {
  slug: string;
  color?: string;
  className?: string;
  variant?: "solid" | "ghost" | "white";
}) {
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

  if (itemCount === 0) return null;

  const style =
    variant === "ghost"
      ? theme.buttonGhost
      : variant === "white"
        ? { backgroundColor: "#FFFFFF", color }
        : theme.button;

  return (
    <Link href={`/s/${slug}/checkout`} className={className} style={style}>
      إتمام الطلب
    </Link>
  );
}
