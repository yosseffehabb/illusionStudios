"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import AdminlogoutButton from "./AdminLogoutButton";

function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div>
      <nav className="fixed z-50 w-full border-b border-neutral-200 bg-neutral-50 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="shrink-0">
              <span className="text-3xl font-bold text-primarygreen-500">
                Illusion
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="ml-10 hidden flex-1 items-center justify-between md:flex">
              <div className="flex items-baseline space-x-4">
                <a
                  href="/admin"
                  className="px-3 py-2 text-neutral-400 hover:text-primarygreen-500 transition-colors"
                >
                  Orders
                </a>
                <a
                  href="/admin/products"
                  className="px-3 py-2 text-neutral-400 hover:text-primarygreen-500 transition-colors"
                >
                  Products
                </a>
                <a
                  href="/admin/categories"
                  className="px-3 py-2 text-neutral-400 hover:text-primarygreen-500 transition-colors"
                >
                  Categories
                </a>
              </div>

              {/* Desktop Logout Button */}
              <AdminlogoutButton />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-primarygreen-500 transition-colors md:hidden"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-primarygreen-500" />
              ) : (
                <Menu className="h-6 w-6 text-primarygreen-500" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed bottom-0 left-0 right-0 top-16 z-40 bg-neutral-50 md:hidden"
          >
            <div className="flex flex-col space-y-4 p-4">
              <a
                href="/orders"
                className="px-3 py-2 text-neutral-400 hover:text-primarygreen-500 transition-colors"
                onClick={toggleMobileMenu}
              >
                Orders
              </a>
              <a
                href="/products"
                className="px-3 py-2 text-neutral-400 hover:text-primarygreen-500 transition-colors"
                onClick={toggleMobileMenu}
              >
                Products
              </a>
              <a
                href="/categories"
                className="px-3 py-2 text-neutral-400 hover:text-primarygreen-500 transition-colors"
                onClick={toggleMobileMenu}
              >
                catefories
              </a>

              {/* Mobile Logout Button */}
              <div className="pt-4 border-t border-neutral-200">
                <AdminlogoutButton />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminHeader;
