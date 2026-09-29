<template>
    <section class="roller-panel">

        <div class="controls">

            <div class="pool-control">
                <div class="pool-label">
                    Action Dice
                </div>

                <div class="counter">
                    <button @click="plusDice++">
                        +
                    </button>

                    <span>{{ plusDice }}</span>

                    <button
                        @click="plusDice--"
                        :disabled="plusDice <= 0"
                    >
                        -
                    </button>
                </div>
            </div>

            <button
                class="roll-button"
                @click="rollAll"
            >
                Roll Check
            </button>

            <div class="pool-control">
                <div class="pool-label danger">
                    Danger Dice
                </div>

                <div class="counter">
                    <button @click="minusDice++">
                        +
                    </button>

                    <span>{{ minusDice }}</span>

                    <button
                        @click="minusDice--"
                        :disabled="minusDice <= 0"
                    >
                        -
                    </button>
                </div>
            </div>

        </div>

        <div class="dice-pools">

            <div class="dice-column">
                <div
                    v-for="(die, index) in positiveRolls"
                    :key="'p'+index"
                    class="die positive"
                    :class="{ canceled: die.canceled }"
                >
                    <div
                        v-for="position in getPips(die.value)"
                        :key="position"
                        class="pip"
                        :class="position"
                    />
                </div>

            </div>

            <div class="dice-column">
                <div
                    v-for="(die, index) in negativeRolls"
                    :key="'n'+index"
                    class="die negative"
                    :class="{ canceled: die.canceled }"
                >
                    <div
                        v-for="position in getPips(die.value)"
                        :key="position"
                        class="pip"
                        :class="position"
                    />
                </div>

            </div>

        </div>

        <div
            v-if="positiveRolls.length"
            class="result-panel"
        >
            <div class="result-label">
                Highest Remaining Die
            </div>

            <div
                class="result-value"
                :class="resultClass"
            >
                {{ highestRemainingPositive }}
            </div>
        </div>

    </section>
</template>

<script setup>
import { ref, computed } from "vue";

const plusDice = ref(1);
const minusDice = ref(0);

const positiveRolls = ref([]);
const negativeRolls = ref([]);

const highestRemainingPositive = computed(() => {
    return Math.max(
        0,
        ...positiveRolls.value
            .filter(die => !die.canceled)
            .map(die => die.value)
    );
});

const resultClass = computed(() => {
    if (highestRemainingPositive.value <= 3) {
        return "failure";
    }

    if (highestRemainingPositive.value <= 5) {
        return "mixed";
    }

    return "success";
});

function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
}

function rollAll() {
    positiveRolls.value = Array.from(
        { length: plusDice.value },
        () => rollDie()
    );

    negativeRolls.value = Array.from(
        { length: minusDice.value },
        () => rollDie()
    );

    cancelMatches();
}

function cancelMatches() {
    const positives = [...positiveRolls.value];
    const negatives = [...negativeRolls.value];

    const canceledPos = [];
    const canceledNeg = [];

    positives.forEach((value, pIndex) => {
        const nIndex = negatives.findIndex(
            (n, idx) =>
                n === value &&
                !canceledNeg.includes(idx)
        );

        if (nIndex !== -1) {
            canceledPos.push(pIndex);
            canceledNeg.push(nIndex);
        }
    });

    positiveRolls.value = positiveRolls.value.map(
        (value, index) => ({
            value,
            canceled: canceledPos.includes(index)
        })
    );

    negativeRolls.value = negativeRolls.value.map(
        (value, index) => ({
            value,
            canceled: canceledNeg.includes(index)
        })
    );
}

function getPips(value) {
    return {
        1: [
            "center"
        ],

        2: [
            "top-left",
            "bottom-right"
        ],

        3: [
            "top-left",
            "center",
            "bottom-right"
        ],

        4: [
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right"
        ],

        5: [
            "top-left",
            "top-right",
            "center",
            "bottom-left",
            "bottom-right"
        ],

        6: [
            "top-left",
            "top-right",
            "middle-left",
            "middle-right",
            "bottom-left",
            "bottom-right"
        ]
    }[value];
}
</script>

