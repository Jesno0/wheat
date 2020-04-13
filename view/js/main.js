import Vue from 'vue';
import VueRouter from 'vue-router';
import axios from 'axios';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Home from '../vue/Home.vue';

Vue.use(VueRouter);
Vue.use(ElementUI);
Vue.prototype.$ajax= axios;

new Vue({
    el: '#app',
    render: h => h(Home)
});