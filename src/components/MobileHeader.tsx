"use client";

import { Bell, Menu } from "lucide-react";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#e1dace] bg-white px-4 py-3 lg:hidden">
      
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 hover:bg-[#f6f4ee]">
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-[#5f6d14] bg-[#cbd90a]" />

          <div>
            <h1 className="text-sm font-black tracking-tight">
              TENNISTRACK
            </h1>

            <p className="text-[10px] tracking-[0.18em] text-[#8c847d]">
              ACADEMIA
            </p>
          </div>
        </div>
      </div>

      <button className="rounded-lg p-2 hover:bg-[#f6f4ee]">
        <Bell size={20} />
      </button>
    </header>
  );
}