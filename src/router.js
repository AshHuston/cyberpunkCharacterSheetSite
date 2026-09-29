import { createRouter, createWebHistory } from "vue-router";
import CharacterSheet from "./views/CharacterSheet.vue";
import DiceRollerPage from "./views/DiceRollerPage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/check",
            component: DiceRollerPage
        },
        {
            path: "/:character",
            component: CharacterSheet
        }
    ]
});

export default router;
