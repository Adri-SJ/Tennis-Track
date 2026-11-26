import {
  LayoutDashboard,
  Users,
  UsersRound,
  ClipboardCheck,
  Wallet,
  ChartNoAxesCombined,
  Package,
  UserPlus,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { puedeVer, type Rol } from "@/lib/permisos";

export type ItemMenu = {
  name: string;
  /* Nombre para el entrenador, si cambia (solo ve sus grupos). */
  nameEntrenador?: string;
  icon: LucideIcon;
  href: string;
  /* Rutas que viven dentro de esta sección (sus pestañas). */
  incluye?: string[];
};

/* Menú compartido por la barra lateral y la navegación móvil. */
export const principales: ItemMenu[] = [
  { name: "Inicio", icon: LayoutDashboard, href: "/" },
  { name: "Alumnos", icon: Users, href: "/alumnos", incluye: ["/inscripciones"] },
  {
    name: "Grupos",
    nameEntrenador: "Mis grupos",
    icon: UsersRound,
    href: "/grupos",
    incluye: ["/horario"],
  },
  { name: "Asistencia", icon: ClipboardCheck, href: "/asistencia" },
  { name: "Desarrollo deportivo", icon: ChartNoAxesCombined, href: "/desarrollo" },
  { name: "Pagos", icon: Wallet, href: "/pagos" },
];

export const secundarios: ItemMenu[] = [
  { name: "Inventario", icon: Package, href: "/inventario" },
  { name: "Prospectos", icon: UserPlus, href: "/prospectos" },
];

export const ajustes: ItemMenu = { name: "Ajustes", icon: Settings, href: "/cuentas" };

/* Solo lo que el rol puede ver. */
export function paraRol(rol: Rol, items: ItemMenu[]): ItemMenu[] {
  return items.filter((item) => puedeVer(rol, item.href));
}

export function nombreDe(item: ItemMenu, rol: Rol): string {
  return rol === "entrenador" && item.nameEntrenador
    ? item.nameEntrenador
    : item.name;
}

export function rutaActiva(pathname: string, href: string): boolean {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

/* La sección está activa en su ruta y en las de sus pestañas. */
export function itemActivo(pathname: string, item: ItemMenu): boolean {
  return [item.href, ...(item.incluye ?? [])].some((href) =>
    rutaActiva(pathname, href)
  );
}
