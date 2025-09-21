"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	variant?: "default" | "destructive";
}

export function ConfirmationDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	onConfirm,
	variant = "default",
}: ConfirmationDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{cancelText}
					</Button>
					<Button
						onClick={handleConfirm}
						variant={variant === "destructive" ? "destructive" : "default"}
					>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
