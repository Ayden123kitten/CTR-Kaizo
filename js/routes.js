import List from "./pages/List.js";
import Leaderboard from "./pages/Leaderboard.js";
import RulesCredits from "./pages/RulesCredits.js";

export default [
  { path: "/", component: List },
  { path: "/leaderboard", component: Leaderboard },
  { path: "/rules-credits", component: RulesCredits }
];
