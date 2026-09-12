import { createRouter, createWebHistory } from "vue-router";
import CharacterSheet from "./views/CharacterSheet.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/:character",
            component: CharacterSheet
        }
    ]
});

export default router;
