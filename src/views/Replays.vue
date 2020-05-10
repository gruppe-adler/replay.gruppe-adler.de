<template>
    <Error
        v-if="errorText.length > 0"
        :text="errorText"
        @btn="fetchReplays"
    />
    <Loader
        v-else-if="loading"
    />
    <div v-else class="grad-replays">
        <div class="grad-replays__filter">
            <i class="material-icons">search</i>
            <input type="text" v-model="filter" />
        </div>
        <div class="grad-replays__replays-wrapper" v-if="filteredReplays.length > 0">
            <ReplayItem
                v-for="r in filteredReplays"
                :key="r.id"
                :model="r"
                :maps="maps"
            />
        </div>
        <div v-else style="display: flex; justify-content: center; padding: 2rem;">
            <h3>Your filter did not match any replays.</h3>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ErrorVue from '@/components/Error.vue';
import LoaderVue from '@/components/Loader.vue';
import { Replay } from '@/models/Replay';
import { fetchReplays } from '@/ApiUtils';
import { MapMetaData, fetchMaps } from '@gruppe-adler/maps-frontend-utils';
import ReplayItemVue from '@/components/Replays/ReplayItem.vue';

@Component({
    components: {
        Error: ErrorVue,
        Loader: LoaderVue,
        ReplayItem: ReplayItemVue
    }
})
export default class ReplaysVue extends Vue {
    private loading = false;
    private errorText = '';
    private filter = '';
    private replays: Replay[] = [];
    private maps: Pick<MapMetaData, 'displayName' | 'worldName' | 'author'>[] = [];

    private created () {
        this.fetchReplays();
    }

    private async fetchReplays () {
        this.loading = true;
        try {
            this.replays = (await fetchReplays()).sort((a, b) => b.date.getTime() - a.date.getTime());
            this.maps = await fetchMaps();
        } catch (err) {
            this.errorText = 'An error occured while loading available replays';
            console.error(err);
        }
        this.loading = false;
    }

    private get filteredReplays (): Replay[] {
        const filter = this.filter.toLowerCase();

        return this.replays.filter(m => m.missionName.toLowerCase().includes(filter));
    }
}
</script>

<style lang="scss" scoped>
.grad-replays {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;

    &__filter {
        position: relative;
        margin: 1rem;
        font-size: 24px;
        box-sizing: border-box;

        > i {
            position: absolute;
            top: 0px;
            left: 0px;
            bottom: 0px;
            width: 2.1em;
            height: auto;
            font-size: 1.5em;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0.5;
        }

        > input {
            color: black;
            background-color: #E3E1DF;
            border-radius: 2.1em;
            padding: 1.5em 2em;
            border: none;
            font-weight: 600;
            outline: none;
            line-height: 1.2em;
            height: auto;
            box-sizing: border-box;
            font-size: 0.75em;
            width: 100%;
            padding-left: 4.2em;
            margin: 0px;
        }
    }

    &__replays-wrapper {
        flex-shrink: 1;
        overflow-y: auto;
        overflow-x: hidden;
    }
}
</style>
