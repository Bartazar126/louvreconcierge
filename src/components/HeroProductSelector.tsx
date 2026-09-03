"use client";

import { useState } from "react";
import { Product, getProductUnitPrice } from "@/data/site";

const defaultHeroImage = "/hero-bg.webp";

type HeroProductSelectorProps = {
  activeProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  products: Product[];
  copy: {
    title: string;
    lede: string;
    badges: string[];
    select: string;
    from: string;
  };
};

export function HeroProductSelector({
  activeProduct,
  onSelectProduct,
  products,
  copy,
}: HeroProductSelectorProps) {
  const [heroImage, setHeroImage] = useState(defaultHeroImage);
  const [isFading, setIsFading] = useState(false);

  const selectProduct = (product: Product) => {
    const nextImage = product.heroImage || defaultHeroImage;

    onSelectProduct(product);
    setIsFading(true);

    window.setTimeout(() => {
      setHeroImage(nextImage);
    }, 300);

    window.setTimeout(() => {
      setIsFading(false);
    }, 600);

    window.setTimeout(() => {
      document.getElementById("booking-area")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 320);
  };

  return (
    <section id="tickets" className="hero">
      <div
        className={isFading ? "hero-bg-img is-fading" : "hero-bg-img"}
        style={{ backgroundImage: `url("${heroImage}")` }}
        aria-hidden="true"
      />
      <div className="hero-overlay" />
      <div className="container hero-stack">
        <div className="hero-copy">
          <h1>{copy.title}</h1>
          <p className="hero-lede">{copy.lede}</p>
          <div className="hero-badges">
            {copy.badges.map((badge) => <span key={badge}>{badge}</span>)}
          </div>
          <h2>{copy.select}</h2>
          <a className="hero-scroll-arrow" href="#booking-area" aria-label="Scroll to booking" />
        </div>
        <div className="ticket-card-row">
          {products.map((product) => {
            const isSelected = product.id === activeProduct?.id;

            return (
              <button
                key={product.id}
                type="button"
                className={isSelected ? "ticket-card selected" : "ticket-card"}
                onClick={() => selectProduct(product)}
                aria-pressed={isSelected}
              >
                <span className="ticket-dot" aria-hidden="true" />
                <h3>{product.name}</h3>
                <p>{copy.from} {getProductUnitPrice(product).toFixed(2)}€</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
