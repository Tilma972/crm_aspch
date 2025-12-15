import { Sidebar } from "@/components/layout/sidebar";
import { UserNav } from "@/components/layout/user-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
                    <div className="flex-1">
                        <h1 className="font-semibold text-lg">CRM Sapeurs-Pompiers</h1>
                    </div>
                    <UserNav />
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
