<template>
    <div :class="classes" v-on="$listeners" v-bind="$attrs">
        <slot
            name="icon"
            :icon="icon"
        >
            <i class="material-icons">{{icon}}</i>
        </slot>
        <span v-if="tooltip.length > 0" class="grad-icon-button__tooltip">{{ tooltip }} </span>
        <slot />
    </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class IconButtonVue extends Vue {
    @Prop({ default: '', type: String }) private tooltip!: string;
    @Prop({ default: 'close', type: String }) private icon!: string;
    @Prop({ default: 'bottom', type: String }) private tooltipPos!: string;
    @Prop({ default: false, type: Boolean }) private dense!: boolean;
    @Prop({ default: false, type: Boolean }) private noSeperator!: boolean;
    @Prop({ default: false, type: Boolean }) private active!: boolean;
    @Prop({ default: false, type: Boolean }) private disabled!: boolean;

    private get classes (): string {
        const classes = [
            'grad-icon-button',
            `grad-icon-button--tooltip-${this.tooltipPos}`,
            this.noSeperator ? 'grad-icon-button--no-seperator' : '',
            this.dense ? 'grad-icon-button--dense' : '',
            this.active ? 'grad-icon-button--active' : '',
            this.disabled ? 'grad-icon-button--disabled' : ''
        ];

        return classes.filter(str => str.length > 0).join(' ');
    }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/colors.scss';

.grad-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    transition: all 0.1s ease-in-out;
    color: $color-inactive;
    padding: 0.75rem;

    &:not(:last-child)::before {
        content: '';
        position: absolute;
        width: 1px;
        right: 0px;
        bottom: .5rem;
        top: .5rem;
        background-color: $color-divider;
    }

    &:hover {
        background-color: rgba($color-active, 0.05);

        > .grad-icon-button__tooltip {
            display: initial;
        }
    }

    > i {
        color: inherit;
        user-select: none;
    }

    &__tooltip {
        display: none;
        color: white;
        white-space: nowrap;
        background-color: rgba(#222222, 0.6);
        padding: 8px;
        border-radius: 4px;
        position: absolute;
        font-size: 14px;
        font-weight: bold;
        top: calc(100% + 4px);
        letter-spacing: 0.08em;
        z-index: 2;
        pointer-events: none;
        user-select: none;
    }

    &--no-seperator::before {
        background-color: transparent !important;
    }

    &--tooltip-top > #{&}__tooltip {
        top: 0px;
        transform: translateY(calc(-100% - 4px));
    }

    &--tooltip-left > #{&}__tooltip {
        top: initial;
        left: 0px;
        transform: translateX(calc(-100% - 4px));
    }

    &--dense > i {
        padding: .5rem;
    }

    &--disabled {
        cursor: default;

        > i {
            opacity: 0.4;

            &:hover {
                background-color: transparent;
            }
        }
    }

    &--active {
        color: $color-active;
    }
}
</style>
