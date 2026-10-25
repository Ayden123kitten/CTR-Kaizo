import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { playtestFormURL } from "../playtest.js";
import { fetchList, fetchTags } from "../content.js";

import LevelAuthors from "../components/List/LevelAuthors.js"
import Spinner from "../components/Spinner.js";
import Tag from "../components/Tag.js";

export default {
  components: { Spinner, Tag, LevelAuthors },
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
                    <ul class="description" v-if="level.description">
                        <p class="type-label-lg type-color-light" style="white-space: pre-wrap;">{{ level.description }}</p>
                    </ul>
                    <div class="tags" v-if="level.tags">
                      <Tag v-for="tag in level.tags" :key="tag" :label="tag" :active="true" :interactive="false"></Tag>
                    </div>
                    <div class="level-play">
                      <button class="button primary type-label-lg" @click="playtestFormURL(level.download)">
                        <img :src="\`/assets/play.svg\`">
                        Play in browser
                      </button>
                      <a class="button secondary type-label-lg" :href="level.download" download>
                        <img :src="\`/assets/download-green.svg\`">
                        Download
                      </a>
                    </div>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points when completed</div>
                            <p>{{ score(selected + 1) }}</p>
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
            <div class="level-preview">
              <div v-if="level" class="level-preview-content">
                <iframe v-if="level.verification" class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                <img v-if="level.image" class="image" :src="level.image" alt="Level image">
              </div>
            </div>
        </main>
    `,
  data: () => ({
    list: [],
    tags: [],
    selectedTags: [],
    showTags: false,
    searchQuery: "",
    loading: true,
    errors: [],
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
