"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

function sumPrice(faceValue: number, eGuideFee: number, serviceFee: number) {
  return faceValue + eGuideFee + serviceFee;
}

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
      <p className="admin-price-hint">
        Leave a Non-EU field empty to charge the EU price for Non-EU tickets as well.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-orders-table admin-prices-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Ticket type</th>
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
              const nonEuFaceValue = prices?.face_value_non_eu ?? null;
              const nonEuEGuideFee = prices?.eguide_fee_non_eu ?? null;
              const nonEuServiceFee = prices?.service_fee_non_eu ?? null;
              const euTotal = sumPrice(faceValue, eGuideFee, serviceFee);
              const nonEuTotal = sumPrice(
                nonEuFaceValue ?? faceValue,
                nonEuEGuideFee ?? eGuideFee,
                nonEuServiceFee ?? serviceFee,
              );
              const usesEuFallback =
                nonEuFaceValue === null && nonEuEGuideFee === null && nonEuServiceFee === null;

              return (
                <Fragment key={product.id}>
                  <tr key={`${product.id}-eu`}>
                    <td rowSpan={2}>
                      <strong>{product.name}</strong>
                      <span>{product.id}</span>
                    </td>
                    <td>
                      <span className="admin-price-region">EU</span>
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
                    <td className="admin-price-total">EUR {euTotal.toFixed(2)}</td>
                  </tr>
                  <tr key={`${product.id}-non-eu`}>
                    <td>
                      <span className="admin-price-region">Non-EU</span>
                    </td>
                    <td>
                      <input
                        type="number"
                        name={`${product.id}-faceValueNonEu`}
                        defaultValue={nonEuFaceValue ?? ""}
                        placeholder={String(faceValue)}
                        min="0"
                        step="0.01"
                        disabled={disabled}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name={`${product.id}-eGuideFeeNonEu`}
                        defaultValue={nonEuEGuideFee ?? ""}
                        placeholder={String(eGuideFee)}
                        min="0"
                        step="0.01"
                        disabled={disabled}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        name={`${product.id}-serviceFeeNonEu`}
                        defaultValue={nonEuServiceFee ?? ""}
                        placeholder={String(serviceFee)}
                        min="0"
                        step="0.01"
                        disabled={disabled}
                      />
                    </td>
                    <td className="admin-price-total">
                      EUR {nonEuTotal.toFixed(2)}
                      {usesEuFallback ? <span className="admin-price-note">same as EU</span> : null}
                    </td>
                  </tr>
                </Fragment>
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
