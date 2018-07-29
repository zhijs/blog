<template>
    <div id="app">
      <ul>
         <li
           v-for="good in goods"
           :key="good.name"
         >
           <good :good="good"></good>
         </li>
          <div>
             <p>添加商品</p>
             <div>
                <span>名称</span>
                <input type="text" v-model="goodName"/>
             </div>
             <div>
                <span>价格</span>
                <input type="number" v-model="goodPrice"/>
             </div>
             <div>
                <span>描述</span>
                <input type="text" v-model="goodDes"/>
             </div>
              <button @click="addGood">添加</button>
          </div>
      </ul>   
    </div>
</template>
<script>
  import good from './components/good.vue'
  export default {
    components: {
      good
    },
    data () { 
      return {
        goodName: '',
        goodPrice: '',
        goodDes: '',
        // goods: [
        //   {
        //     name: '草莓',
        //     price: '$1',
        //     des: '草莓（学名：Fragaria × ananassa Duch.），多年生草本植物。'
        //   },
        //   {
        //     name: '西瓜',
        //     price: '$9',
        //     des: '西瓜（学名：Citrullus lanatus (Thunb.) Matsum. et Nakai）'
        //   }      
        // ]
        goods: []
      }
    },
    beforeCreate () {
      console.log('beforeCreate-------');
    },
    created () {
      this.goods = this.$store.state.goods;
    },
     beforeMount() {
      // console.log('beforeMount-------');
      // let item = {
      //   name: '桃子',
      //   price: '$0.5',
      //   des: '桃花（学名：Amygdalus persica L.）：蔷薇科、桃属植物。落叶小乔木；叶为窄椭圆形至披针形，长15厘米，宽4厘米，先端成长而细的尖端，边缘有细齿，暗绿色有光泽，叶基具有蜜腺；树皮暗灰色，随年龄增长出现裂缝；花单生，从淡至深粉红或红色，有时为白色，有短柄，直径4厘米，早春开花'
      // }
      // this.goods.push(item);
    },
    mounted () {
      // console.log('created-------');
      //  let item = {
      //   name: '荔枝',
      //   price: '$1.8',
      //   des: '荔枝（学名：Litchi chinensis Sonn.）无患子科，荔枝属常绿乔木，高约10米。果皮有鳞斑状突起，鲜红，紫红。成熟时至鲜红色；种子全部被肉质假种皮包裹。花期春季，果期夏季。果肉产鲜时半透明凝脂状，味香美，但不耐储藏。'
      // }
      // this.goods.push(item);
    },
    methods: {
      addGood () {
        let good = {
          name: this.goodName,
          price: `${this.goodPrice}`,
          des: this.goodDes
        }
        this.goods.push(good);
      }
    }
    // computed: {
    //   goods () {
    //     return this.$store.state.goods;
    //   }
    // }
  };
</script>
<style>
  span {
    display: inline-block;
    width: 50px;
  }
  input {
    margin-left: 10px;
  }
</style>