import { ReplayRecord } from '@/models/Replay';
import { armaToLatLng } from '@gruppe-adler/maps-frontend-utils';
import { LngLat as MapboxGLLangLat, Marker as MapboxGLMarker } from 'mapbox-gl';

const resolveIconUrl = (icon: string) => {
    const base = `${process.env.BASE_URL || '/'}icons/`;

    icon = icon.toLowerCase();

    if (icon.match(/^iconman/i)) {
        return `${base}man/${icon}.png`;
    }

    const supportedTypes = [
        'staticmortar',
        'static',
        'tank',
        'helicopter',
        'parachute',
        'car',
        'plane',
        'truck',
        'motorcycle',
        'ship',
        'radiounit',
        'unknown'
    ];

    if (!supportedTypes.includes(icon)) icon = 'unknown';

    return `${base}${icon}.png`;
};

export default class UnitMarker extends MapboxGLMarker {
    constructor (record: ReplayRecord, worldSize: number) {
        const url = resolveIconUrl(record.icon);

        let opacity = 1;

        if (record.group === 'unconscious') {
            record.group = ' (unconscious)';
            opacity = 0.5;
        }

        const style = `
            width: 24px;
            height: 24px;
            mask-image: url(${url});
            -webkit-mask-image: url(${url});
            mask-size: contain;
            -webkit-mask-size: contain;
            background: ${record.color};
            transform: rotate(${record.direction}deg);
            opacity: ${opacity};
        `;

        const el = document.createElement('div');
        el.innerHTML = `<div style="${style}"></div><span style="color: ${record.color}">${record.name}${record.group}</span>`;
        el.className = 'grad-marker';

        super(el, { anchor: 'top-left', offset: [-12, -12] });

        const [lat, lng] = armaToLatLng(worldSize, record.position);

        this.setLngLat(new MapboxGLLangLat(lng, lat));
    }
}
