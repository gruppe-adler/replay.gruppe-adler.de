<template>
<div class="grad-replay__title grad-replay__group">
    <IconButton @click="$router.push('/')" icon="arrow_back" />
    <span>{{ title }}</span>
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Replay } from '@/models/Replay';
import IconButtonVue from './IconButton.vue';
import { formatDate } from '../../utils/dateTime';

@Component({
    components: {
        IconButton: IconButtonVue
    }
})
export default class ReplayTitleVue extends Vue {
    @Prop({ required: true, type: Object }) private replay!: Replay;

    private get title (): string {
        return `${this.replay.missionName} (${formatDate(this.replay.date)})`;
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/colors.scss';

.grad-replay__title {
    display: flex;
    position: fixed;
    top: 1rem;
    left: 1rem;
    align-items: center;

    > span {
        font-size: 1rem;
        padding: 0 1.5rem 0 .5rem;
        font-weight: bold;
        color: $color-active;
    }
}
</style>
