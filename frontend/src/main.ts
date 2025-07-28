import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initMobileScrollFixes } from './utils/mobileScrollFix'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Apply mobile scrolling fixes after DOM is loaded
document.addEventListener('DOMContentLoaded', initMobileScrollFixes)

app.mount('#app')
