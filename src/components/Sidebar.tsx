
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  ClipboardList,
  ClipboardCheck,
  CalendarDays,
  Settings,
  Wallet,
  ChartNoAxesCombined,
  Package,
  UserPlus,
} from "lucide-react";

const secciones = [
  {
    titulo: "GENERAL",
    items: [
      { name: "Resumen", icon: LayoutDashboard, href: "/" },
      { name: "Alumnos", icon: Users, href: "/alumnos" },
      { name: "Grupos", icon: UsersRound, href: "/grupos" },
      { name: "Horario semanal", icon: CalendarDays, href: "/horario" },
      { name: "Inscripciones", icon: ClipboardList, href: "/inscripciones" },
    ],
  },
  {
    titulo: "OPERACIÓN",
    items: [
      { name: "Asistencia", icon: ClipboardCheck, href: "/asistencia" },
      { name: "Pagos", icon: Wallet, href: "/pagos" },
      {
        name: "Desarrollo deportivo",
        icon: ChartNoAxesCombined,
        href: "/desarrollo",
      },
      { name: "Inventario", icon: Package, href: "/inventario" },
    ],
  },
  {
    titulo: "CRECIMIENTO",
    items: [
      { name: "Prospectos", icon: UserPlus, href: "/prospectos" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const estaActivo = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-[#e1dace] bg-white lg:flex">

      {/* LOGO */}
      <div className="shrink-0 px-5 pb-5 pt-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-full border-2 border-[#5f6d14] bg-[#cbd90a]" />

          <div>
            <h1 className="text-xl font-black tracking-tight text-[#141113]">
              TENNISTRACK
            </h1>
            <p className="text-xs tracking-[0.2em] text-[#8c847d]">
              ACADEMIA
            </p>
          </div>
        </Link>
      </div>

      {/* MENÚ DESPLAZABLE */}
      <nav
        aria-label="Navegación principal"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-5"
      >
        {secciones.map((seccion) => (
          <div key={seccion.titulo}>
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#aaa39c]">
              {seccion.titulo}
            </p>

            <div className="flex flex-col gap-1">
              {seccion.items.map((item) => {
                const Icon = item.icon;
                const activo = estaActivo(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={activo ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      activo
                        ? "bg-[#eef2cf] font-bold text-[#52620a]"
                        : "text-[#5f5b55] hover:bg-[#f6f4ee] hover:text-[#141113]"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* PARTE INFERIOR */}
      <div className="shrink-0 border-t border-[#e1dace] px-5 py-4">
        <p className="text-xs uppercase tracking-[0.15em] text-[#8c847d]">
          Conexión CRM
        </p>

        <p className="mt-1 font-semibold text-[#7d9309]">
          Activa · cada 15 s
        </p>

        <button
          type="button"
          disabled
          title="Próximamente"
          className="mt-4 flex cursor-not-allowed items-center gap-3 text-sm text-[#8c847d]"
        >
          <Settings size={18} />
          Ajustes
        </button>
      </div>
    </aside>
  );
}
