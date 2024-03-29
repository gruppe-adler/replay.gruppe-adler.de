<template>
    <Error
        v-if="errorText.length > 0"
        :text="errorText"
        v-on="errorBtn ? { btn: fetchReplay } : {}"
    />
    <Loader
        v-else-if="loading"
    />
    <div v-else-if="replay !== null" class="grad-replay">
        <ReplayMap
            :satShown="satShown"
            :gridShown="gridShown"
            :worldName="replay.worldName"
            :frame="frame"
        />
        <div class="grad-replay__top">
            <ReplayTitle
                :replay="replay"
            />
            <ReplayToolbar
                :satShown.sync="satShown"
                :gridShown.sync="gridShown"
            />
        </div>
        <ReplayControls
            v-model="frame"
            :replay="replay"
        />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ErrorVue from '@/components/Error.vue';
import LoaderVue from '@/components/Loader.vue';
import { Replay, ReplayFrame } from '@/models/Replay';
import { fetchReplay } from '@/ApiUtils';
import { GradMap } from '@gruppe-adler/maps-frontend-utils/lib/mapbox';
import ReplayMapVue from '@/components/Replay/Map.vue';
import ReplayTitleVue from '@/components/Replay/Title.vue';
import ReplayToolbarVue from '@/components/Replay/Toolbar.vue';
import ReplayControlsVue from '@/components/Replay/Controls.vue';

@Component({
    components: {
        Error: ErrorVue,
        Loader: LoaderVue,
        ReplayMap: ReplayMapVue,
        ReplayToolbar: ReplayToolbarVue,
        ReplayTitle: ReplayTitleVue,
        ReplayControls: ReplayControlsVue
    }
})
export default class ReplaysVue extends Vue {
    @Prop({ required: true, type: String }) private rid!: string;
    private loading = false;
    private errorText = '';
    private errorBtn = true;
    private replay: Replay|null = null;
    private frame: ReplayFrame|null = null;
    private map: GradMap|null = null;
    private satShown = false;
    private gridShown = true;

    private created () {
        this.fetchReplay();
    }

    private async fetchReplay () {
        this.loading = true;
        this.errorText = '';
        try {
            this.replay = await fetchReplay(this.rid);
        } catch (err) {
            if (err.response && err.response instanceof Response) {
                if (err.response.status === 404) {
                    this.errorText = `Couldn't find replay with id "${this.rid}"`;
                    this.errorBtn = false;
                    return;
                } else if (err.response.status === 422) {
                    this.errorText = `"${this.rid}" is not a valid Replay-ID`;
                    this.errorBtn = false;
                    return;
                }
            }
            this.errorText = 'An error occured while loading the replay';
            this.errorBtn = true;
        }

        this.loading = false;
    }
}
</script>

<style lang="scss" scoped>
.grad-replay {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;

    &__top {
        position: fixed;
        top: 1rem;
        left: 1rem;
        right: 1rem;
        display: grid;
        grid-template-columns: 1fr auto;
        grid-column-gap: 1rem;
        pointer-events: none;

        > * {
            pointer-events: initial;
        }
    }
}
</style>

<style lang="scss">
@import '~@/assets/colors.scss';

.grad-replay__group {
    background-color: $color-background;
    box-shadow: 0px 0.25rem .5rem rgba(0, 0, 0, 0.125);
    border-radius: .25rem;
}
</style>
