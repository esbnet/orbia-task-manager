"use client";

import { TagsSettings } from "@/components/settings/tags-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagsProvider } from "@/contexts/tags-context";

export default function SettingsPage() {
	return (
		<TagsProvider>
			<div className="container mx-auto p-6">
				<h1 className="text-3xl font-bold mb-6">Configurações</h1>

				<Tabs defaultValue="tags" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="tags">Tags</TabsTrigger>
						<TabsTrigger value="general">Geral</TabsTrigger>
						<TabsTrigger value="notifications">
							Notificações
						</TabsTrigger>
						<TabsTrigger value="backup">Backup</TabsTrigger>
					</TabsList>

					<TabsContent value="tags" className="mt-6">
						<TagsSettings />
					</TabsContent>

				<TabsContent value="general" className="mt-6">
					<div className="text-center text-muted-foreground">
						Configurações gerais em desenvolvimento...
					</div>
				</TabsContent>

				<TabsContent value="notifications" className="mt-6">
					<div className="text-center text-muted-foreground">
						Configurações de notificações em desenvolvimento...
					</div>
				</TabsContent>

				<TabsContent value="backup" className="mt-6">
					<div className="text-center text-muted-foreground">
						Configurações de backup em desenvolvimento...
					</div>
				</TabsContent>
				</Tabs>
			</div>
		</TagsProvider>
	);
}
