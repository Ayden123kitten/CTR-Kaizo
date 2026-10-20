import List from "./pages/List.js";
import Leaderboard from "./pages/Leaderboard.js";

export default [
  { path: "/:rank(\\d+)?", component: List },
  { path: "/leaderboard", component: Leaderboard }
];
