<template>
    <div>
      <p>商品名-{{good.name}}</p>
       <p>价格-{{good.price}}</p>
    </div>
</template>
<script>
  export default {
    props:{
      good: Object
    },
     beforeCreate () {
      console.log('good component beforeCreate-------');
    },
    beforeMount () {
      console.log('good component beforeMount-------');
    },
    created () {
      console.log('good component  created-------');
    },
    mounted () {
      console.log('good component  created-------');
    }
  };
</script>