<template>
    <div class="history_content width100 height100 absolute top0 bottom0" style="padding-bottom:62px;">
        <div class="height100 paddingbottom10 scrollY">
            <div class="bgcolor-white paddingleft15 margintop10">
                <p class="fontsize1 color-333 padding15X vux-1px-b">请选择取消原因</p>
                <div class="paddingtop15">
                    <checker v-model="disease" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                        <checker-item value="等待时间长">等待时间长</checker-item>
                        <checker-item value="视频无法连接">视频无法连接</checker-item>
                        <checker-item value="视频质量差">视频质量差</checker-item>
                        <checker-item value="选错医生">选错医生</checker-item>
                        <checker-item value="临时有事">临时有事</checker-item>
                        <checker-item value="约错时间">约错时间</checker-item>
                    </checker>
                </div>
            </div>
            <div class="bgcolor-white margintop10">
                <group class="over">
                    <x-textarea v-model.trim="value" placeholder="取消说明" :max="200" :rows="6"></x-textarea>
                </group>
            </div>
        </div>
        <P class="fontsize0 color-999 paddingleft10 lineheight35">注：医院将在提交日起3个工作日内处理您的退款</P>
        <div class="width100 paddingX20 padding10X absolute bottom0 left0 bgcolor-white">
            <x-button type="primary" @click.native="cancelOrder" :disabled='!disease||disease.length==0'>确定</x-button>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { Checker, CheckerItem, Group, XTextarea, XButton,Loading, TransferDomDirective as TransferDom} from 'vux'
import {post,get,del,put} from '../../request/config.js'
export default {
    directives: {
        TransferDom
    },
  components: { Checker, CheckerItem, Group, XTextarea, XButton,Loading},
  data () {
    return {
        disease:[],
        value:'',
        consult_id:decodeURIComponent(this.$route.query.consult_id),
        showLoading:false
    }
  },
  watch:{
      value:function(newvalue,oldvalue){
        var regStr = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
        if(regStr.test(newvalue)){
            this.value=newvalue.replace(regStr,"");
        }
      }
  },
    methods:{
        cancelOrder(){
            let strDisease='';
            if(this.disease.length>0){
                for(let i =0;i<this.disease.length;i++){
                    strDisease+=this.disease[i]+','
                }
                strDisease=strDisease.substring(0,strDisease.length-1);
            }else{
                this.$vux.toast.show({
                    text: '请选择取消原因',
                    type:'text',
                })
                return;
            }
            this.showLoading=true
            let requestData={
                consult_id:this.consult_id,
                reasonCancel:strDisease,
                explainCancel:this.value
            }
            post('/registered/cancelById.htm',requestData,'query').then(res=>{
                console.log('res',res);
                if(res.data.ret_code==0){
                    this.$vux.toast.show({
                        text: '取消成功',
                        type:'text',
                    })
                    //this.$router.push('/waitingRoom/waitingRoom?token='+sessionStorage.getItem('token'));
                    //this.$router.replace('/waitingRoom/waitingRoom?token='+sessionStorage.getItem('token'));
                    //this.$router.replace('/');
                    //history.go(-1)
                    this.$router.push('/order/orderDetail?consult_id='+encodeURIComponent(this.consult_id))
                }else{
                    this.$vux.toast.show({
                        text: res.data.ret_info,
                        type:'text',
                    })
                    console.log('info',res.data.ret_info)
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log('err',err);
            })
        }
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        console.log('取消订单',this.consult_id)
    },
}
</script>
<style scoped lang="less">
    .section_content{
        font-size:0;
    }
</style>
