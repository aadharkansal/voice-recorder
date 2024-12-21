import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../components/HomePage.vue';
import RecordingPage from '../components/RecordingPage.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/record', component: RecordingPage },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
