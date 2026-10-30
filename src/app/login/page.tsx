import type { Metadata } from "next";
import PantallaAcceso from "./PantallaAcceso";
import "./login.css";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

/* Solo se regresa a rutas internas del panel. */
function destinoSeguro(desde: string | string[] | undefined): string {
  return typeof desde === "string" &&
    desde.startsWith("/") &&
    !desde.startsWith("//") &&
    !desde.startsWith("/\\")
    ? desde
    : "/";
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { desde } = await searchParams;

  return <PantallaAcceso desde={destinoSeguro(desde)} />;
}
