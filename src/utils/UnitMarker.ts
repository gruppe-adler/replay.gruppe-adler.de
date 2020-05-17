import { Marker as LeafletMarker, DivIcon, FeatureGroup } from 'leaflet';
import { ReplayRecord } from '@/models/Replay';
import { armaToLatLng } from '@gruppe-adler/maps-frontend-utils';

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

export default class UnitMarker extends FeatureGroup {
    constructor (record: ReplayRecord, worldSize: number) {
        super();
        this.setup(record, worldSize);
    }

    private async setup (record: ReplayRecord, worldSize: number) {
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

        const icon = new DivIcon({
            className: 'grad-marker',
            html: `
                <div style="${style}"></div>
                <span style="color: ${record.color}">${record.name}${record.group}</span>
            `,
            iconSize: [24, 24]
        });

        this.addLayer(new LeafletMarker(armaToLatLng(worldSize, record.position), { icon, interactive: false }));
    }
}
