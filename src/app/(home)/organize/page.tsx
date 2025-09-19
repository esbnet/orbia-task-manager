import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskOrganizer } from "@/components/organization/task-organizer";
import { FocusMode } from "@/components/organization/focus-mode";
import { TimeEstimator } from "@/components/organization/time-estimator";

export default function OrganizePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ferramentas de Organização</h1>
        <p className="text-muted-foreground">
          Organize suas tarefas com ferramentas avançadas de produtividade
        </p>
      </div>

      <Tabs defaultValue="organizer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="organizer">Organizador</TabsTrigger>
          <TabsTrigger value="focus">Modo Foco</TabsTrigger>
          <TabsTrigger value="estimator">Estimador</TabsTrigger>
        </TabsList>

        <TabsContent value="organizer" className="space-y-6">
          <TaskOrganizer />
        </TabsContent>

        <TabsContent value="focus" className="space-y-6">
          <FocusMode />
        </TabsContent>

        <TabsContent value="estimator" className="space-y-6">
          <TimeEstimator />
        </TabsContent>
      </Tabs>
    </div>
  );
}