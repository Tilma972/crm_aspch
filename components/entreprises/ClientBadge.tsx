import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ClientBadgeProps {
  segment: string | null | undefined
}

export function ClientBadge({ segment }: ClientBadgeProps) {
  if (!segment) return null

  const config: Record<string, { label: string; icon: string; className: string }> = {
    fidele: { 
      label: "Client Fidèle", 
      icon: "🏆", 
      className: "bg-green-500/15 text-green-700 border-green-200 hover:bg-green-500/25 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" 
    },
    nouveau: { 
      label: "Nouveau Client", 
      icon: "✨", 
      className: "bg-blue-500/15 text-blue-700 border-blue-200 hover:bg-blue-500/25 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" 
    },
    churn: { 
      label: "À Relancer", 
      icon: "⚠️", 
      className: "bg-orange-500/15 text-orange-700 border-orange-200 hover:bg-orange-500/25 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" 
    },
    prospect: { 
      label: "Prospect", 
      icon: "👤", 
      className: "bg-slate-500/15 text-slate-700 border-slate-200 hover:bg-slate-500/25 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" 
    }
  }

  const item = config[segment] || config.prospect

  return (
    <Badge variant="outline" className={cn("gap-1", item.className)}>
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </Badge>
  )
}
