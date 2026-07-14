"use client";

import { useSession } from "next-auth/react";

export function useAuthenticatedApi() {
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";

	const assertAuthenticated = () => {
		if (!isAuthenticated) {
			throw new Error("Usuário não autenticado");
		}
	};

	return {
		isAuthenticated,
		isAuthLoading: status === "loading",
		assertAuthenticated,
	};
}
