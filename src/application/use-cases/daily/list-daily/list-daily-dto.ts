import type { Daily } from "@/types";

export type ListDailyOutput = {
	daily: Daily[];
};
export type ListDailyInput = {
	page: number;
	limit: number;
};
