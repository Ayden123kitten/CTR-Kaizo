import { capitalize } from "../util.js";

export default {
    props: {
        label: String,
        active: Boolean,
        interactive: Boolean
    },
    emits: ["toggle"],
    template: `
        <button 
            class="tag"
            :class="{ active }"
            :class="{ interactive }"
            :aria-pressed="active"
            :disabled="interactive === false"
            @click="$emit('toggle')"
        >
            {{ capitalize(label) }}
        </button>
    `,
    methods: {
        capitalize
    }
};