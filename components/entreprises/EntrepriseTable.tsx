"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Phone, Mail, MapPin } from "lucide-react";

interface Entreprise {
    id: string;
    nom: string;
    email: string | null;
    telephone: string | null;
    ville: string | null;
}

interface EntrepriseTableProps {
    data: Entreprise[];
}

export function EntrepriseTable({ data }: EntrepriseTableProps) {
    const router = useRouter();

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((entreprise) => (
                        <TableRow
                            key={entreprise.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/entreprises/${entreprise.id}`)}
                        >
                            <TableCell className="font-medium">{entreprise.nom}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                    {entreprise.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-3 w-3" />
                                            {entreprise.email}
                                        </div>
                                    )}
                                    {entreprise.telephone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-3 w-3" />
                                            {entreprise.telephone}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                {entreprise.ville && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {entreprise.ville}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">
                                    Voir
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
