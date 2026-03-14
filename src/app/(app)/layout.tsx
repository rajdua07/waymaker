import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "./auth-provider";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthProvider>
      <div className="flex h-screen bg-surface-0 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-purple-accent/[0.02] rounded-full blur-[100px] pointer-events-none" />

        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <Header />
          <main className="flex-1 overflow-auto scrollbar-thin">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
