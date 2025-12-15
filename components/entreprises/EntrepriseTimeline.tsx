'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface HistoriqueQualification {
  annee_calendrier: number
  format_encart: string
  mois_parution: string
  montant_paye: number
  est_paye: boolean
}

export function EntrepriseTimeline({ 
  entrepriseId 
}: { 
  entrepriseId: string 
}) {
  const { data: historique, isLoading } = useQuery({
    queryKey: ['historique', entrepriseId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('qualification_historique')
        .select('*')
        .eq('entreprise_id', entrepriseId)
        .order('annee_calendrier', { ascending: false })
      
      if (error) throw error
      return data as HistoriqueQualification[]
    }
  })

  if (isLoading) {
    return <div className="space-y-3">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
    </div>
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">
        Historique Calendriers
      </h3>
      
      {historique?.map((h) => (
        <div key={h.annee_calendrier} 
             className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="font-medium">
              📅 Calendrier {h.annee_calendrier}
            </p>
            <p className="text-sm text-muted-foreground">
              {h.format_encart} · {h.mois_parution}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{h.montant_paye}€</p>
            <Badge variant={h.est_paye ? "default" : "secondary"}>
              {h.est_paye ? "✅ Payé" : "⏳ En attente"}
            </Badge>
          </div>
        </div>
      ))}
      
      {(!historique || historique.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun historique
        </p>
      )}
    </div>
  )
}
