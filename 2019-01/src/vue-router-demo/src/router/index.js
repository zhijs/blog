import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index'
import foo from '@/components/foo'
import bar from '@/components/bar'
Vue.use(Router)

const router =  new Router({
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
console.log('router-----')
console.log(router)
router.afterEach((to, from) => {
  console.log('afterEach to')
  console.log(to)
  console.log('-------------------')
  console.log('afterEach from')
  console.log(from)
})
export default router;
