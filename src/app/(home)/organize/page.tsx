import type { Metadata } from 'next';
import OrganizePage from './organize-page';

export const metadata: Metadata = {
  title: "Organizar",
  description: "Ferramentas avançadas de organização e produtividade",
};

export default function Page() {
  return (
    <OrganizePage />
  )
}
