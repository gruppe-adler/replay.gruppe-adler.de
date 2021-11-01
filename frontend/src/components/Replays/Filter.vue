<template>
    <div class="grad-replays-filter" @keydown.enter="setFilter" @click="$refs.input.focus()">
        <i class="material-icons">search</i>
        <input type="text" v-model="filterText" ref="input" />
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { Replay } from '@/models/Replay';
import { MapMetaData } from '@gruppe-adler/maps-frontend-utils';

type Mode = 'text'|'on'; // |'before'|'after'|'longer_than'|'shorter_than';

@Component
export default class ReplaysFilterVue extends Vue {
    @Prop({ type: Array, default: [] }) private replays!: Replay[];
    @Prop({ type: Array, default: [] }) private maps!: Pick<MapMetaData, 'displayName' | 'worldName' | 'author'>[];
    @Prop({ type: Array, default: [] }) private value!: Replay[];

    private filterText = '';

    private get filteredReplays (): Replay[] { return this.value; }
    private set filteredReplays (val: Replay[]) {
        this.$emit('input', val);
    }

    private created () {
        this.updateFilteredReplays();
    }

    @Watch('replays')
    @Watch('filterText')
    private updateFilteredReplays () {
        this.filteredReplays = this.replays.filter(r => r.missionName.toLowerCase().includes(this.filterText.toLowerCase()));
    }
}
</script>

<style lang="scss" scoped>
.grad-replays-filter {
    position: relative;
    margin: 1rem 2rem;
    font-size: 24px;
    box-sizing: border-box;
    max-width: 800px;
    justify-self: flex-end;
    background-color: #E3E1DF;
    display: flex;
    border-radius: 1em;
    padding: 0.5rem 0;
    padding-left: 0px;
    padding-right: 2rem;
    align-items: center;

    > i {
        width: 2em;
        height: auto;
        font-size: 1.5em;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.5;
    }

    input {
        background-color: transparent;
        border: none;
        outline: none;
        font-size: 1.2rem;
    }

}
</style>
