import { CircleAlert, CircleDashed } from 'lucide-react';

import type {
  ConnectRequirement,
  ConnectRequirementKind,
} from '../_data-access/get-connect-status';

const LABELS: Record<ConnectRequirementKind, string> = {
  name: 'Nome completo',
  address: 'Endereço residencial',
  date_of_birth: 'Data de nascimento',
  id_number: 'CPF',
  identity_document: 'Documento de identidade e selfie',
  phone: 'Telefone',
  email: 'Email',
  bank_account: 'Conta bancária para receber',
  business: 'Informações do negócio',
  terms: 'Aceite dos termos do Stripe',
  other: 'Outras informações',
};

export function PendingRequirements({ requirements }: { requirements: ConnectRequirement[] }) {
  if (requirements.length === 0) return null;

  const sorted = [...requirements].sort((a, b) => Number(b.rejected) - Number(a.rejected));

  return (
    <ul aria-label="Pendências no Stripe" className="space-y-2 border-t border-white/10 pt-4">
      {sorted.map(({ kind, rejected }) => (
        <li key={kind} className="flex items-start gap-2.5 text-sm">
          {rejected ? (
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-red-500" />
          ) : (
            <CircleDashed className="mt-0.5 size-4 shrink-0 text-white/40" />
          )}
          <div>
            <span className="font-medium">{LABELS[kind]}</span>
            <p className="text-white/50">
              {rejected
                ? 'O Stripe não conseguiu verificar. Confira e envie novamente.'
                : 'Ainda não foi enviado.'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
