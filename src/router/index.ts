import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import FavoritesView from '../views/FavoritesView.vue';
import UserRepositoryView from '../views/UserRepositoryView.vue';
import RepositoryCommitsView from '../views/RepositoryCommitsView.vue';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/users/:username',
      name: 'user-repositories',
      component: UserRepositoryView,
      props: true,
    },
    {
      path: '/users/:username/:repo',
      name: 'repository-commits',
      component: RepositoryCommitsView,
      props: true,
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
    }
  ],
});

export default router;