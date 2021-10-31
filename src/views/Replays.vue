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
        <ReplaysFilter
            v-model="filteredReplays"
            :replays="replays"
            :maps="maps"
        />
        <div class="grad-replays__replays-wrapper" v-if="filteredReplays.length > 0">
            <ReplayItem
                v-for="r in filteredReplays"
                :key="r._id"
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
import ReplaysFilterVue from '@/components/Replays/Filter.vue';

@Component({
    components: {
        Error: ErrorVue,
        Loader: LoaderVue,
        ReplayItem: ReplayItemVue,
        ReplaysFilter: ReplaysFilterVue
    }
})
export default class ReplaysVue extends Vue {
    private loading = false;
    private errorText = '';
    private replays: Replay[] = [];
    private filteredReplays: Replay[] = [];
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
}
</script>

<style lang="scss" scoped>
.grad-replays {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;

    &__replays-wrapper {
        flex-shrink: 1;
        overflow-y: auto;
        overflow-x: hidden;
    }
}
</style>
