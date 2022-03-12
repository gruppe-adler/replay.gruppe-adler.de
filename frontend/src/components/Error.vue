<template>
    <div class="grad-error">
        <img :src="img" />
        <h1>{{text}}</h1>
        <button v-if="$listeners.btn" @click="$emit('btn')">
            <slot name="button">
                Retry
            </slot>
        </button>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class ErrorVue extends Vue {
    @Prop({ required: true, type: String }) private text!: string;
    @Prop({ default: `${process.env.BASE_URL}errors/generic.svg`, type: String }) private img!: string;
}
</script>

<style lang="scss" scoped>
.grad-error {
    height: 100%;
    width: 100%;
    display: grid;
    align-items: center;
    align-content: center;
    justify-items: center;
    justify-content: center;
    background-color: rgba(#f0eeec, .5);

    > img {
        width: 20rem;
        max-width: 100%;
    }

    > h1 {
        margin: 0px;
        text-transform: uppercase;
        font-weight: bold;
    }

    > button {
        margin-top: 1rem;
        min-width: 15rem;
    }

}
</style>
