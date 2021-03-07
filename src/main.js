import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import lang from 'element-ui/lib/locale/lang/en'
import locale from 'element-ui/lib/locale'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

locale.use(lang)

<<<<<<< HEAD
axios.defaults.baseURL = 'http://localhost:3000/api/'
=======
axios.defaults.baseURL = 'http://127.0.0.1:3000/api/'
>>>>>>> af80316ae2929344f73cfe210e261d4f858a6568

// get token, get permission for data
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
