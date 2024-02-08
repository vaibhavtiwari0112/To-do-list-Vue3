// main.js

import { createApp } from 'vue';
import App from './App.vue';
import axios from 'axios';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.css';
import 'vue-toast-notification/dist/theme-default.css'
import VueToast from 'vue-toast-notification'

const app = createApp(App);
app.use(VueToast);
// Make Axios globally available
app.config.globalProperties.$axios = axios;

// Alternatively, you can use app.provide to make it available throughout the app
app.provide('$axios', axios);

app.use(Vuetify);

app.mount('#app');