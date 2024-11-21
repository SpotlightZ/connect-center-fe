import { RouteRecordRaw, createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "./store";

const routes: RouteRecordRaw[] = [
    {
        path: "/login",
        component: () => import("./pages/LoginPage.vue")
    },
    {
        path: "/",
        redirect: "/login",
        component: () => import("./pages/MainPage.vue"),
        children: [
            {
                path: "home",
                component: () => import("./pages/DeviceCardPage.vue")
            },
            {
                path: "kanban",
                component: () => import("./pages/DeviceKanban.vue")
            },
            {
                path: "dashboard",
                component: () => import("./pages/Dashboard.vue")
            },
            {
                path: "devices/:id",
                component: () => import("./pages/DeviceDetailPage.vue")
            },
            {
                path: "devices/:id",
                component: () => import("./pages/DeviceDetailPage.vue")
            },
            {
                path: "tasks/:id",
                component: () => import("./pages/TaskDetailPage.vue")
            },
            {
                path: "config",
                component: () => import("./pages/SystemConfigPage.vue")
            }
        ]
    },
    
];

let userStore: ReturnType<typeof useUserStore>;

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
});

router.beforeEach((to, _, next) => {
    if (!userStore) {
        userStore = useUserStore();
    }

    if (to.path !== "/login" && !userStore.isLoggedIn) {
        next("/login");
        return;
    }
    next();
});

export { router };