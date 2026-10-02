<template>
    <div class="editor">

        <h1>Message Editor</h1>

        <label>
            Sender
            <input v-model="message.sender">
        </label>

        <label>
            Content
            <textarea
                v-model="message.content"
                rows="10"
            />
        </label>

        <label class="checkbox-label">
            <input
                type="checkbox"
                v-model="message.displayMessage"
            >
            Display Message to Players?
        </label>

        <label>
            Can See (comma separated)
            <input v-model="canSeeText">
        </label>

        <div class="button-row">
            <button @click="populatePlayers">
                Populate All Characters
            </button>

            <button @click="save">
                Save
            </button>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const message = ref({
    sender: "",
    content: "",
    canSee: [],
    hasOpened: [],
    displayMessage: false
});

const canSeeText = computed({
    get() {
        console.log("TEST")
        return message.value.canSee?.join(", ");
    },

    set(value) {
        message.value.canSee = value
            .split(",")
            .map(x => x.trim())
            .filter(Boolean);
    }
});

async function load() {
    const response = await fetch("/api/message");

    message.value = await response.json();
}

async function populatePlayers() {
    const response = await fetch(
        "/api/characters"
    );

    const characters = await response.json();

    message.value.canSee = characters;
}

async function save() {
    await fetch("/api/message", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message.value)
    });

    alert("Saved");
}

onMounted(load);
</script>

<style scoped>
.editor {
    --bg: #070a0c;
    --panel: #0c1114;
    --panel-light: #10171b;
    --border: #26343a;
    --text: #d5e1e4;
    --muted: #718187;
    --cyan: #35e0d0;
    --cyan-dark: #123f3d;

    max-width: 900px;
    margin: 2rem auto;
    padding: 2rem;

    background: var(--panel);
    border: 1px solid var(--border);

    color: var(--text);
    font-family: "JetBrains Mono", monospace;

    position: relative;
}

.editor::before {
    content: "SYSTEM // MESSAGE ADMIN";
    position: absolute;
    top: -0.75rem;
    left: 1rem;

    background: var(--bg);

    padding: 0 .5rem;

    color: var(--muted);
    font-size: .7rem;
    letter-spacing: .2em;
}

h1 {
    margin-top: 0;
    margin-bottom: 2rem;

    color: #eefafa;
    font-weight: 500;
}

h1::before {
    content: "> ";
    color: var(--cyan);
}

label {
    display: flex;
    flex-direction: column;

    gap: .5rem;
    margin-bottom: 1.5rem;

    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .12em;
    font-size: .75rem;
}

input,
textarea {
    width: 100%;

    padding: .75rem 1rem;

    background: var(--panel-light);
    border: 1px solid var(--border);

    color: var(--text);
    font-family: inherit;
    font-size: 1rem;

    box-sizing: border-box;
}

input:focus,
textarea:focus {
    outline: none;

    border-color: var(--cyan);

    box-shadow:
        0 0 0 1px var(--cyan),
        0 0 12px rgba(53, 224, 208, 0.15);
}

textarea {
    resize: vertical;
    min-height: 200px;

    line-height: 1.5;
}

button {
    appearance: none;

    padding: .8rem 1.5rem;

    background: var(--panel-light);
    border: 1px solid var(--cyan);

    color: var(--cyan);

    font-family: inherit;
    font-weight: 600;
    letter-spacing: .15em;
    text-transform: uppercase;

    cursor: pointer;

    transition:
        background .15s,
        box-shadow .15s;
}

button:hover {
    background: var(--cyan-dark);

    box-shadow:
        0 0 12px rgba(53,224,208,.25);
}

button:active {
    transform: translateY(1px);
}

.checkbox-label {
    flex-direction: row;
    align-items: center;
    gap: .75rem;
    cursor: pointer;
}

.checkbox-label input {
    width: auto;
    accent-color: var(--cyan);
    cursor: pointer;
}
</style>
