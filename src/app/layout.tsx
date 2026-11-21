import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RegistrarServiceWorker from "@/components/RegistrarServiceWorker";
import { scriptTema } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TennisTrack",
    template: "%s · TennisTrack",
  },
  description: "Panel de administración de la academia de tenis",
  applicationName: "TennisTrack",
  appleWebApp: {
    capable: true,
    title: "TennisTrack",
    statusBarStyle: "default",
  },
};

/* Color de la barra del navegador y de la app instalada, según el tema. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1c1e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* En el cliente se marca text/plain para que React no avise por el script. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: scriptTema }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
