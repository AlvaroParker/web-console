import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Terminal from './components/Terminal.vue'
import Containers from './components/Containers.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'

const routes = [
  { path: '/terminal', component: Terminal},
  { path: '/', component: Containers},
  {path: '/login', component: Login}
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})


createApp(App).use(router).mount('#app')
