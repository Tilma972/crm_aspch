import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background-main text-text-primary flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-card/95 backdrop-blur supports-[backdrop-filter]:bg-surface-card/60 border-b border-border-subtle">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" disabled className="-ml-2 text-text-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-text-primary">Chargement...</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32 md:pb-24">
        <div className="p-4 space-y-6">
          {/* Company Profile Header Skeleton */}
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-xl bg-surface-card border border-border-subtle" />
            <div className="space-y-2 flex-1 pt-1">
              <Skeleton className="h-6 w-3/4 bg-surface-card" />
              <Skeleton className="h-4 w-1/2 bg-surface-card" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-20 bg-surface-card" />
                <Skeleton className="h-5 w-20 bg-surface-card" />
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="w-full space-y-4">
            <div className="grid w-full grid-cols-2 gap-2">
               <Skeleton className="h-10 rounded-md bg-surface-card" />
               <Skeleton className="h-10 rounded-md bg-surface-card" />
            </div>

            <Card className="bg-surface-card border-border-subtle mt-4">
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-1/4 bg-white/5" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-white/5" />
                    <Skeleton className="h-10 w-full bg-white/5" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-white/5" />
                    <Skeleton className="h-10 w-full bg-white/5" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/3 bg-white/5" />
                    <Skeleton className="h-10 w-full bg-white/5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