<style scoped>
.roller-panel {
    --panel: #0c1114;
    --panel-light: #10171b;
    --border: #26343a;
    --muted: #718187;
    --cyan: #35e0d0;
    --cyan-dark: #123f3d;
    --danger: #e05252;

    padding: 2rem;
    background: var(--panel);
    border: 1px solid var(--border);
}

.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;

    margin-bottom: 2rem;
}

.pool-control {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.pool-label {
    color: var(--cyan);
    font-size: .75rem;
    text-transform: uppercase;
    letter-spacing: .15em;
}

.pool-label.danger {
    color: var(--danger);
}

.counter {
    display: flex;
    align-items: center;
    gap: .5rem;
}

.counter span {
    min-width: 2rem;
    text-align: center;
    font-size: 1.5rem;
}

button {
    border: 1px solid var(--border);
    background: var(--panel-light);
    color: var(--cyan);

    padding: .6rem 1rem;

    font-family: inherit;

    cursor: pointer;
}

button:hover:not(:disabled) {
    background: var(--cyan-dark);
}

button:disabled {
    opacity: .3;
}

.roll-button {
    font-weight: 700;
}

.dice-pools {
    display: grid;
    grid-template-columns: auto auto;
    justify-content: center;
    gap: min(8rem, 15vw);
}

.dice-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .75rem;
}

h2 {
    color: var(--cyan);
    font-size: .8rem;
    text-transform: uppercase;
    letter-spacing: .2em;
}

h2::before {
    content: "// ";
    color: var(--muted);
}

.die {
    position: relative;

    width: 80px;
    height: 80px;

    display: grid;

    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);

    background: #06090b;
}

.die.positive {
    border: 1px solid var(--cyan);
    color: var(--cyan);
}

.die.negative {
    border: 1px solid var(--danger);
    color: var(--danger);
}

.pip {
    width: 18px;
    height: 18px;

    border-radius: 50%;

    background: currentColor;

    align-self: center;
    justify-self: center;
}

.top-left {
    grid-row: 1;
    grid-column: 1;
    transform: translate(4px, 4px);
}

.top-right {
    grid-row: 1;
    grid-column: 3;
    transform: translate(-4px, 4px);
}

.middle-left {
    grid-row: 2;
    grid-column: 1;
    transform: translateX(4px);
}

.middle-right {
    grid-row: 2;
    grid-column: 3;
    transform: translateX(-4px);
}

.bottom-left {
    grid-row: 3;
    grid-column: 1;
    transform: translate(4px, -4px);
}

.bottom-right {
    grid-row: 3;
    grid-column: 3;
    transform: translate(-4px, -4px);
}

.center {
    grid-row: 2;
    grid-column: 2;
}

.die.canceled {
    opacity: .25;
}

.die.canceled::after {
    content: "";

    position: absolute;

    top: 50%;
    left: -10%;

    width: 120%;
    height: 2px;

    background: currentColor;

    transform: rotate(-45deg);
}

.result-panel {
    margin-top: 3rem;

    padding: 2rem;

    text-align: center;

    border: 1px solid var(--border);

    background: var(--panel-light);
}

.result-label {
    color: var(--muted);

    text-transform: uppercase;
    letter-spacing: .2em;

    font-size: .7rem;
}

.result-value {
    margin-top: .5rem;

    font-size: 4rem;
    font-weight: 700;
}

.success {
    color: var(--cyan);
    text-shadow: 0 0 20px rgba(53,224,208,.4);
}

.mixed {
    color: #e5a94a;
}

.failure {
    color: var(--danger);
}

@media (max-width: 700px) {
    .controls {
        flex-direction: column;
    }

    .roll-button {
        width: 100%;
    }

    .dice-pools {
        gap: 1rem;
    }

    .die {
        width: 72px;
        height: 72px;
    }
}
</style>
