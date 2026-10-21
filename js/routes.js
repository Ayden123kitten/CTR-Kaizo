import List from "./pages/List.js";
import Leaderboard from "./pages/Leaderboard.js";

export default [
  { path: "/:id?", component: List, meta: { tab: "/" } },
  { path: "/leaderboard", component: Leaderboard }
];
