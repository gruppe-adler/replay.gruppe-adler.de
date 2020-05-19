<template>
    <div class="grad-replay-item">
        <h2 class="grad-replay-item__title">{{model.missionName}}</h2>
        <div class="grad-replay-item__fields">
            <div class="grad-replay-item--icon-text">
                <i class="material-icons">calendar_today</i>
                <span>{{date}}</span>
            </div>
            <div class="grad-replay-item--icon-text">
                <i class="material-icons">schedule</i>
                <span>{{time}}</span>
            </div>
            <div class="grad-replay-item--icon-text grad-replay-item__map-field">
                <i class="material-icons">map</i>
                <span>{{mapDisplayName}}</span>
            </div>
            <div class="grad-replay-item--icon-text">
                <i class="material-icons">timelapse</i>
                <span>{{duration}}</span>
            </div>
        </div>
        <img v-if="mapImg.length > 0" class="grad-replay-item__map-img" :src="mapImg" />
        <img v-else class="grad-replay-item__map-img" src="@/assets/unkown_map.svg" />
        <span class="grad-replay-item__map-name">{{mapDisplayName}}</span>
        <div
            class="grad-replay-item__btn"
            :class="valid ? '' : 'grad-replay-item__btn--error'"
            @click="select"
        >
            <i class="material-icons" v-if="valid">play_arrow</i>
            <i class="material-icons" v-else>error</i>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Replay } from '@/models/Replay';
import { MapMetaData, mapPreviewImgUrl } from '@gruppe-adler/maps-frontend-utils';
import { formatDate, formatSeconds, formatTime } from '@/utils/dateTime';

@Component
export default class ReplayItemVue extends Vue {
    @Prop({ required: true, type: Object }) private model!: Replay;
    @Prop({ default: [], type: Array }) private maps!: Pick<MapMetaData, 'displayName' | 'worldName' | 'author'>[];

    private get map (): Pick<MapMetaData, 'displayName' | 'worldName' | 'author'>|null {
        return this.maps.find(x => x.worldName.toLowerCase() === this.model.worldName.toLowerCase()) || null;
    }

    private get mapDisplayName (): string {
        return this.map !== null ? this.map.displayName : this.model.worldName;
    }

    private get mapImg (): string {
        // TODO: Default img
        return this.map !== null ? mapPreviewImgUrl(this.map.worldName) : '';
    }

    private get duration (): string {
        return formatSeconds(this.model.duration);
    }

    private get date (): string {
        return formatDate(this.model.date);
    }

    private get time (): string {
        return formatTime(this.model.date);
    }

    private get valid (): boolean {
        return this.map !== null;
    }

    private select () {
        if (!this.valid) return;

        this.$router.push(`/${this.model.id}`);
    }
}
</script>

<style lang="scss" scoped>
.grad-replay-item {
    background-color: white;
    display: grid;
    font-size: 1rem;
    padding: 0.75em 1em;
    margin-bottom: 1em;
    margin-left: 1em;
    margin-right: 1em;
    border-radius: 0.75em;
    grid-template:
            "title map-img map-name btn" auto
            "fields map-img map-name btn" auto / 30% auto 1fr 6rem;

    grid-row-gap: 0.5em;
    grid-column-gap: 0.75em;
    align-items: center;
    justify-items: flex-start;

    &--icon-text {
        display: grid;
        grid-template-columns: auto auto;
        grid-column-gap: 0.5em;
        align-items: center;
        color: rgba(black, 50%);
        justify-content: center;

        > span {
            font-weight: bold;
        }
    }

    &__title {
        grid-area: title;
        margin: 0px;
        font-weight: normal;
        overflow: hidden;
    }

    &__fields {
        grid-area: fields;
        display: grid;
        grid-column-gap: 1em;
        grid-row-gap: .5em;
        grid-template-columns: .5fr .5fr .5fr;
        justify-items: flex-start;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    &__map-field {
        display: none;
    }

    &__map {
        grid-area: map;
        display: flex;
        align-items: center;
    }

    &__map-img {
        grid-area: map-img;
        height: 3.5em;
        width: 3.5em;
        border-radius: .25em;
    }
    &__map-name {
        grid-area: map-name;
        font-weight: bold;
    }

    &__btn {
        grid-area: btn;
        background-color: #2D9CDB;
        color: white;
        height: 100%;
        width: 100%;
        font-weight: bold;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.75em 0.5em;
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
        cursor: pointer;

        > i {
            user-select: none;
            transition: font-size .05s ease-in-out;
        }

        &:hover i {
            font-size: 4em;
        }

        &--error {
            pointer-events: none;
            background-color: #C4C4C4;
            color: #828282;
        }
    }

    @media(max-width: 1300px) {
        grid-template:
            "title map-img map-name btn" auto
            "fields map-img map-name btn" auto / 40% auto 1fr 6rem;
    }

    @media(max-width: 1200px) {
        grid-template:
            "title map-img map-name btn" auto
            "fields map-img map-name btn" auto / 50% auto 1fr 6rem;
    }

    @media(max-width: 800px) {
        grid-template:
            "title btn" auto
            "fields btn" auto / 1fr 5rem;

        &__fields {
            grid-template-columns: .5fr .5fr;
            grid-auto-flow: row;
        }

        &__map-field {
            display: grid;
        }

        &__map-name,
        &__map-img {
            display: none;
        }
    }

    @media(max-width: 600px) {
        font-size: .8rem;
    }

}
</style>
