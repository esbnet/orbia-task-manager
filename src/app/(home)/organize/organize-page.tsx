import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FocusMode } from "@/components/organization/focus-mode";
import { TaskOrganizer } from "@/components/organization/task-organizer";
import { TimeEstimator } from "@/components/organization/time-estimator";

export default function OrganizePage() {
  return (
    <div className="space-y-6 mx-auto p-6 container">
      <div>
        <h1 className="font-bold text-3xl">Ferramentas de Organização</h1>
        <p className="text-muted-foreground">
          Organize suas tarefas com ferramentas avançadas de produtividade
        </p>
      </div>

      <Tabs defaultValue="organizer" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
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