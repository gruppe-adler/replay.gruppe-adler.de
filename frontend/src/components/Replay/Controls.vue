<template>
<div class="grad-replay__controls grad-replay__group">
    <IconButton v-if="loading" :noSeperator="true">
        <template v-slot:icon>
            <i class="material-icons grad-replay__controls-spinner">hourglass_empty</i>
        </template>
    </IconButton>
    <IconButton v-else-if="interval !== null" icon="pause" @click="pause" :noSeperator="true" />
    <IconButton v-else-if="frameNumber < replay.frameCount - 1" icon="play_arrow" @click="play" :noSeperator="true" />
    <IconButton v-else icon="replay" @click="frameNumber = 0; play()" :noSeperator="true" />
    <Slider v-model="frameNumber" :max="replay.frameCount - 1" :worker="dataWorker" />
    <span v-if="frame">{{ frame.time }}</span>
    <IconButton icon="speed" @click.stop="toggleSpeedFlyout" :active="speedFlyout" />
    <div v-if="speedFlyout" class="grad-replay__group grad-replay__controls-speed-flyout">
        <div
            v-for="s in [8,4,2,1]"
            :key="s"
            :class="{ 'grad-active': speedFactor === s }"
            @click="speedFactor = s"
        >{{s}}x</div>
    </div>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Replay, ReplayFrame } from '@/models/Replay';
import IconButtonVue from './IconButton.vue';
import DataWorker from '@/utils/DataWorker';
import ReplayControlsSliderVue from './Controls/Slider.vue';

const SEARCH_PARAM_NAME = 'frame';

@Component({
    components: {
        IconButton: IconButtonVue,
        Slider: ReplayControlsSliderVue
    }
})
export default class ReplayControlsVue extends Vue {
    @Prop({ required: true, type: Object }) private replay!: Replay;
    @Prop({ required: true }) private value!: ReplayFrame|null;

    // v-model helpers
    private get frame (): ReplayFrame|null { return this.value; };
    private set frame (val: ReplayFrame|null) { this.$emit('input', val); };

    private interval: number|null = null;
    private frameNumber = 0;
    private speedFactor = 1;
    private dataWorker: DataWorker|null = null;
    private speedFlyout = false;
    private loading = false;
    private playAfterLoaded = false;

    private created () {
        this.dataWorker = new DataWorker(this.replay);

        this.dataWorker.addEventListener('loading', () => { this.loading = true; });
        this.dataWorker.addEventListener('loaded', () => {
            this.loading = false;
            if (this.playAfterLoaded) {
                this.play();
            };
        });

        this.decodeFramefromSearchParams();
        this.loadFrame();
    }

    private async decodeFramefromSearchParams () {
        const searchParams = new URLSearchParams(window.location.search);

        const frameStr = searchParams.get(SEARCH_PARAM_NAME);
        if (frameStr === null) return;

        const frame = Number.parseInt(window.decodeURIComponent(frameStr), 10);
        if (!Number.isNaN(frame) && frame < this.replay.frameCount) {
            this.frameNumber = frame;
        }

        this.updateUrl();
    }

    @Watch('frameNumber')
    private updateUrl () {
        const url = new URL(window.location.href);
        if (this.frameNumber === 0) {
            url.searchParams.delete(SEARCH_PARAM_NAME);
        } else {
            url.searchParams.set(SEARCH_PARAM_NAME, window.encodeURIComponent(this.frameNumber));
        }

        window.history.replaceState({ path: url.toString() }, '', url.toString());
    }

    private toggleSpeedFlyout () {
        this.speedFlyout = !this.speedFlyout;

        if (!this.speedFlyout) return;

        window.addEventListener('click', e => { this.speedFlyout = false; e.preventDefault(); e.stopPropagation(); }, { once: true });
    }

    /**
     * Load current frame
     */
    @Watch('frameNumber')
    private async loadFrame () {
        if (this.dataWorker === null) return;

        const n = this.frameNumber;
        const f = await this.dataWorker.getFrame(this.frameNumber);

        if (n === this.frameNumber && f !== null) this.frame = f;
    }

    /**
     * "Restart" play when sppedFactor changes
    */
    @Watch('speedFactor')
    private onSpeedChanged () {
        if (this.interval === null) return;

        this.play();
    }

    /**
     * Play btn click callback
     */
    private play () {
        if (this.interval !== null) this.pause();

        this.interval = window.setInterval(() => {
            if (this.loading) {
                this.pause();
                this.playAfterLoaded = true;
            };

            if (this.frameNumber >= this.replay.frameCount - 1) {
                this.frameNumber = this.replay.frameCount - 1;
                this.pause();
            } else {
                this.frameNumber++;
            }
        }, 1000 / this.speedFactor);
    }

    /**
     * Pause btn click callback
    */
    private pause () {
        if (this.interval === null) return;

        window.clearInterval(this.interval);
        this.interval = null;
        this.playAfterLoaded = false;
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/colors.scss';

.grad-replay__controls {
    display: grid;
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    align-items: center;
    grid-template-columns: auto 1fr auto auto;
    grid-column-gap: .5rem;

    &-speed-flyout {
        position: absolute;
        right: 0;
        bottom: calc(100% + .5rem);

        div {
            padding: 1rem;
            cursor: pointer;

            &:hover {
                background-color: rgba($color-active, 0.05);
            }

            &.grad-active {
                background-color: rgba(black, 0.2);
            }
        }
    }

    &-spinner {
        animation: grad-spin 2s infinite ease;
    }
}

@keyframes grad-spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>
