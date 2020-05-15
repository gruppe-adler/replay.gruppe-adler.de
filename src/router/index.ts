import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '*',
        component: () => import(/* webpackChunkName: "404" */ '@/views/404.vue')
    },
    {
        path: '/',
        component: () => import(/* webpackChunkName: "replays" */ '@/views/Replays.vue')
    },
    {
        path: '/:rid',
        component: () => import(/* webpackChunkName: "replay" */ '@/views/Replay.vue'),
        props: true
    }
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

export default router;
