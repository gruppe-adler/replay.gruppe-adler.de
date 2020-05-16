export function formatDate (d: Date): string {
    return (new Intl.DateTimeFormat(undefined, { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' })).format(d);
}

export function formatSeconds (s: number): string {
    const hours = Math.floor(s / 3600);
    const min = Math.floor((s % 3600) / 60);

    if (hours === 0) {
        return `${min} min`;
    }

    return `${hours}h ${min}min`;
}
