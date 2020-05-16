<template>
<div class="grad-replay__toolbar grad-replay__group">
    <IconButton
        @click="$emit('update:satShown', !satShown)"
        :icon="satShown ? 'layers_clear' : 'layers'"
        tooltip="Toogle Satellite Image"
    />
    <IconButton
        @click="$emit('update:gridShown', !gridShown)"
        :icon="gridShown ? 'grid_off' : 'grid_on'"
        tooltip="Toogle Grid"
    />
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import IconButtonVue from './IconButton.vue';

@Component({
    components: {
        IconButton: IconButtonVue
    }
})
export default class ReplayToolbarVue extends Vue {
    @Prop({ default: true, type: Boolean }) private satShown!: boolean;
    @Prop({ default: true, type: Boolean }) private gridShown!: boolean;
}
</script>

<style lang="scss" scoped>
.grad-replay__toolbar {
    display: flex;
    position: fixed;
    top: 1rem;
    right: 1rem;
}
</style>
