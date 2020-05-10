import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '*',
        component: () => import(/* webpackChunkName: "404" */ '@/views/404.vue')
    },
    {
        path: '/',
        component: () => import(/* webpackChunkName: "replays" */ '@/views/Replays.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
