<template>
    <div>
        <!-- <span>电子处方测试内容1</span> -->
        <img class="img-responsive" :src="url" alt="">
        <!-- <x-img :src="url" class="ximg-demo"></x-img> -->
        <!-- <x-img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1529850226306&di=c5e5c29c93ef4f48371625e216d645cb&imgtype=0&src=http%3A%2F%2Fh.hiphotos.baidu.com%2Fimage%2Fpic%2Fitem%2Fc995d143ad4bd1137c1d50b556afa40f4afb0560.jpg" ></x-img> -->
        <!-- <span>电子处方测试内容2</span> -->
    </div>
</template>
<script>
import { XImg,AlertPlugin } from 'vux'
import Vue from 'vue'
Vue.use(AlertPlugin)
export default {
      components: { XImg,AlertPlugin },
    data(){
        return{
            url:''
        }
    },
    mounted(){     
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});   
        this.url=this.$route.query.url
    }
}
</script>

<style scoped>
.img-responsive {
  display: inline-block;
  height: auto;
  max-width: 100%;
}
.ximg-demo {
  width: 100%;
  height: auto;
}
</style>


