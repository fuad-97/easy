"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MerchantShell } from "@/components/merchant-shell";
import { SectionCard } from "@/components/ui";
import { merchantApi } from "@/lib/api";
import { Customer, ListResponse } from "@/lib/types";
import { currency } from "@/lib/format";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("merchant_token");
    if (!token) {
      router.push("/merchant/login");
      return;
    }
    merchantApi
      .customers(token)
      .then((data) => setCustomers((data as ListResponse<Customer>).items))
      .catch(() => router.push("/merchant/login"));
  }, [router]);

  return (
    <MerchantShell title="العملاء" subtitle="ملف مبسط لكل عميل مع عدد الطلبات وإجمالي الإنفاق.">
      <SectionCard title={`العملاء (${customers.length})`}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-[1.5rem] bg-white p-5">
              <p className="text-lg font-black text-ink">{customer.name}</p>
              <p className="mt-1 text-sm text-stone-500">{customer.phone}</p>
              <div className="mt-4 space-y-2 text-sm text-stone-600">
                <p>المنطقة: {customer.area || "غير محددة"}</p>
                <p>عدد الطلبات: {customer.order_count}</p>
                <p>إجمالي الطلبات: {currency(customer.total_spent)}</p>
                <p>آخر طلب: {customer.last_order_at ? new Date(customer.last_order_at).toLocaleDateString("ar-SA") : "لا يوجد"}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </MerchantShell>
  );
}
