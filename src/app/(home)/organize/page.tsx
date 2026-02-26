import type { Metadata } from 'next';
import OrganizePage from './organize-page';

// Força renderização dinâmica devido ao uso de autenticação
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Organizar",
  description: "Ferramentas avançadas de organização e produtividade",
};

export default function Page() {
  return (
    <OrganizePage />
  )
}
