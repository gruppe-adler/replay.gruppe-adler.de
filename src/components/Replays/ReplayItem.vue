<template>
    <div class="grad-replay-item">
        <h2 class="grad-replay-item__title">{{model.missionName}}</h2>
        <div class="grad-replay-item__fields">
            <div class="grad-replay-item--icon-text">
                <i class="material-icons">calendar_today</i>
                <span>{{date}}</span>
            </div>
            <div class="grad-replay-item--icon-text grad-replay-item__map-field">
                <i class="material-icons">map</i>
                <span>{{mapDisplayName}}</span>
            </div>
            <div class="grad-replay-item--icon-text">
                <i class="material-icons">schedule</i>
                <span>{{duration}}</span>
            </div>
            <div class="grad-replay-item--icon-text">
                <i class="material-icons">people</i>
                <span>n/a</span>
            </div>
        </div>
        <img v-if="mapImg.length > 0" class="grad-replay-item__map-img" :src="mapImg" />
        <img v-else class="grad-replay-item__map-img" src="@/assets/unkown_map.svg" />
        <span class="grad-replay-item__map-name">{{mapDisplayName}}</span>
        <div class="grad-replay-item__btn" :class="map !== null ? '' : 'grad-replay-item__btn--error'">
            <i class="material-icons" v-if="map !== null">play_arrow</i>
            <i class="material-icons" v-else>error</i>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Replay } from '@/models/Replay';
import { MapMetaData, mapPreviewImgUrl } from '@gruppe-adler/maps-frontend-utils';

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
        const sec = this.model.duration;

        const hours = Math.floor(sec / 3600);
        const min = Math.floor((sec % 3600) / 60);

        if (hours === 0) {
            return `${min} min`;
        }

        return `${hours}h ${min}min`;
    }

    private get date (): string {
        return (new Intl.DateTimeFormat(undefined, { weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric' })).format(this.model.date);
    }
}
</script>

<style lang="scss" scoped>
.grad-replay-item {
    background-color: white;
    display: grid;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
    border-radius: 0.75rem;
    grid-template:
            "title map-img map-name btn" auto
            "fields map-img map-name btn" auto / 30% auto 1fr 100px;

    grid-row-gap: 0.5rem;
    grid-column-gap: 0.75rem;
    align-items: center;
    justify-items: flex-start;

    &--icon-text {
        display: grid;
        grid-template-columns: auto auto;
        grid-column-gap: 0.5rem;
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
    }

    &__fields {
        grid-area: fields;
        display: grid;
        grid-column-gap: 1.5rem;
        grid-row-gap: .5rem;
        grid-auto-flow: column;
        justify-items: flex-start;
    }

    &__map-field {
        display: none;
    }

    &__map-img {
        grid-area: map-img;
        height: 3.5rem;
        width: 3.5rem;
        border-radius: .25rem;
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
        padding: 0.75rem 0.5rem;
        border-top-right-radius: inherit;
        border-bottom-right-radius: inherit;
        cursor: pointer;

        > i {
            transition: font-size .05s ease-in-out;
        }

        &:hover i {
            font-size: 30px;
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
            "fields map-img map-name btn" auto / 40% auto 1fr 100px;
    }

    @media(max-width: 1200px) {
        grid-template:
            "title map-img map-name btn" auto
            "fields map-img map-name btn" auto / 50% auto 1fr 100px;
    }

    @media(max-width: 800px) {
        grid-template:
            "title btn" auto
            "fields btn" auto / 1fr 100px;

        &__fields {
            grid-template-columns: auto auto;
            grid-auto-flow: row;
        }

        &__map-field {
            display: flex;
        }

        &__map-name,
        &__map-img {
            display: none;
        }
    }

}
</style>
