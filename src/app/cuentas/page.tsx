import type { Metadata } from "next";
import AppLayout from "@/components/AppLayout";
import CuentasClient from "./CuentasClient";

export const metadata: Metadata = {
  title: "Cuentas",
};

export default function CuentasPage() {
  return (
    <AppLayout>
      <CuentasClient />
    </AppLayout>
  );
}
