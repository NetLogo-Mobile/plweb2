import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: { keepAlive: true },
  },
  {
    path: "/b",
    name: "BlackHole",
    component: () => import("../views/BlackHole.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/n",
    name: "notifications",
    component: () => import("../views/Notifications.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/m",
    name: "messages",
    component: () => import("../views/Comments.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/p/:category/:id",
    name: "ExperimentSummary",
    component: () => import("../views/ExperimentSummary.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/c/:category/:id/:name",
    name: "Comments",
    component: () => import("../views/Comments.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/u/:id",
    name: "profile",
    component: () => import("../views/Profile.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/f",
    name: "friends",
    component: () => import("../views/Friends.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/l/:config",
    name: "list",
    component: () => import("../views/WorkList.vue"),
    meta: { keepAlive: true },
  },
  {
    path: "/s",
    name: "settings",
    component: () => import("../views/Settings.vue"),
    meta: { keepAlive: false },
  },
  {
    path: "/e/:category?/:id?",
    name: "Editor",
    component: () => import("../views/Editor.vue"),
    meta: { keepAlive: false },
  },
  {
    path: "/:catchAll(.*)",
    component: () => import("../views/NotFound.vue"),
    meta: { keepAlive: true },
  },
];

const router = createRouter({
  history: createWebHashHistory("/plweb2/"),
  routes,
});

export default router;
