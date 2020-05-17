<template>
    <div :class="['grad-slider', active ? 'grad-slider--active' : '']" @mousedown="onMouseDown">
        <div class="grad-slider__track">
            <div
                v-for="(b, i) in bufferedAreas"
                class="grad-slider__buffered"
                :key="i"
                :style="`left: ${percent(b.start)}%; right: ${100 - percent(b.end)}%;`"
            ></div>
            <div :key="percent(value)" class="grad-slider__progress" :style="`width: ${percent(value)}%`"></div>
        </div>
        <div :key="percent(value)" class="grad-slider__thumb" :style="`left: ${percent(value)}%`"></div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import DataWorker from '@/utils/DataWorker';

@Component
export default class ReplayControlsSliderVue extends Vue {
    @Prop({ default: 0, type: Number }) private value!: number;
    @Prop({ default: 100, type: Number }) private max!: number;
    @Prop({ default: 0, type: Number }) private min!: number;
    @Prop({ default: 1, type: Number }) private steps!: number;
    @Prop({ default: null }) private worker!: DataWorker|null;

    private bufferedAreas: Array<{ start: number; end: number }> = [];

    private active = false;

    private created () {
        this.addListenerToWorker();
    }

    @Watch('worker')
    private addListenerToWorker () {
        if (this.worker === null) return;

        this.worker.addEventListener('buffered', () => this.updatedBufferedAreas());
    }

    private updatedBufferedAreas () {
        if (this.worker === null) return;

        this.bufferedAreas = this.worker.getBufferedAreas();
    }

    private onMouseDown (event: MouseEvent) {
        const mouseMoveEH = (ev: MouseEvent) => this.updateAccToMousePos(ev);
        this.active = true;

        window.addEventListener('mousemove', mouseMoveEH);

        window.addEventListener(
            'mouseup',
            (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();

                this.active = false;
                window.removeEventListener('mousemove', mouseMoveEH);
            },
            { once: true, capture: true }
        );

        this.updateAccToMousePos(event);
    }

    private updateAccToMousePos (event: MouseEvent) {
        if (!this.$el) return;

        const slider = this.$el as HTMLDivElement;

        const { left, width } = slider.getBoundingClientRect();
        const x = event.pageX;

        const percent = (x - left) / width;

        let val = this.min + (this.max - this.min) * percent;

        const remainder = val % this.steps;
        val = val - remainder;
        val = Math.max(val, this.min);
        val = Math.min(val, this.max);

        this.$emit('input', val);
    }

    private percent (val: number): number {
        return (val - this.min) / (this.max - this.min) * 100;
    }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/colors.scss';

.grad-slider {
    cursor: pointer;
    width: 100%;
    align-self: stretch;
    display: flex;
    align-items: center;
    position: relative;

    &__track {
        border-radius: .2rem;
        overflow: hidden;
        height: .4rem;
        background-color: $color-divider;
        position: relative;
        width: 100%;
    }

    &__progress {
        background-color: rgba(#66AA66, 70%);
        position: absolute;
        top: 0px;
        left: 0px;
        bottom: 0px;
        transition: all 0.05s ease-in-out;
    }

    &__thumb {
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        background-color: #333333;
        position: absolute;
        transform: translateX(-50%);
    }

    &__buffered {
        background-color: rgba(black, 20%);
        position: absolute;
        top: 0px;
        bottom: 0px;
    }

}
</style>
