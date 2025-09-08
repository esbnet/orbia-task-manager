"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { GeneralSettings } from "@/components/settings/general-settings";
import { TagsSettings } from "@/components/settings/tags-settings";
import { TagsProvider } from "@/contexts/tags-context";

export default function SettingsPage() {
	return (
		<TagsProvider>
			<div className="mx-auto p-6 container">
				<h1 className="mb-6 font-bold text-3xl">Configurações</h1>

				<Tabs defaultValue="tags" className="w-full">
					<TabsList className="grid grid-cols-4 w-full">
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
						<GeneralSettings />
					</TabsContent>

					<TabsContent value="notifications" className="mt-6">
						<div className="text-muted-foreground text-center">
							Configurações de notificações em desenvolvimento...
						</div>
					</TabsContent>

					<TabsContent value="backup" className="mt-6">
						<div className="text-muted-foreground text-center">
							Configurações de backup em desenvolvimento...
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</TagsProvider>
	);
}
