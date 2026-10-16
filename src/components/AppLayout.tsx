import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import MobileHeader from "./MobileHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f4ee]">
      <Sidebar />

      <main className="min-h-screen pb-24 lg:ml-64 lg:pb-0">
        <MobileHeader />

        {children}
      </main>

      <MobileNav />
    </div>
  );
}
