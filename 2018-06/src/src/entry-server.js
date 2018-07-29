import { createApp } from './main.js';

export default context => {
  return new Promise((resolve, reject) => {
    const { app } = createApp();
    app.$store.dispatch('fetchGoods')
      .then(()=> {
         // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML。
        context.state = app.$store.state
        resolve(app)
      })
  });
}