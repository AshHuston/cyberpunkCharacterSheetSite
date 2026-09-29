<template>
    <div class="roller-page">
        <div class="roller-header">
            <button @click="goBack">
                Back
            </button>

            <h1>Check</h1>
        </div>

        <DiceRoller />
    </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import DiceRoller from "@/Components/DiceRoller.vue";

const router = useRouter();
const route = useRoute();

function goBack() {
    const character = route.query.character;

    if (character) {
        router.push(`/${character}`);
    } else {
        router.back();
    }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap");

.roller-page {
    --bg: #070a0c;
    --panel: #0c1114;
    --border: #26343a;
    --text: #d5e1e4;
    --muted: #718187;
    --cyan: #35e0d0;
    --cyan-dark: #123f3d;

    min-height: 100vh;
    max-width: 1100px;
    margin: 0 auto;
    padding: 3rem;

    color: var(--text);

    font-family: "JetBrains Mono", monospace;

    background:
        radial-gradient(
            circle at 50% 0%,
            rgba(53, 224, 208, 0.055),
            transparent 40%
        ),
        var(--bg);
}

.roller-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 2rem;
    padding-bottom: 1rem;

    border-bottom: 1px solid var(--border);
    position: relative;
}

.roller-header::before {
    content: "SYSTEM // CHECK RESOLUTION";
    position: absolute;
    top: -1.25rem;
    left: 0;

    color: var(--muted);
    font-size: .65rem;
    letter-spacing: .2em;
}

h1 {
    margin: 0;
    color: #eefafa;
    font-weight: 500;
}

h1::before {
    content: "> ";
    color: var(--cyan);
}

button {
    appearance: none;
    border: 1px solid var(--border);
    background: var(--panel);
    color: var(--cyan);

    padding: .6rem 1rem;

    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: .12em;

    cursor: pointer;
}

button:hover {
    background: var(--cyan-dark);
    border-color: var(--cyan);
}
</style>
