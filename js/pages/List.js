import { fetchList, fetchEditors } from "../content.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";
import { roleIconMap } from "../util.js";
import { store } from "../main.js";

export default {
  components: { Spinner, LevelAuthors },
  template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors" :key="editor.name">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                
                                <!-- Tooltip added here via :title -->
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link" :title="editor.role">
                                    {{ editor.name }}
                                </a>
                                <p v-else :title="editor.role">
                                    {{ editor.name }}
                                </p>
                                
                            </li>
                        </ol>
                    </template>
                </div>
            </div>
        </main>
    `,
  data: () => ({
    list: [],
    editors: [],
    loading: true,
    selected: 0,
    errors: [],
    roleIconMap,
    store
  }),
  async mounted() {
    // Hide loading spinner
    this.list = await fetchList();
    this.editors = await fetchEditors();

    // Error handling
    if (!this.list) {
      this.errors = [
        "Failed to load list. Retry in a few minutes or notify list staff."
      ];
    } else {
      this.errors.push(
        ...this.list
          .filter(([_, err]) => err)
          .map(([_, err]) => {
            return `Failed to load level. (${err}.json)`;
          })
      );
      if (!this.editors) {
        this.errors.push("Failed to load list editors.");
      }
    }

    this.loading = false;
  }
};
