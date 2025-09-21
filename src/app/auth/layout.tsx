import type { Metadata } from "next";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    template: '%s | Orbia',
    default: 'Orbia', // a default is required when creating a template
  },
  description: "Rotina, foco e progresso em um só lugar",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Orbia",
  },
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex justify-center items-center bg-background min-h-screen">
      {children}
    </div>
  );
}