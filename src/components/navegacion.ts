import {
  LayoutDashboard,
  Users,
  UsersRound,
  ClipboardList,
  ClipboardCheck,
  CalendarDays,
  Wallet,
  ChartNoAxesCombined,
  Package,
  UserPlus,
  UserCog,
} from "lucide-react";
import { puedeVer, type Rol } from "@/lib/permisos";

/* Secciones del menú, compartidas por la barra lateral y el menú móvil. */
export const secciones = [
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
  {
    titulo: "ADMINISTRACIÓN",
    items: [{ name: "Cuentas", icon: UserCog, href: "/cuentas" }],
  },
];

/* Solo los módulos que el rol puede ver; las secciones vacías se omiten. */
export function seccionesPara(rol: Rol) {
  return secciones
    .map((seccion) => ({
      ...seccion,
      items: seccion.items.filter((item) => puedeVer(rol, item.href)),
    }))
    .filter((seccion) => seccion.items.length > 0);
}

export function rutaActiva(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}
