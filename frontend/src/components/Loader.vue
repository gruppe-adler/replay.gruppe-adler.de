<template>
    <div class="grad-loader">
        <h1>
            loading
            <span v-for="i in status" :key="i">.</span>
            <span v-for="i in (max - status)" :key="`hidden-${i}`" style="opacity: 0">.</span>
        </h1>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class LoaderVue extends Vue {
    private max = 4;
    private status = 0;
    private summand = 1;
    private interval: null|number = null

    private created () {
        this.interval = window.setInterval(() => {
            this.status = this.status >= this.max ? 1 : this.status + 1;
        }, 200);
    }

    private beforeDestory () {
        if (this.interval !== null) window.clearInterval(this.interval);
    }
}
</script>

<style lang="scss" scoped>
.grad-loader {
    height: 100%;
    width: 100%;
    display: grid;
    align-items: center;
    align-content: center;
    justify-items: center;
    justify-content: center;
    background-color: rgba(#f0eeec, .5);
    text-transform: uppercase;
    font-weight: bold;
    letter-spacing: .15em;
}
</style>
