"use client";

import Link from "next/link";

/* En móvil la navegación vive en la barra inferior (MobileNav). */
export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center border-b border-borde bg-superficie px-4 py-3 lg:hidden">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-borde-logo bg-[#cbd90a]" />

        <div>
          <h1 className="text-sm font-black tracking-tight">
            TENNISTRACK
          </h1>

          <p className="text-[10px] tracking-[0.18em] text-texto-suave">
            ACADEMIA
          </p>
        </div>
      </Link>
    </header>
  );
}
