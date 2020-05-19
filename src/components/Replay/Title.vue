<template>
<div class="grad-replay__title grad-replay__group">
    <IconButton @click="$router.push('/')" icon="arrow_back" />
    <div>
        <span>{{ replay.missionName }}</span>
        <span>{{ date }}</span>
    </div>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Replay } from '@/models/Replay';
import IconButtonVue from './IconButton.vue';
import { formatDate, formatTime } from '../../utils/dateTime';

@Component({
    components: {
        IconButton: IconButtonVue
    }
})
export default class ReplayTitleVue extends Vue {
    @Prop({ required: true, type: Object }) private replay!: Replay;

    private get date (): string {
        return `(${formatDate(this.replay.date)} ${formatTime(this.replay.date)})`;
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/colors.scss';

.grad-replay__title {
    display: flex;
    align-items: center;
    flex-shrink: 1;
    justify-self: flex-start;
    max-width: 100%;
    overflow: hidden;

    > div:last-child {
        padding: 0 .5rem;
        display: flex;
        flex-wrap: wrap;

        > span {
            font-size: 1rem;
            font-weight: bold;
            color: $color-active;
            white-space: nowrap;
        }
    }
}
</style>
