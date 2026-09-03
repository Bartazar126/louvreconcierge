"use client";

import { useState } from "react";
import { BookingWidget } from "@/components/BookingWidget";
import { HeroProductSelector } from "@/components/HeroProductSelector";
import { Locale, ui } from "@/data/i18n";
import { Product } from "@/data/site";

function IncludedIcon({ type }: { type: "ticket" | "mobile" | "plus" | "clock" | "map" | "undo" }) {
  const paths = {
    ticket:
      "M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm64 320H64V320c35.3 0 64 28.7 64 64zM64 192V128h64c0 35.3-28.7 64-64 64zM448 384c0-35.3 28.7-64 64-64v64H448zm64-192c-35.3 0-64-28.7-64-64h64v64zM288 160a96 96 0 1 1 0 192 96 96 0 1 1 0-192z",
    mobile:
      "M80 0C44.7 0 16 28.7 16 64V448c0 35.3 28.7 64 64 64H304c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H80zM192 400a48 48 0 1 0 0 96 48 48 0 1 0 0-96z",
    plus:
      "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z",
    clock:
      "M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z",
    map:
      "M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z",
    undo:
      "M48 256c0-114.9 93.1-208 208-208c48.3 0 92.7 16.5 128 44.1V48c0-17.7 14.3-32 32-32s32 14.3 32 32V176c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32s14.3-32 32-32h65.4C327.9 124.1 294.1 112 256 112c-79.5 0-144 64.5-144 144s64.5 144 144 144c44.2 0 83.7-19.9 110.1-51.2c11.4-13.5 31.6-15.3 45.1-3.9s15.3 31.6 3.9 45.1C376.9 435.4 319.7 464 256 464C141.1 464 48 370.9 48 256z",
  };

  return (
    <svg viewBox={type === "ticket" ? "0 0 576 512" : type === "mobile" || type === "map" ? "0 0 384 512" : "0 0 512 512"} aria-hidden="true">
      <path d={paths[type]} />
    </svg>
  );
}

function ProductCopy({
  product,
  copy,
  priceCopy,
}: {
  product: Product | null;
  copy: typeof ui.en.flow;
  priceCopy: typeof ui.en.booking;
}) {
  if (!product) {
    return (
      <div className="product-copy">
        <h2>{copy.selectTitle}</h2>
        <p>{copy.selectText}</p>
        <div className="seo-content-block">
          <p>{copy.seoIntro}</p>
          <h3>{copy.whyPackage}</h3>
          <ul className="included-lines default-benefits">
            {copy.benefits.map((benefit: [string, string], index: number) => (
              <li key={benefit[0]}>
                <IncludedIcon type={index === 0 ? "ticket" : index === 1 ? "plus" : "map"} />
                <span>
                  <strong>{benefit[0]}</strong>
                  <br />
                  {benefit[1]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const totalPackagePrice = product.faceValue + product.eGuideFee + product.serviceFee;

  return (
    <div className="product-copy">
      {product.badge ? <span className="red-badge">{product.badge}</span> : null}
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p>{copy.packageDisclosure}</p>
      <div className="product-price-disclosure" aria-label={priceCopy.breakdown}>
        <h3>{priceCopy.breakdown}</h3>
        <div>
          <span>{priceCopy.faceValue}</span>
          <strong>EUR {product.faceValue.toFixed(2)}</strong>
        </div>
        <div>
          <span>{priceCopy.eGuideFee}</span>
          <strong>EUR {product.eGuideFee.toFixed(2)}</strong>
        </div>
        <div>
          <span>{priceCopy.serviceFee}</span>
          <strong>EUR {product.serviceFee.toFixed(2)}</strong>
        </div>
        <div className="total">
          <span>{copy.totalPackagePrice}</span>
          <strong>EUR {totalPackagePrice.toFixed(2)}</strong>
        </div>
      </div>
      <h3>{copy.included}</h3>
      <ul className="included-lines">
        {product.includes.slice(0, 3).map((item, index) => (
          <li key={item}>
            <IncludedIcon type={index === 0 ? "ticket" : index === 1 ? "mobile" : "plus"} />
            <strong>{item}</strong>
          </li>
        ))}
        <li>
          <IncludedIcon type="clock" />
          {copy.duration} <strong>{product.duration}</strong>
        </li>
        <li>
          <IncludedIcon type="map" />
          {copy.address} <strong>{product.address}</strong>
        </li>
        <li>
          <IncludedIcon type="undo" />
          <strong>{copy.cancellation}</strong> {copy.cancellationText}
        </li>
      </ul>
    </div>
  );
}

export function ProductBookingFlow({
  locale = "en",
  products: localizedProducts,
}: {
  locale?: Locale;
  products: Product[];
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const t = ui[locale];

  return (
    <>
      <HeroProductSelector
        activeProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
        products={localizedProducts}
        copy={t.hero}
      />
      <section id="booking-area" className="section product-booking-section">
        <div className="container">
          <div className="product-booking-grid">
            <div className="booking-disclosure-box product-booking-disclosure">
              <p><strong>{t.flow.disclosureTitle}</strong> {t.nonAffiliation}</p>
              <p>{t.flow.bookingDisclosure}</p>
            </div>
            <ProductCopy product={selectedProduct} copy={t.flow} priceCopy={t.booking} />
            <div className="product-booking-widget">
              <BookingWidget product={selectedProduct} products={localizedProducts} copy={t.booking} locale={locale} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
