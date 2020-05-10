<template>
    <Error
        text="Page not found"
        :img="imgUrl"
    />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ErrorVue from '@/components/Error.vue'

@Component({
    components: {
        Error: ErrorVue
    }
})
export default class ReplaysVue extends Vue {
    private imgUrl = `${process.env.BASE_URL}errors/404.svg`;
}
</script>
