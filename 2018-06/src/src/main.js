import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router/router.js'
import { createStore } from './store/index.js'

/* 
*导出一个工厂函数，用于返回一个新的vue实例对象
*这是为了防止交叉请求状态污染
*/

export function createApp() {
    const router = createRouter();
    const store = createStore();
    const app = new Vue({
        router,
        store,
        render: h => h(App)
    });

    return { app, router };
}