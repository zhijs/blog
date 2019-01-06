<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Essential Links</h2>
    <router-link to="/foo" tag="div">
      <a>/foo</a>
    </router-link>
    <router-link to="/bar" tag="div">
      <a>/bar</a>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>