import Vuex from 'vuex'
import Vue from 'vue';
Vue.use(Vuex)
export function createStore() {
  return new Vuex.Store( {
    state: {
      goods: []
    },
    mutations: {
      setGoods (state, goods) {
        console.log('set goods')
        console.log(goods)
        state.goods = goods
      },
      addComment(state, item) {
        state.goods.push(item)
      }
    },
    actions: {
      fetchGoods (context) {
        return new Promise((resolve, reject) => {
          console.log('fetch goods')
          setTimeout(() => {
              let goods = [
                {
                  name: '苹果',
                  price: '$1',
                  des: '苹果是一种低热量食物'
                },
                {
                  name: '香蕉',
                  price: '$2',
                  des: '香蕉（学名：Musa nana Lour.）'
                },
                {
                  name: '凤梨',
                  price: '$3',
                  des: '凤梨（学名：Ananas comosus (Linn.) Merr.）'
                }
              ]
              resolve(goods);
            }, 1000);
        }).then((data) => {
          context.commit('setGoods', data);
        })
      }
    }
  })
}