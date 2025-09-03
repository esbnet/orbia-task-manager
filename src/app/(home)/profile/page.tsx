import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { auth } from "@/auth";
import { ChartAreaInteractive } from "@/components/dashboard/area-chart";
import { ChartBarInteractive } from "@/components/dashboard/bar-chart-interactive";
import { ChartPieLegend } from "@/components/dashboard/pie-chart-legend";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return <p>Você precisa estar logado para ver esta página.</p>;
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user.image ?? ""} alt={user.name ?? "User avatar"} />
          <AvatarFallback>
            {user.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-bold text-3xl">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Separator />

      <main className="space-y-8">
        <section>
          <h2 className="mb-4 font-semibold text-2xl">Estatísticas</h2>
          <div className="flex flex-col gap-4">
            <div className="grid-cols-1">
              <ChartBarInteractive />
            </div>
            <div className="gap-4 grid md:grid-cols-2 lg:grid-cols-3">
              <ChartPieLegend />
              <ChartAreaInteractive />
              <div className="bg-card p-4 border rounded-lg text-card-foreground">
                <h3 className="font-semibold">Gráfico de Atividades</h3>
                <p className="mt-2 text-muted-foreground text-sm">Em breve...</p>
              </div>
              <div className="bg-card p-4 border rounded-lg text-card-foreground">
                <h3 className="font-semibold">Tabela de Hábitos</h3>
                <p className="mt-2 text-muted-foreground text-sm">Em breve...</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}