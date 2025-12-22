'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useGenerateFacture, FactureResult } from '@/hooks/useGenerateFacture';
import { AlertCircle, CheckCircle, Loader2, ExternalLink, Mail, Calendar, Hash } from 'lucide-react';

interface FactureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualificationId: string;
  onSuccess?: (facture: FactureResult) => void;
}

type ModalState = 'idle' | 'loading' | 'success' | 'error';

export function FactureModal({
  open,
  onOpenChange,
  qualificationId,
  onSuccess,
}: FactureModalProps) {
  const [state, setState] = useState<ModalState>('idle');
  const [selectedStatus, setSelectedStatus] = useState<'emise' | 'acquittee'>('emise');
  const [sendEmail, setSendEmail] = useState(false);
  const [datePaiement, setDatePaiement] = useState(new Date().toISOString().split('T')[0]);
  const [referencePaiement, setReferencePaiement] = useState('');
  const [facture, setFacture] = useState<FactureResult | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { isLoading, error, trigger } = useGenerateFacture({
    onSuccess: (result) => {
      setFacture(result);
      setState('success');
      onSuccess?.(result);
    },
    onError: () => {
      setState('error');
    },
    pollInterval: 2000,
    pollTimeout: 60000,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setState('idle');
      setSelectedStatus('emise');
      setSendEmail(false);
      setDatePaiement(new Date().toISOString().split('T')[0]);
      setReferencePaiement('');
      setFacture(null);
    }
  }, [open]);

  // Update loading state
  useEffect(() => {
    if (isLoading && state !== 'loading') {
      setState('loading');
    }
  }, [isLoading, state]);

  const handleGenerate = async () => {
    try {
      await trigger(qualificationId, selectedStatus, {
        sendEmail,
        sendTelegram: false,
        is_paid: selectedStatus === 'acquittee',
        date_paiement: selectedStatus === 'acquittee' ? datePaiement : undefined,
        reference_paiement: selectedStatus === 'acquittee' ? referencePaiement : undefined,
      });
    } catch (e) {
      console.error('Facture generation failed:', e);
    }
  };

  const handleSendEmail = async () => {
    if (!facture) return;
    
    setIsSendingEmail(true);
    try {
      const response = await fetch(`/api/qualifications/${qualificationId}/facture/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factureNumero: facture.factureNumero,
          factureUrl: facture.factureUrl,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      // Optionnel: Afficher un toast de succès
      setState('success'); // On reste en success mais on pourrait changer le message
    } catch (e) {
      console.error('Failed to send email:', e);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleRetry = () => {
    setState('idle');
  };

  const handleClose = () => {
    if (state !== 'loading') {
      onOpenChange(false);
    }
  };

  const handleSuccessClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {/* IDLE STATE */}
        {state === 'idle' && (
          <>
            <DialogHeader>
              <DialogTitle>Générer la Facture</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <p className="text-sm text-text-secondary">
                Sélectionnez le statut de paiement actuel pour initialiser le workflow de génération.
              </p>

              <RadioGroup value={selectedStatus} onValueChange={(v: string) => setSelectedStatus(v as 'emise' | 'acquittee')}>
                <div className="space-y-3">
                  {/* Émise */}
                  <div
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedStatus === 'emise'
                        ? 'border-accent-blue bg-accent-blue/5'
                        : 'border-border-subtle hover:border-border-subtle/80'
                    }`}
                    onClick={() => setSelectedStatus('emise')}
                  >
                    <RadioGroupItem value="emise" id="emise" />
                    <Label htmlFor="emise" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-status-warning/20 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-status-warning" />
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">Émise</div>
                          <div className="text-xs text-text-secondary">EN ATTENTE DE PAIEMENT</div>
                        </div>
                      </div>
                    </Label>
                  </div>

                  {/* Acquittée */}
                  <div
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedStatus === 'acquittee'
                        ? 'border-status-success bg-status-success/5'
                        : 'border-border-subtle hover:border-border-subtle/80'
                    }`}
                    onClick={() => setSelectedStatus('acquittee')}
                  >
                    <RadioGroupItem value="acquittee" id="acquittee" />
                    <Label htmlFor="acquittee" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-status-success/20 flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-status-success" />
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">Acquittée</div>
                          <div className="text-xs text-text-secondary">PAIEMENT REÇU</div>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {selectedStatus === 'acquittee' && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-status-success/20 bg-status-success/5 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label htmlFor="datePaiement" className="text-xs font-semibold flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Date de paiement
                    </Label>
                    <Input
                      id="datePaiement"
                      type="date"
                      value={datePaiement}
                      onChange={(e) => setDatePaiement(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referencePaiement" className="text-xs font-semibold flex items-center gap-2">
                      <Hash className="w-3 h-3" />
                      Référence
                    </Label>
                    <Input
                      id="referencePaiement"
                      placeholder="Ex: CHQ 123456"
                      value={referencePaiement}
                      onChange={(e) => setReferencePaiement(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="sendEmail"
                  checked={sendEmail}
                  onCheckedChange={(checked) => setSendEmail(checked === true)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="sendEmail"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Envoyer directement par email au client
                  </Label>
                  <p className="text-xs text-text-secondary">
                    Si décoché, vous pourrez visualiser la facture avant de l&apos;envoyer manuellement.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleGenerate} className="bg-accent-blue hover:bg-accent-blue/90">
                Générer la facture
              </Button>
            </DialogFooter>
          </>
        )}

        {/* LOADING STATE */}
        {state === 'loading' && (
          <>
            <DialogHeader>
              <DialogTitle>Génération en cours...</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
              <p className="text-center text-text-secondary">
                Veuillez patienter...
                <br />
                <span className="text-xs">Génération du PDF en cours.</span>
              </p>
            </div>
          </>
        )}

        {/* SUCCESS STATE */}
        {state === 'success' && facture && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-status-success">
                <CheckCircle className="w-5 h-5" />
                Facture générée !
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <div className="bg-status-success/10 border border-status-success/30 rounded-lg p-4 space-y-2">
                <div className="text-sm text-text-secondary">Numéro de facture</div>
                <div className="text-2xl font-bold text-text-primary font-mono">{facture.factureNumero}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-text-secondary">Statut</div>
                  <div className="font-semibold text-text-primary capitalize">
                    {facture.status === 'emise' ? 'Émise' : 'Acquittée'}
                  </div>
                </div>
                <div>
                  <div className="text-text-secondary">Généré</div>
                  <div className="font-semibold text-text-primary">
                    {new Date(facture.generatedAt).toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-3 text-sm text-text-secondary">
                ✅ PDF disponible dans Supabase Storage
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3">
              {facture.factureUrl && (
                <Button
                  onClick={() => window.open(facture.factureUrl, '_blank')}
                  variant="outline"
                  className="w-full border-accent-blue text-accent-blue hover:bg-accent-blue/5"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visualiser le PDF
                </Button>
              )}
              <Button 
                onClick={handleSendEmail} 
                className="w-full bg-status-success hover:bg-status-success/90"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Envoyer au client
              </Button>
              <Button onClick={handleSuccessClose} variant="ghost" className="w-full">
                Fermer
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ERROR STATE */}
        {state === 'error' && error && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-status-error">
                <AlertCircle className="w-5 h-5" />
                Erreur lors de la génération
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <div className="bg-status-error/10 border border-status-error/30 rounded-lg p-4 space-y-3">
                <div className="text-sm font-mono text-status-error">{error.code}</div>
                <p className="text-sm text-text-secondary">{error.message}</p>
              </div>
            </div>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={handleClose}>
                Retour
              </Button>
              {error.retryable && (
                <Button onClick={handleRetry} className="bg-accent-blue hover:bg-accent-blue/90">
                  Réessayer
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
