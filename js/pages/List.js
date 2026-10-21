import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { playtestFormURL } from "../playtest.js";
import { fetchEditors, fetchList, fetchTags } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";
import Tag from "../components/Tag.js";

const roleMap = {
  owner: {
    icon: "crown",
    tooltip: "Owner"
  },
  admin: {
    icon: "user-gear",
    tooltip: "Admin"
  },
  moderator: {
    icon: "user-shield",
    tooltip: "Moderator"
  },
  developer: {
    icon: "code",
    tooltip: "Developer"
  }
};

export default {
  components: { Spinner, LevelAuthors, Tag },
  template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
                <div class="search">
                  <input class="search-bar" type="id" placeholder="Search & filter by tags.." @focus="searchBarFocus()" @blur="searchBarBlur()" @input="search"/>
                  <Transition name="slide">
                    <div class="tags" v-if="tags" v-show="showTags || selectedTags.length > 0" @mousedown.prevent>
                      <Tag v-for="tag in tags" :key="tag" :label="tag" :active="selectedTags.includes(tag)" :interactive="true" @toggle="toggleTag(tag)"></Tag>
                    </div>
                  </Transition>
                </div>
                <table class="list" v-if="list">
                    <tr v-for="{ level, err, rank } in filteredList" :key="rank">
                        <td class="rank">
                            <p v-if="rank + 1 <= 150" class="type-label-lg">#{{ rank + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level" :class="{ 'active': selected == rank, 'error': !level }">
                            <button @click="$router.push('/' + (level?.path ?? err))">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <ul class="stats" v-if="level.description">
                        <li>
                            <p class="type-label-lg" style="white-space: pre-wrap;">{{ level.description }}</p>
                        </li>
                    </ul>
                    <div class="tags" v-if="level.tags">
                      <Tag v-for="tag in level.tags" :key="tag" :label="tag" :active="true" :interactive="false"></Tag>
                    </div>
                    <iframe v-if="level.verification" class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <img v-if="level.image" class="image" :src="level.image" alt="Level image">
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1) }}</p>
                        </li>
                        <li v-if="level.download">
                            <div class="type-title-sm">Download</div>
                            <a :href="level.download" download class="suggestion_link type-label-lg">Download Link</a>
                        </li>
                        <li v-if="level.download">
                          <a class="suggestion_link play_button type-title-sm" @click="playtestFormURL(level.download)">Play</a>
                          <a class="suggestion_link type-label-lg" href="https://github.com/yell0wsuit/cuttherope-dx">Uses Cut the Rope DX</a>
                        </li>
                    </ul>
                    <h2>Records</h2>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>(ノಠ益ಠ)ノ彡┻━┻</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <div class="tooltip">
                                    <span class="tooltiptext">{{ roleMap[editor.role].tooltip }}</span>
                                    <img :src="\`/assets/\${roleMap[editor.role].icon}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                </div>
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                    <h3>Submission Requirements</h3>
                        <p>
                        Submissions must be done on video and uploaded to YouTube. Video must at least be 480p at 30fps. However, higher resolutions are preferred.
                        </p>
                        <p>
                        Have either source audio or clicks/taps in the video. Editing the audio without these will not count.
                        </p>
                        <p>
                        No forms of external software or tools are to be used during the verification. This also includes any practice or debug options that the mod itself may provide.
                        </p>
                        <p>
                        Any form of cheesing the level (that is, completing the level not intended from the creator) are allowed, but may be reranked and all submissions obsolete if a verification more intentional to the level creator's vision is completed. As to how we determine whether a completion has less cheese is subjective.
                        </p>
                        <p>
                        Paused and Pauseless completions are to be ranked separately in two different entries if both have been completed separately.
                        </p>
                </div>
            </div>
        </main>
    `,
  data: () => ({
    list: [],
    editors: [],
    tags: [],
    selectedTags: [],
    showTags: false,
    searchQuery: "",
    loading: true,
    errors: [],
    roleMap,
    store
  }),
  computed: {
    selected() {
      const id = this.$route.params.id;
      if (!id) return 0;

      if (/^\d+$/.test(id)) return Number(id) - 1;

      return this.list.findIndex(
        ([level, err]) => (level?.path ?? err).toLocaleLowerCase() === id.toLocaleLowerCase()
      );
    },
    level() {
      return this.list[this.selected]?.[0];
    },
    video() {
      if (!this.level.showcase) {
        return embed(this.level.verification);
      }

      return embed(
        this.toggledShowcase ? this.level.showcase : this.level.verification
      );
    },
    filteredList() {
      return this.list
        .map(([level, err], i) => ({ level, err, rank: i }))
        .filter(({ level, rank }) =>
          (!this.selectedTags.length || this.selectedTags.every(t => level?.tags?.includes(t))) &&
          (!this.searchQuery.length || level.name.toLocaleLowerCase().includes(this.searchQuery) ||
          (rank+1).toString() == this.searchQuery)
        );
    }
  },
  async mounted() {
    // Hide loading spinner
    this.list = await fetchList();
    this.editors = await fetchEditors();
    this.tags = await fetchTags();

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
  },
  methods: {
    embed,
    score,
    playtestFormURL,
    toggleTag(tag) {
      if (this.selectedTags.includes(tag)) {
        this.selectedTags = this.selectedTags.filter(t => t !== tag);
      } else {
        this.selectedTags.push(tag);
      }
    },
    searchBarFocus() {
      this.showTags = true;
    },
    searchBarBlur() {
      this.showTags = false;
    },
    search(e) {
      const query = e.target.value;
      this.searchQuery = query.trim().toLocaleLowerCase();
    }
  }
};
