import routes from './routes.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));
    },
});

const app = Vue.createApp({
    data: () => ({ store }),
});
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

// Function to update the active tab underline
function updateActiveTab(path) {
    const tabs = document.querySelectorAll('.nav__tab');
    tabs.forEach(tab => {
        const href = tab.getAttribute('href');
        if (href) {
            // Extract the path from the href (removes the '#' and any query parameters)
            const tabPath = href.replace('#', '').split('?')[0];

            // If the tab's path matches the current route, add the active class
            if (tabPath === path) {
                tab.classList.add('is-active');
            } else {
                tab.classList.remove('is-active');
            }
        }
    });
}

// Run the function every time the route changes
router.afterEach((to) => {
    updateActiveTab(to.path);
});

app.use(router);
app.mount('#app');

// Run once on the very first page load so the starting tab is underlined
updateActiveTab(router.currentRoute.value.path);
