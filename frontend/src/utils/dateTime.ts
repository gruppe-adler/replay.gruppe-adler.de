const dateFormat = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    year: 'numeric',
    month: 'numeric'
});

const timeFormat = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric'
});

export function formatDate (d: Date): string {
    return dateFormat.format(d);
}

export function formatTime (d: Date): string {
    return timeFormat.format(d);
}

export function formatSeconds (s: number): string {
    const hours = Math.floor(s / 3600);
    const min = Math.floor((s % 3600) / 60);

    if (hours === 0) {
        return `${min} min`;
    }

    return `${hours}h ${min}min`;
}
