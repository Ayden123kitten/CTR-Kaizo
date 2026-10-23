import { store } from "../main.js";
import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";
import { fetchEditors } from "../content.js";

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
  components: { Spinner, LevelAuthors },
  template: `
	<main v-if="loading">
        <Spinner></Spinner>
	</main>
    <main v-else class="page-rules-credits">
		<div class="credits">
			<div class="errors" v-show="errors.length > 0">
				<p class="error" v-for="error of errors">{{ error }}</p>
			</div>
			<div v-if="editors" class="editors">
				<h3>Staff</h3>
				<ol class="editors-container">
					<li v-for="editor in editors">
						<div class="tooltip">
							<span class="tooltiptext">{{ roleMap[editor.role].tooltip }}</span>
							<img :src="\`/assets/\${roleMap[editor.role].icon}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
						</div>
						<a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
						<p v-else>{{ editor.name }}</p>
					</li>
				</ol>
			</div>
			<div class="special-thanks">
				<h3>Special Thanks</h3>
				<div class="special-thanks-container">
					<p class="type-label-lg">
						<a
							href="https://github.com/yell0wsuit/cuttherope-dx"
						>Cut the Rope: DX</a> — Modern browser version of the game
					</p>
					<p class="type-label-lg">
						<a
							href="https://github.com/TheShittyList/GDListTemplate"
						>GD Shitty List Template</a> — Original template of the website
					</p>
				</div>
			</div>
		</div>

		<div class="rules">
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
			Any form of cheesing the level (completing the level in a method that is not intended by the creator) are allowed, but may be reranked and all submissions obsolete if a verification more intentional to the level creator's vision is completed. As to how we determine whether a completion has less cheese is subjective.
			</p>
			<p>
			Paused and Pauseless completions are to be ranked separately in two different entries if both have been completed separately.
			</p>
		</div>
    </main>
    `,
  data: () => ({
	store,
	editors: [],
	loading: true,
	errors: [],
	roleMap,
  }),
  computed: {
  },
  async mounted() {
	this.editors = await fetchEditors();

	if (!this.editors) {
		this.errors.push("Failed to load staff.");
	}

	this.loading = false;
  },
  methods: {

  }
};
