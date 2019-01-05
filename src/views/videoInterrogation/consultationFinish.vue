<template>
    <div class="finish_content">
        <div class="relative bgcolor-white" style="padding:30px 145px 40px 20px">
            <img src="../../assets/img/consultationFinish.png" class="absolute right20 top30" width="124"/>
            <p class="color-666 fontsize0 lineheight20">医生正在根据您描述的情况做出诊断……</p>
            <p class="color-666 fontsize0 lineheight20 margintop20">诊断结束后，您可以在我的记录中查找诊断结果。</p>
        </div>
        <div class="width100 paddingX20 padding20X">
            <x-button type="primary" :disabled="disabled">确定</x-button>
        </div>
        <p class="width100 fixed bottom10 left0 color-999 fontsize-2 textAlignCenter">客服电话：0571-88851766</p>
    </div>
</template>

<script>
import { XButton} from 'vux'
export default {
  components: { XButton},
  data () {
    return {
        disabled:true,
    }
  },
    methods:{
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
    },
}
</script>
