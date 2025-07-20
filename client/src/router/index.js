import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Homeview.vue'),
    },
    {
      path: '/homeview-logged-in',
      name: 'HomeviewLoggedIn',
      component: () => import('../views/Homeview_loggedIn.vue'),
    },
    {
      path: '/quizview',
      name: 'Quizview',
      component: () => import('../views/Quizview.vue'),
    },
    {
      path: '/moviedetail/:id',
      name: 'MovieDetail',
      props: true,
      component: () => import('../views/MovieDetailview.vue'),
    },
    {
      path: '/seriedetail/:id',
      name: 'SerieDetail',
      props: true,
      component: () => import('../views/SerieDetailview.vue'),
    },
    {
      path: '/result',
      name: 'Result',
      component: () => import('../views/Resultview.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Loginview.vue'),
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/Registerview.vue'),
    },
    {
      path: '/account',
      name: 'Account',
      component: () => import('../views/Accountview.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

export default router;
