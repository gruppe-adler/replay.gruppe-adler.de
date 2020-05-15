<template>
    <Error
        v-if="errorText.length > 0"
        :text="errorText"
        v-on="errorBtn ? { btn: fetchReplay } : {}"
    />
    <Loader
        v-else-if="loading"
    />
    <div v-else class="grad-replay">
        {{ replay }}
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import ErrorVue from '@/components/Error.vue';
import LoaderVue from '@/components/Loader.vue';
import { Replay } from '@/models/Replay';
import { fetchReplay } from '@/ApiUtils';
import { GradMap } from '@gruppe-adler/maps-frontend-utils';

@Component({
    components: {
        Error: ErrorVue,
        Loader: LoaderVue
    }
})
export default class ReplaysVue extends Vue {
    @Prop({ required: true, type: String }) private rid!: string;
    private loading = false;
    private errorText = '';
    private errorBtn = true;
    private replay: Replay|null = null;
    private map: GradMap|null = null;

    private created () {
        this.fetchReplay();
    }

    private get parsedReplayId (): number {
        return Number.parseInt(this.rid, 10);
    }

    private async fetchReplay () {
        this.loading = true;
        this.errorText = '';
        try {
            this.replay = await fetchReplay(this.parsedReplayId);
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

        // load map
        if (this.replay !== null) {
            try {
                this.map = await GradMap.new(this.replay.worldName, this.$el as HTMLDivElement);
            } catch (err) {
                if (err.response && err.response instanceof Response) {
                    if (err.response.status === 404) {
                        this.errorText = `Couldn't find map with worldname "${this.replay.worldName}"`;
                        this.errorBtn = false;
                        return;
                    }
                }
                this.errorText = 'An error occured while loading the map.';
                this.errorBtn = false;
            }
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
}
</style>
