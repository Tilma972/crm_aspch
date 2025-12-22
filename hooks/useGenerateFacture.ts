import { useState, useCallback } from 'react';

interface UseGenerateFactureOptions {
  onSuccess?: (result: FactureResult) => void;
  onError?: (error: FactureError) => void;
  pollInterval?: number;
  pollTimeout?: number;
}

interface UseGenerateFactureReturn {
  isLoading: boolean;
  error: FactureError | null;
  success: boolean;
  factureNumero: string | null;
  trigger: (
    qualificationId: string,
    status: 'emise' | 'acquittee',
    options?: { 
      sendEmail?: boolean; 
      sendTelegram?: boolean; 
      is_paid?: boolean;
      date_paiement?: string;
      reference_paiement?: string;
    }
  ) => Promise<FactureResult>;
}

export interface FactureResult {
  factureNumero: string;
  factureUrl?: string;
  generatedAt: string;
  status: 'emise' | 'acquittee';
}

export interface FactureError {
  code: string;
  message: string;
  statusCode?: number;
  retryable: boolean;
}

class FactureErrorClass extends Error implements FactureError {
  code: string;
  message: string;
  statusCode?: number;
  retryable: boolean;

  constructor(code: string, message: string, statusCode?: number, retryable = true) {
    super(message);
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.retryable = retryable;
    this.name = 'FactureError';
  }
}

async function pollUntilReady(
  qualificationId: string,
  interval: number,
  timeout: number
): Promise<FactureResult> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`/api/qualifications/${qualificationId}/facture/status`);

      if (!response.ok) {
        throw new FactureErrorClass(
          'STATUS_CHECK_FAILED',
          'Impossible de vérifier le statut',
          response.status,
          true
        );
      }

      const {
        facture_status,
        facture_numero,
        facture_url,
        facture_generated_at,
        facture_error,
      } = await response.json();

      if (facture_status === 'ready') {
        return {
          factureNumero: facture_numero,
          factureUrl: facture_url,
          generatedAt: facture_generated_at,
          status: 'emise',
        };
      }

      if (facture_status === 'error') {
        throw new FactureErrorClass(
          'GENERATION_FAILED',
          facture_error || 'Erreur de génération',
          500,
          true
        );
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (err) {
      if (err instanceof FactureErrorClass) {
        throw err;
      }
      // Retry on network errors
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new FactureErrorClass('POLL_TIMEOUT', 'La génération a pris trop longtemps', 504, true);
}

export function useGenerateFacture(options: UseGenerateFactureOptions = {}): UseGenerateFactureReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FactureError | null>(null);
  const [success, setSuccess] = useState(false);
  const [factureNumero, setFactureNumero] = useState<string | null>(null);

  const trigger = useCallback(
    async (
      qualificationId: string,
      status: 'emise' | 'acquittee',
      opts?: { 
        sendEmail?: boolean; 
        sendTelegram?: boolean; 
        is_paid?: boolean;
        date_paiement?: string;
        reference_paiement?: string;
      }
    ): Promise<FactureResult> => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      setFactureNumero(null);

      try {
        // 1. POST vers endpoint
        const response = await fetch(`/api/qualifications/${qualificationId}/facture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            factureStatus: status,
            sendEmail: opts?.sendEmail ?? false,
            sendTelegram: opts?.sendTelegram ?? false,
            is_paid: opts?.is_paid ?? false,
            date_paiement: opts?.date_paiement,
            reference_paiement: opts?.reference_paiement,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new FactureErrorClass(
            errorData.code || 'HTTP_ERROR',
            errorData.message || 'Erreur serveur',
            response.status,
            response.status >= 500 || response.status === 429
          );
        }

        const data = await response.json();

        // 2. Commencer le polling
        const result = await pollUntilReady(
          qualificationId,
          options.pollInterval ?? 2000,
          options.pollTimeout ?? 60000
        );

        setFactureNumero(result.factureNumero);
        setSuccess(true);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const facError =
          err instanceof FactureErrorClass
            ? err
            : new FactureErrorClass('UNKNOWN_ERROR', 'Une erreur inattendue est survenue', 500, true);

        setError(facError);
        options.onError?.(facError);
        throw facError;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return { isLoading, error, success, factureNumero, trigger };
}
