import { ResponseError } from '@gruppe-adler/maps-frontend-utils';
import { Replay } from '@/models/Replay';

export const WMTS_BASE_URL = 'https://maps.gruppe-adler.de';
export const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'https://replay.gruppe-adler.de/api';

type ReplayResponse = Omit<Replay, 'date'> & { date: string };

const fetchJSON = async (input: RequestInfo, init: RequestInit = {}) => {
    const response = await fetch(input, init);

    if (!response.ok) throw new ResponseError(response);

    return await response.json();
};

export async function fetchReplays (): Promise<Replay[]> {
    const replays = await fetchJSON(`${API_BASE_URL}/`) as ReplayResponse[];

    return replays.map(r => ({ ...r, date: new Date(r.date) }));
}

export async function fetchReplay (id: string): Promise<Replay> {
    const replay = await fetchJSON(`${API_BASE_URL}/${id}`) as ReplayResponse;

    if (replay.worldName === 'stratis') replay.worldName = 'Stratis';

    return {
        ...replay,
        date: new Date(replay.date)
    };
}
