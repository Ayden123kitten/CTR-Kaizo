import List from "./pages/List.js";
import Leaderboard from "./pages/Leaderboard.js";
import RulesCredits from "./pages/RulesCredits.js";

export default [
  { path: "/:id?", component: List, meta: { tab: "list" } },
  { path: "/leaderboard", component: Leaderboard, meta: { tab: "leaderboard" } },
  { path: "/rules-credits", component: RulesCredits, meta: { tab: "rules" } }
];