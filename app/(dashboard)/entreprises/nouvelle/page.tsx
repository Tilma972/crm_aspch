import { EntrepriseForm } from "@/components/entreprises/EntrepriseForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewEntreprisePage() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Nouvelle Entreprise</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Informations</CardTitle>
                </CardHeader>
                <CardContent>
                    <EntrepriseForm />
                </CardContent>
            </Card>
        </div>
    );
}
