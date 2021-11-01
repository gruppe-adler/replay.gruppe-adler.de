<template>
  <router-view/>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { setApiUri } from '@gruppe-adler/maps-frontend-utils';
import { WMTS_BASE_URL } from './ApiUtils';

@Component
export default class AppVue extends Vue {
    private created () {
        setApiUri(WMTS_BASE_URL);
    }
}
</script>

<style lang="scss">
html, body {
    margin: 0px;
    padding: 0px;
    font-family: 'Roboto', sans-serif;
    height: 100%;
    font-size: 16px;
    background-color: #f0eeec;
}
h1, h2, h3, h4, h5, h6 {
    font-family: 'Roboto', sans-serif;
}

button {
    color: #2F80ED;
    background-color: #E3E1DF;
    border-radius: 1.35em;
    padding: 0.75em 1em;
    border: none;
    font-weight: 600;
    outline: none;
    height: 1.2em;
    box-sizing: content-box;
    font-size: inherit;

    user-select: none;
    transition: all 0.1s ease-in-out;
    cursor: pointer;

    &:hover {
        background-color: #2F80ED;
        color: white;
    }

    &[disabled] {
        color: #777;
        background-color: rgba(#E3E1DF, 0.5);
        pointer-events: none;
    }
}
</style>
