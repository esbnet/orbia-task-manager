const SAO_PAULO_TIMEZONE = "America/Sao_Paulo";

export function getTodayDateInSaoPaulo(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: SAO_PAULO_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

export function diffDaysBetweenIsoDates(fromIsoDate: string, toIsoDate: string): number {
    const [fromYear, fromMonth, fromDay] = fromIsoDate.split("-").map(Number);
    const [toYear, toMonth, toDay] = toIsoDate.split("-").map(Number);

    const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
    const toUtc = Date.UTC(toYear, toMonth - 1, toDay);

    return Math.floor((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}
