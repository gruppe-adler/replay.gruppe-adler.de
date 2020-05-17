<template>
<div class="grad-replay__map">
    <Error
        v-if="errorText.length > 0"
        :text="errorText"
        v-on="errorBtn ? { btn: loadMap } : {}"
    />
    <Loader
        v-else-if="loading"
    />
    <div ref="map" style="position: fixed; top: 0px; left: 0px; bottom: 0px; right: 0px;"></div>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import ErrorVue from '@/components/Error.vue';
import LoaderVue from '@/components/Loader.vue';
import { GradMap, armaToLatLng } from '@gruppe-adler/maps-frontend-utils';
import { ReplayFrame } from '../../models/Replay';
import { Layer as LeafletLayer, Polyline as LeafletPolyline } from 'leaflet';
import UnitMarker from '@/utils/UnitMarker';

@Component({
    components: {
        Error: ErrorVue,
        Loader: LoaderVue
    }
})
export default class ReplayMapVue extends Vue {
    @Prop({ required: true, type: String }) private worldName!: string;
    @Prop({ default: true, type: Boolean }) private satShown!: boolean;
    @Prop({ default: true, type: Boolean }) private gridShown!: boolean;
    @Prop({ default: null }) private frame!: ReplayFrame|null;

    private loading = false;
    private map: GradMap|null = null;
    private errorText = '';
    private errorBtn = true;
    private layers: LeafletLayer[] = [];

    private mounted () {
        this.loadMap();
        this.onFrameChanged();
    }

    private async loadMap () {
        this.loading = true;

        try {
            this.map = await GradMap.new(this.worldName, this.$refs.map as HTMLDivElement, { satShown: this.satShown, gridShown: this.gridShown });
        } catch (err) {
            if (err.response && err.response instanceof Response) {
                if (err.response.status === 404) {
                    this.errorText = `Couldn't find map with worldname "${this.worldName}"`;
                    this.errorBtn = false;
                    return;
                }
            }
            console.error(err);
            this.errorText = 'An error occured while loading the map.';
            this.errorBtn = false;
        }

        this.loading = false;
    }

    @Watch('satShown')
    private onSatShownChanged () {
        if (this.map === null) return;

        this.map.satShown = this.satShown;
    }

    @Watch('gridShown')
    private onGridShownChanged () {
        if (this.map === null) return;

        this.map.gridShown = this.satShown;
    }

    @Watch('frame')
    private onFrameChanged () {
        if (this.frame === null) return;
        if (this.map === null) return;
        if (this.map.armaMapMetaData === null) return;

        const worldSize = this.map.armaMapMetaData.worldSize;

        this.layers.forEach(l => l.remove());

        const layers: LeafletLayer[] = [];

        for (const record of this.frame.data) {
            const marker = new UnitMarker(record, worldSize);
            marker.addTo(this.map);
            layers.push(marker);

            if (record.target) {
                const line = new LeafletPolyline(
                    [armaToLatLng(worldSize, record.position), armaToLatLng(worldSize, record.target)],
                    { color: record.color, weight: 2, opacity: 0.5 }
                );

                layers.push(line);
                line.addTo(this.map);
            }
        }

        this.layers = layers;
    }
}
</script>

<style lang="scss" scoped>
.grad-replay__map {
    height: 100vh;
    width: 100vw;
}
</style>

<style lang="scss">
.grad-marker {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    overflow: visible;

    > div {
        flex-shrink: 0;
    }

    > span {
        white-space: nowrap;
        font-weight: bold;
        font-size: 1rem;
        margin-left: .25rem;
        pointer-events: none;
    }
}
</style>
