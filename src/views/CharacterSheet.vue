<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const character = ref(null);

const loading = ref(true);
const editing = ref(false);
const saving = ref(false);
const uploading = ref(false);

const selectedImage = ref(null);


// --------------------------------------------------
// Image URL
// --------------------------------------------------

const imageUrl = () => {

    if (!character.value) {
        return "";
    }

    return `/characters/${route.params.character}.${character.value.imageExtension || "webp"}`;
};


// --------------------------------------------------
// Load character
// --------------------------------------------------

async function loadCharacter() {
    try {
        const response = await fetch(
            `/api/characters/${route.params.character}`
        );
        if (!response.ok) {
            throw new Error("Character not found");
        }
        character.value = await response.json();
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}


// --------------------------------------------------
// Select image
// --------------------------------------------------

function selectImage(event) {

    selectedImage.value =
        event.target.files[0] || null;

}

// --------------------------------------------------
// Upload image
// --------------------------------------------------

async function uploadImage() {

    if (!selectedImage.value) {
        return;
    }

    uploading.value = true;

    try {

        const formData = new FormData();

        formData.append(
            "image",
            selectedImage.value
        );

        const response = await fetch(
            `/api/characters/${route.params.character}/image`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error("Image upload failed");
        }

        const data = await response.json();

        // Store the extension in the character JSON
        character.value.imageExtension =
            data.filename.split(".").pop();

        // Save the updated character
        await saveCharacter();

        // Force the browser to reload the image
        // in case it has cached the old one
        character.value.imageVersion =
            Date.now();

        selectedImage.value = null;

    } catch (error) {

        console.error(error);

        alert("Failed to upload image.");

    } finally {

        uploading.value = false;

    }

}


// --------------------------------------------------
// Save character
// --------------------------------------------------

async function saveCharacter() {

    saving.value = true;

    try {

        const response = await fetch(
            `/api/characters/${route.params.character}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(
                    character.value
                )
            }
        );

        if (!response.ok) {
            throw new Error(
                "Failed to save character"
            );
        }

        editing.value = false;

    } catch (error) {

        console.error(error);

        alert("Failed to save character.");

    } finally {

        saving.value = false;

    }

}

function setBoxValue(character, property, value) {
    if (character[property] === value) {
        character[property] = value - 1;
    } else {
        character[property] = value;
    }
}

function addTrademark() {
    character.value.trademarks.unshift({
        name: "New Trademark",
        edges: [""],
        flaws: [""]
    });
}


function removeTrademark(index) {
    character.value.trademarks.splice(index, 1);
}


function addEdge(trademark) {
    trademark.edges.push("");
}


function removeEdge(trademark, index) {
    trademark.edges.splice(index, 1);
}


function addFlaw(trademark) {
    trademark.flaws.push("");
}


function removeFlaw(trademark, index) {
    trademark.flaws.splice(index, 1);
}

onMounted(loadCharacter);
</script>

<template>
    <!-- Loading -->
    <div v-if="loading">
        Loading...
    </div>

    <!-- Character -->
    <div
        v-else-if="character"
        class="sheet"
    >
        <!-- HEADER -->
        <div class="sheet-header">
            <div>
                <input
                    v-if="editing"
                    v-model="character.name"
                />
                <h1 v-else>
                    {{ character.name }}
                </h1>
            </div>

            <div class="buttons">
                <button
                    v-if="!editing"
                    @click="editing = true"
                >
                    Edit
                </button>
                <button
                    v-else
                    @click="saveCharacter"
                    :disabled="saving"
                >
                    {{ saving ? "Saving..." : "Save" }}
                </button>
            </div>
        </div>

        <!-- CHARACTER IMAGE -->
        <section class="character-image">
            <img
                v-if="character.imageExtension"
                :src="`${imageUrl()}?v=${character.imageVersion || 0}`"
                :alt="character.name"
            />
            <div
                v-else
                class="no-image"
            >
                No image
            </div>

            <!-- IMAGE UPLOAD -->
            <div
                v-if="editing"
                class="image-upload"
            >
                <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    @change="selectImage"
                />
                <button
                    @click="uploadImage"
                    :disabled="!selectedImage || uploading"
                >
                    {{ uploading
                        ? "Uploading..."
                        : "Upload Image"
                    }}
                </button>
            </div>
        </section>

        <!-- DESCRIPTION -->
        <section>
            <h2>Description</h2>
            <textarea
                v-if="editing"
                v-model="character.description"
            />
            <p v-else>
                {{ character.description }}
            </p>
        </section>

        <!-- STATS -->
        <section class="stats">

            <!-- HITS -->

            <div class="box-stat">
                <strong>Hits</strong>

                <div class="status-boxes">
                    <button
                        v-for="index in 3"
                        :key="index"
                        class="status-box"
                        :class="{ marked: index <= character.hits }"
                        :disabled="!editing"
                        @click="setBoxValue(character, 'hits', index)"
                    >
                        <span v-if="index <= character.hits">×</span>
                    </button>
                </div>
            </div>


            <!-- STASH -->

            <div class="box-stat">
                <strong>Stash</strong>

                <div class="status-boxes">
                    <button
                        v-for="index in 5"
                        :key="index"
                        class="status-box"
                        :class="{ marked: index <= character.stash }"
                        :disabled="!editing"
                        @click="setBoxValue(character, 'stash', index)"
                    >
                        <span v-if="index <= character.stash">×</span>
                    </button>
                </div>
            </div>


            <!-- STUNT POINTS -->

            <div class="box-stat">
                <strong>Stunt Points</strong>

                <div class="status-boxes">
                    <button
                        v-for="index in 3"
                        :key="index"
                        class="status-box"
                        :class="{ marked: index <= character.stuntPoints }"
                        :disabled="!editing"
                        @click="setBoxValue(character, 'stuntPoints', index)"
                    >
                        <span v-if="index <= character.stuntPoints">×</span>
                    </button>
                </div>
            </div>

        </section>

        <!-- CONDITIONS -->
        <section>
            <h2>Conditions</h2>
            <div
                v-for="(condition, index) in character.conditions"
                :key="index"
            >
                <input
                    v-if="editing"
                    v-model="character.conditions[index]"
                />
                <span v-else>
                    {{ condition }}
                </span>
            </div>
        </section>

        <!-- TRADEMARKS -->
        <section>
            <div class="section-header">
                <h2>Trademarks</h2>
                <button
                    v-if="editing"
                    class="small-button"
                    @click="addTrademark"
                >
                    + Add Trademark
                </button>
            </div>
            <div
                v-for="(trademark, trademarkIndex) in character.trademarks"
                :key="trademarkIndex"
                class="trademark"
            >
                <!-- Trademark name -->
                <div class="trademark-header">
                    <input
                        v-if="editing"
                        v-model="trademark.name"
                    />
                    <h3 v-else>
                        {{ trademark.name }}
                    </h3>
                    <button
                        v-if="editing"
                        class="delete-button"
                        @click="removeTrademark(trademarkIndex)"
                    >
                        ×
                    </button>
                </div>
                <!-- Edges -->
                <div class="trait-section">
                    <div class="trait-header">
                        <strong>Edges</strong>
                        <button
                            v-if="editing"
                            class="small-button"
                            @click="addEdge(trademark)"
                        >
                            + Add
                        </button>
                    </div>
                    <div
                        v-for="(edge, edgeIndex) in trademark.edges"
                        :key="edgeIndex"
                        class="trait-row"
                    >
                        <input
                            v-if="editing"
                            v-model="trademark.edges[edgeIndex]"
                        />
                        <span v-else>
                            {{ edge }}
                        </span>
                        <button
                            v-if="editing"
                            class="delete-button"
                            @click="removeEdge(trademark, edgeIndex)"
                        >
                            ×
                        </button>
                    </div>
                </div>
                <!-- Flaws -->
                <div class="trait-section">
                    <div class="trait-header">
                        <strong>Flaws</strong>
                        <button
                            v-if="editing"
                            class="small-button"
                            @click="addFlaw(trademark)"
                        >
                            + Add
                        </button>
                    </div>
                    <div
                        v-for="(flaw, flawIndex) in trademark.flaws"
                        :key="flawIndex"
                        class="trait-row"
                    >
                        <input
                            v-if="editing"
                            v-model="trademark.flaws[flawIndex]"
                        />
                        <span v-else>
                            {{ flaw }}
                        </span>
                        <button
                            v-if="editing"
                            class="delete-button"
                            @click="removeFlaw(trademark, flawIndex)"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- DRIVE -->
        <section>
            <h2>Drive</h2>
            <input
                v-if="editing"
                v-model="character.drive"
            />
            <p v-else>
                {{ character.drive }}
            </p>
        </section>
    </div>

    <!-- Not found -->
    <div v-else>
        Character not found.
    </div>
</template>


<style scoped>

@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap");


/* =========================================================
   GLOBAL SHEET
   ========================================================= */

.sheet {
    --bg: #070a0c;
    --panel: #0c1114;
    --panel-light: #10171b;
    --border: #26343a;

    --text: #d5e1e4;
    --muted: #718187;

    --cyan: #35e0d0;
    --cyan-dark: #123f3d;

    --warning: #e5a94a;
    --danger: #e05252;

    position: relative;

    min-height: 100vh;

    box-sizing: border-box;

    max-width: 1100px;
    margin: 0 auto;

    padding: 3rem;

    color: var(--text);

    font-family:
        "JetBrains Mono",
        "Courier New",
        monospace;

    background:
        radial-gradient(
            circle at 50% 0%,
            rgba(53, 224, 208, 0.055),
            transparent 40%
        ),
        var(--bg);

    line-height: 1.6;
}


/* =========================================================
   CRT / SCANLINE EFFECT
   ========================================================= */

.sheet::before {
    content: "";

    position: fixed;

    inset: 0;

    pointer-events: none;

    z-index: 100;

    background:
        repeating-linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.012) 0px,
            rgba(255, 255, 255, 0.012) 1px,
            transparent 1px,
            transparent 4px
        );
}


/* =========================================================
   HEADER
   ========================================================= */

.sheet-header {
    display: flex;

    justify-content: space-between;
    align-items: flex-end;

    gap: 2rem;

    margin-bottom: 3rem;

    padding-bottom: 1.25rem;

    border-bottom: 1px solid var(--border);

    position: relative;
}


/* Little terminal-style indicator */

.sheet-header::before {
    content: "PERSONNEL // PROFILE";

    position: absolute;

    top: -1.5rem;
    left: 0;

    font-size: 0.65rem;

    letter-spacing: 0.2em;

    color: var(--muted);
}


/* Cyan line underneath */

.sheet-header::after {
    content: "";

    position: absolute;

    bottom: -1px;
    left: 0;

    width: 110px;

    height: 1px;

    background: var(--cyan);

    box-shadow:
        0 0 8px rgba(53, 224, 208, 0.6);
}


.sheet-header h1 {
    margin: 0;

    font-size: 2.5rem;

    font-weight: 500;

    letter-spacing: 0.04em;

    color: #eefafa;

    text-shadow:
        0 0 12px rgba(53, 224, 208, 0.2);
}


.sheet-header h1::before {
    content: "> ";

    color: var(--cyan);
}


/* =========================================================
   BUTTONS
   ========================================================= */

.buttons {
    display: flex;

    gap: 0.75rem;
}


button {
    appearance: none;

    border: 1px solid var(--border);

    background: var(--panel);

    color: var(--cyan);

    padding: 0.6rem 1rem;

    font-family: inherit;

    font-size: 0.75rem;

    text-transform: uppercase;

    letter-spacing: 0.12em;

    cursor: pointer;

    transition:
        background 0.15s,
        border-color 0.15s,
        box-shadow 0.15s,
        color 0.15s;
}


button::before {
    content: "[ ";
    color: var(--muted);
}


button::after {
    content: " ]";
    color: var(--muted);
}


button:hover:not(:disabled) {
    background: var(--cyan-dark);

    border-color: var(--cyan);

    box-shadow:
        0 0 12px rgba(53, 224, 208, 0.15);

    color: #ffffff;
}


button:disabled {
    opacity: 0.4;

    cursor: not-allowed;
}


/* =========================================================
   SECTIONS
   ========================================================= */

section {
    position: relative;

    margin-bottom: 2rem;

    padding: 1.5rem;

    background:
        linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.018),
            transparent
        ),
        var(--panel);

    border: 1px solid var(--border);
}


/* Technical corner */

section::before {
    content: "";

    position: absolute;

    top: -1px;
    left: -1px;

    width: 14px;
    height: 14px;

    border-top: 2px solid var(--cyan);
    border-left: 2px solid var(--cyan);
}


/* =========================================================
   SECTION HEADINGS
   ========================================================= */

section h2 {
    margin: 0 0 1.25rem;

    font-size: 0.75rem;

    font-weight: 600;

    text-transform: uppercase;

    letter-spacing: 0.2em;

    color: var(--cyan);
}


section h2::before {
    content: "// ";

    color: var(--muted);
}


/* =========================================================
   DESCRIPTION
   ========================================================= */

section p {
    margin: 0;

    color: var(--text);

    font-size: 0.9rem;
}


/* =========================================================
   CHARACTER IMAGE
   ========================================================= */

.character-image {
    display: grid;

    grid-template-columns: 320px 1fr;

    gap: 2rem;

    align-items: center;

    min-height: 350px;

    background:
        radial-gradient(
            circle at 15% 50%,
            rgba(53, 224, 208, 0.07),
            transparent 35%
        ),
        var(--panel);
}


/* Image */

.character-image img {
    display: block;

    width: 100%;
    max-width: 320px;

    max-height: 450px;

    object-fit: cover;

    border: 1px solid var(--border);

    filter:
        saturate(0.75)
        contrast(1.08);

    box-shadow:
        0 0 30px rgba(0, 0, 0, 0.5);
}


/* Image frame */

.character-image img::after {
    content: "";
}


/* No image placeholder */

.no-image {
    width: 300px;
    height: 380px;

    display: flex;

    align-items: center;
    justify-content: center;

    border: 1px dashed var(--border);

    color: var(--muted);

    font-size: 0.7rem;

    text-transform: uppercase;

    letter-spacing: 0.15em;

    background:
        repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.015) 10px,
            rgba(255, 255, 255, 0.015) 11px
        );
}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

.image-upload {
    display: flex;

    flex-direction: column;

    align-items: flex-start;

    gap: 1rem;

    color: var(--muted);

    font-size: 0.7rem;
}


.image-upload::before {
    content: "VISUAL IDENTIFICATION // UPDATE";

    color: var(--cyan);

    font-size: 0.65rem;

    letter-spacing: 0.15em;
}


.image-upload input[type="file"] {
    max-width: 100%;

    font-family: inherit;

    color: var(--muted);

    font-size: 0.7rem;
}


/* =========================================================
   STATS
   ========================================================= */

.stats {
    display: grid;

    grid-template-columns:
        repeat(3, 1fr);

    gap: 1rem;

    background: transparent;

    border: none;

    padding: 0;
}


.stats::before {
    display: none;
}


.stats > div {
    position: relative;
    padding: 1.25rem;
    background: var(--panel);
    border: 1px solid var(--border);
}

.stats strong {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--muted);
    font-size: 0.65rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.15em;
}

.stats span {
    display: block;
    color: var(--cyan);
    font-size: 1.8rem;
    font-weight: 600;
    line-height: 1;
}


/* =========================================================
   TRADEMARKS
   ========================================================= */

.trademark {
    margin-top: 1rem;
    padding: 1rem 1.25rem;
    background: var(--panel-light);
    border: 1px solid var(--border);
    border-left: 2px solid var(--cyan);
}

.trademark h3 {
    margin: 0 0 1rem;
    color: #eefafa;
    font-size: 1rem;
    font-weight: 500;
}

.trademark strong {
    display: block;
    margin-top: 0.75rem;
    margin-bottom: 0.25rem;
    color: var(--muted);
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
}

/* =========================================================
   FORM ELEMENTS
   ========================================================= */

input,
textarea {
    box-sizing: border-box;
    width: 100%;
    border: 1px solid var(--border);
    outline: none;
    background: #06090b;
    color: var(--text);
    padding: 0.65rem;
    font-family: inherit;
    font-size: 0.8rem;
    transition:
        border-color 0.15s,
        box-shadow 0.15s;
}

input:focus,
textarea:focus {
    border-color: var(--cyan);

    box-shadow:
        0 0 0 1px var(--cyan),
        0 0 12px rgba(53, 224, 208, 0.1);
}

textarea {
    min-height: 120px;
    resize: vertical;
}

/* =========================================================
   CONDITION LIST
   ========================================================= */
section > div > span {
    display: inline-block;
    margin-right: 0.5rem;
}

section > div > span::before {
    content: "[";
    color: var(--cyan);
}

section > div > span::after {
    content: "]";
    color: var(--cyan);
}

/* =========================================================
   RESPONSIVE
   ========================================================= */
@media (max-width: 700px) {
    .sheet {
        padding: 2rem 1rem;
    }

    .sheet-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .sheet-header h1 {
        font-size: 1.8rem;
    }

    .character-image {
        grid-template-columns: 1fr;
    }

    .character-image img,
    .no-image {
        width: 100%;
        max-width: 100%;
    }

    .stats {
        grid-template-columns: 1fr;
    }
}

/* =========================================================
   STATUS BOXES
   ========================================================= */
.box-stat {
    min-width: 0;
}

.box-stat > strong {
    display: block;
    margin-bottom: 0.75rem;
    color: var(--muted);
    font-size: 0.65rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.15em;
}

.status-boxes {
    display: flex;
    gap: 0.45rem;
}

.status-box {
    width: 38px;
    height: 38px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    background: #06090b;
    color: var(--cyan);
    font-family: inherit;
    font-size: 1.5rem;
    line-height: 1;
    cursor: default;
    transition:
        border-color 0.15s,
        background 0.15s,
        box-shadow 0.15s;
}

.status-box::before,
.status-box::after {
    display: none;
}


.status-box.marked {
    border-color: var(--cyan);

    background:
        linear-gradient(
            135deg,
            rgba(53, 224, 208, 0.12),
            rgba(53, 224, 208, 0.025)
        );

    box-shadow:
        inset 0 0 12px rgba(53, 224, 208, 0.08);
}

.status-box.marked span {
    text-shadow:
        0 0 8px rgba(53, 224, 208, 0.5);
}

/* Interactive only while editing */
.status-box:not(:disabled) {
    cursor: pointer;
}

.status-box:not(:disabled):hover {
    border-color: var(--cyan);
    background: var(--cyan-dark);
    box-shadow: 0 0 10px rgba(53, 224, 208, 0.15);

    /* =========================================================
   TRADEMARK EDITOR
   ========================================================= */

.section-header {
    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 1rem;

    margin-bottom: 1.25rem;
}


.section-header h2 {
    margin: 0;
}


.trademark-header {
    display: flex;

    align-items: center;

    gap: 0.75rem;

    margin-bottom: 1.25rem;
}


.trademark-header input {
    flex: 1;
}


.trademark-header h3 {
    flex: 1;

    margin: 0;
}


.trait-section {
    margin-top: 1.25rem;
}


.trait-header {
    display: flex;

    align-items: center;
    justify-content: space-between;

    margin-bottom: 0.5rem;
}


.trait-header strong {
    color: var(--muted);

    font-size: 0.65rem;

    text-transform: uppercase;

    letter-spacing: 0.15em;
}


.trait-row {
    display: flex;

    align-items: center;

    gap: 0.5rem;

    margin-bottom: 0.4rem;
}


.trait-row input {
    flex: 1;
}


.trait-row span {
    flex: 1;

    padding: 0.35rem 0;

    color: var(--text);

    font-size: 0.8rem;
}


/* Small terminal buttons */

.small-button {
    padding: 0.35rem 0.6rem;

    font-size: 0.6rem;

    white-space: nowrap;
}


.small-button::before,
.small-button::after {
    display: none;
}


/* Delete X */

.delete-button {
    width: 28px;
    height: 28px;

    padding: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    border: 1px solid var(--border);

    color: var(--danger);

    font-size: 1rem;

    line-height: 1;
}


.delete-button::before,
.delete-button::after {
    display: none;
}


.delete-button:hover:not(:disabled) {
    border-color: var(--danger);

    background: rgba(224, 82, 82, 0.1);

    color: #ff7070;

    box-shadow:
        0 0 10px rgba(224, 82, 82, 0.15);
}
}
</style>
