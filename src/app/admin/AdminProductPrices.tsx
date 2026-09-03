"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getProductUnitPrice } from "@/data/site";
import { ProductPriceRow } from "@/lib/supabaseAdmin";
import { updateProductPrices } from "./actions";

type ProductOption = {
  id: string;
  name: string;
};

type AdminProductPricesProps = {
  products: ProductOption[];
  productPrices: ProductPriceRow[];
  disabled?: boolean;
};

export function AdminProductPrices({ products, productPrices, disabled = false }: AdminProductPricesProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const priceMap = new Map(productPrices.map((row) => [row.product_id, row]));

  const handleSubmit = (formData: FormData) => {
    setMessage("");
    setError("");

    startTransition(async () => {
      const result = await updateProductPrices(formData);

      if (result.ok) {
        setMessage("Prices updated.");
        router.refresh();
        return;
      }

      setError(result.error || "Unable to update prices.");
    });
  };

  return (
    <form action={handleSubmit} className="admin-prices-form">
      <div className="admin-table-wrap">
        <table className="admin-orders-table admin-prices-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Face value (EUR)</th>
              <th>E-guide fee (EUR)</th>
              <th>Service fee (EUR)</th>
              <th>Total / adult</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const prices = priceMap.get(product.id);
              const faceValue = prices?.face_value ?? 0;
              const eGuideFee = prices?.eguide_fee ?? 0;
              const serviceFee = prices?.service_fee ?? 0;
              const total = getProductUnitPrice({
                id: product.id,
                name: product.name,
                badge: "",
                summary: "",
                description: "",
                duration: "",
                address: "",
                heroImage: "",
                faceValue,
                eGuideFee,
                serviceFee,
                includes: [],
              });

              return (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                    <span>{product.id}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`${product.id}-faceValue`}
                      defaultValue={faceValue}
                      min="0"
                      step="0.01"
                      required
                      disabled={disabled}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`${product.id}-eGuideFee`}
                      defaultValue={eGuideFee}
                      min="0"
                      step="0.01"
                      required
                      disabled={disabled}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name={`${product.id}-serviceFee`}
                      defaultValue={serviceFee}
                      min="0"
                      step="0.01"
                      required
                      disabled={disabled}
                    />
                  </td>
                  <td className="admin-price-total">EUR {total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-availability-actions">
        <button type="submit" className="admin-success-button" disabled={isPending || disabled}>
          {isPending ? "Saving..." : "Save all prices"}
        </button>
      </div>

      {message ? <p className="admin-success">{message}</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}
    </form>
  );
}
