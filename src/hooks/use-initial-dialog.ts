import { useEffect, useState } from "react";

import { InitialDialogManager } from "@/domain/services/initial-dialog-manager";
import { useSession } from "next-auth/react";
import { useUserConfig } from "./use-user-config";

export function useInitialDialog() {
	const { data: session, status } = useSession();
	const { config } = useUserConfig();
	const [shouldShowDialog, setShouldShowDialog] = useState(false);
	const [hasBeenShown, setHasBeenShown] = useState(false);

	useEffect(() => {
		// Verificar se deve mostrar o dialog baseado na configuração
		const dialogEnabled = InitialDialogManager.shouldShowInitialDialog(config);

		if (status === "authenticated" && session?.user && dialogEnabled && !hasBeenShown) {
			// Verificar se já foi mostrado hoje
			const today = new Date().toDateString();
			const lastShown = localStorage.getItem("initialDialogLastShown");
			const wasShownToday = lastShown === today;

			if (!wasShownToday) {
				// Mostrar dialog após um pequeno delay para garantir que a página carregou
				const timer = setTimeout(() => {
					setShouldShowDialog(true);
				}, 1000);

				return () => clearTimeout(timer);
			}
		}
	}, [status, session, config, hasBeenShown]);

	const markDialogAsShown = () => {
		const today = new Date().toDateString();
		localStorage.setItem("initialDialogLastShown", today);
		setShouldShowDialog(false);
		setHasBeenShown(true);
	};

	return {
		shouldShowDialog,
		markDialogAsShown
	};
}