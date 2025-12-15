export default function DashboardPage() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium">Revenu Total</h3>
                </div>
                <div className="p-6 pt-0">
                    <div className="text-2xl font-bold">0 €</div>
                    <p className="text-xs text-muted-foreground">+0% par rapport au mois dernier</p>
                </div>
            </div>
        </div>
    );
}
