import { ReplayFrame, Replay } from '@/models/Replay';
import { fetchJSON } from '@gruppe-adler/maps-frontend-utils/lib/utils';
import { API_BASE_URL } from '@/ApiUtils';

export default class DataWorker extends EventTarget {
    private replay: Replay;
    private cachedSections: number[] = [];
    private cache: Map<number, ReplayFrame>;
    private currentFetch: {
        sectionId: number;
        promise: Promise<void>;
        abortController: AbortController;
    }|null = null;

    constructor (replay: Replay) {
        super();

        this.replay = replay;
        this.cache = new Map();
    }

    public async getFrame (id: number): Promise<ReplayFrame|null> {
        const sectionId = id;
        
        if (!this.cache.has(id)) {
            this.dispatchEvent(new Event('loading'));

            try {
                await this.fetchSection(sectionId);
            } catch (err) {
                if (err.name === 'AbortError') {
                    return null;
                }
                console.error(err);
            }

            this.dispatchEvent(new Event('loaded'));
        } else {
            this.prefetchNextSection(sectionId);
        }

        return this.cache.get(id) || null;
    }

    private async fetchSection (sectionId: number): Promise<void> {
        // section is out of bounds
        if (this.replay.frameCount <= sectionId) return;

        // section was already cached
        if (this.cachedSections.includes(sectionId)) return;

        if (this.currentFetch !== null) {
            if (sectionId === this.currentFetch.sectionId) {
                return this.currentFetch.promise; // requested section is already beeing fetched
            } else {
                this.currentFetch.abortController.abort(); // other section is requested -> abort that
            }
        }

        const abortController = new AbortController();
        const promise = fetchJSON<ReplayFrame[]>(
            `${API_BASE_URL}/${this.replay._id}/data/${sectionId}/10`,
            { signal: abortController.signal }
        ).then(frames => {
            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                this.cache.set(sectionId + i, frame);
            }
            this.cachedSections.push(sectionId);
            this.dispatchEvent(new Event('buffered'));
        }).then(async () => {
            this.prefetchNextSection(sectionId);
        });

        this.currentFetch = { sectionId, promise, abortController };

        return promise;
    }

    private prefetchNextSection (section: number) {
        // prefetch next section
        let nextSession = section + 1;
        while (this.cachedSections.includes(nextSession)) nextSession++;

        this.fetchSection(nextSession).catch((err) => {
            if (err.name === 'AbortError') {
                return;
            }
            console.error(err);
        });
    }

    public getBufferedAreas (): Array<{ start: number; end: number }> {
        return this.cachedSections.map(s => {
            return { start: s, end: (s + 1) };
        });
    }
}
