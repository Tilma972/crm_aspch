"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, MapPin, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QualificationWithEntreprise = {
  id: string;
  statut: string | null;
  format_encart: string | null;
  created_at: string;
  entreprise: {
    nom: string;
    ville: string | null;
  } | null;
};

interface QualificationListProps {
  initialQualifications: QualificationWithEntreprise[];
}

export function QualificationList({ initialQualifications }: QualificationListProps) {
  const [filter, setFilter] = useState<"TOUT" | "EN_ATTENTE" | "EFFECTUE" | "REFUSE">("TOUT");
  const [search, setSearch] = useState("");

  const filteredQualifications = initialQualifications.filter((q) => {
    const matchesSearch = 
      q.entreprise?.nom.toLowerCase().includes(search.toLowerCase()) ||
      q.format_encart?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "TOUT") return true;
    if (filter === "EN_ATTENTE") return ["Nouveau", "Qualifié", "BC envoyé"].includes(q.statut || "");
    if (filter === "EFFECTUE") return ["Payé", "Terminé"].includes(q.statut || "");
    if (filter === "REFUSE") return ["Annulé"].includes(q.statut || "");
    
    return true;
  });

  // Group by date (Aujourd'hui, Hier, etc.)
  const groupedQualifications = filteredQualifications.reduce((acc, q) => {
    const date = new Date(q.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
    
    if (date.toDateString() === today.toDateString()) key = "AUJOURD'HUI";
    else if (date.toDateString() === yesterday.toDateString()) key = "HIER";

    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {} as Record<string, QualificationWithEntreprise[]>);

  const getStatusColor = (statut: string | null) => {
    if (!statut) return "text-text-secondary bg-surface-card border-border-subtle";
    
    switch (statut) {
      case "Nouveau":
      case "Qualifié":
      case "BC envoyé":
        return "text-status-warning bg-status-warning/10 border-status-warning/20";
      case "Payé":
      case "Terminé":
        return "text-status-success bg-status-success/10 border-status-success/20";
      case "Annulé":
        return "text-status-error bg-status-error/10 border-status-error/20";
      default:
        return "text-text-secondary bg-surface-card border-border-subtle";
    }
  };

  const getStatusLabel = (statut: string | null) => {
     if (!statut) return "INCONNU";
     
     switch (statut) {
      case "Nouveau":
      case "Qualifié":
      case "BC envoyé":
        return "EN ATTENTE";
      case "Payé":
      case "Terminé":
        return "EFFECTUÉ";
      case "Annulé":
        return "REFUSÉ";
      default:
        return statut.toUpperCase();
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* Search & Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            placeholder="Rechercher une qualification..."
            className="pl-10 bg-surface-card border-border-subtle text-text-primary placeholder:text-text-secondary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="bg-surface-card border-border-subtle text-text-secondary">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <FilterPill 
            active={filter === "TOUT"} 
            onClick={() => setFilter("TOUT")} 
            label="Tout" 
        />
        <FilterPill 
            active={filter === "EN_ATTENTE"} 
            onClick={() => setFilter("EN_ATTENTE")} 
            label="En attente" 
            count={initialQualifications.filter(q => ["Nouveau", "Qualifié", "BC envoyé"].includes(q.statut || "")).length}
        />
        <FilterPill 
            active={filter === "EFFECTUE"} 
            onClick={() => setFilter("EFFECTUE")} 
            label="Effectué" 
        />
        <FilterPill 
            active={filter === "REFUSE"} 
            onClick={() => setFilter("REFUSE")} 
            label="Refusé" 
        />
      </div>

      {/* List */}
      <div className="space-y-6">
        {Object.entries(groupedQualifications).map(([date, items]) => (
          <div key={date} className="space-y-3">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{date}</h3>
            <div className="space-y-3">
              {items.map((q) => (
                <Card key={q.id} className="bg-surface-card border-border-subtle hover:bg-white/5 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-text-primary text-base">{q.format_encart || "Qualification sans format"}</h4>
                        <p className="text-sm text-text-secondary">{q.entreprise?.nom}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 border", getStatusColor(q.statut))}>
                        {getStatusLabel(q.statut)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 text-xs text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(q.created_at))}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{q.entreprise?.ville || "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {filteredQualifications.length === 0 && (
            <div className="text-center py-10 text-text-secondary">
                Aucune qualification trouvée
            </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ active, label, count, onClick }: { active: boolean; label: string; count?: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
        active
          ? "bg-accent-blue text-white"
          : "bg-surface-card text-text-secondary border border-border-subtle hover:bg-white/5"
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-full",
            active ? "bg-white/20 text-white" : "bg-background-main text-text-secondary"
        )}>
          {count}
        </span>
      )}
    </button>
  );
}
