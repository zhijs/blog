import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index'
import foo from '@/components/foo'
import bar from '@/components/bar'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/foo',
      name: 'foo',
      component: foo
    },
    {
      path: '/bar',
      name: 'bar',
      component: bar
    }
  ]
})
