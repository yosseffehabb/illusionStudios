"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import { GlitchText } from "./hero/GlitchText";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { totalItems } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      <nav className="fixed z-50 w-full border-b border-neutral-200 bg-neutral-50 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Mobile Menu Button */}
            <button onClick={toggleMobileMenu} className="rounded-md p-2 ">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-primarygreen-500 hover:bg-primarygreen-300  transition-all duration-300" />
              ) : (
                <Menu className="h-6 w-6 text-primarygreen-500 hover:text-primarygreen-900 transition-all duration-300" />
              )}
            </button>

            {/* Logo */}
            <div className="shrink-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl tracking-[0.3em] font-bold text-primarygreen-500">
                <GlitchText text="ILLUSION" />
              </h1>
            </div>

            <Link
              href="/shop/cart"
              className="flex items-center gap-0 font-mono text-sm tracking-widest text-primarygreen-500 font-semibold hover:text-primarygreen-900 transition-all duration-300"
            >
              <span className="">[</span>
              <span className="min-w-6 text-center ">{totalItems}</span>
              <span className="">]</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-60 bg-background/60 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-out Menu */}
      <nav
        className={`fixed top-0 left-0 bottom-0 z-70 w-full sm:w-72 bg-header border-r border-header-border flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <span className="font-logo text-lg tracking-[0.3em] font-bold text-primarygreen-500">
            ILLUSION
          </span>
          <button
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex flex-col mt-8 px-6 gap-6 ">
          {[
            "HOME",
            "SHOP",
            `CART [ ${totalItems} ]`,
            "SALE",
            "Contact",
            "SIZE CHARTS",
          ].map((item) => (
            <a
              key={item}
              href="shop/cart"
              className="text-muted-foreground hover:text-primarygreen-300 text-sm tracking-[0.25em] uppercase transition-colors font-mono"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default AdminHeader;
