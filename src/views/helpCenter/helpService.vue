<template>
    <div class="page-container bgcolor-white" style="height: 100%;overflow:scroll">  
        <dl class="paddingX20 padding20X" v-for="(item,index) in ruleList" :key="index">
            <dt class="color-333 bold">{{item.name}}</dt>
            <dd class="color-666 lineheight25 paddingtop5 paddingbottom15" v-html="item.content"></dd>
        </dl>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { Loading,TransferDomDirective as TransferDom} from 'vux'
import {post,get,del,put} from '../../request/config.js'
export default {
    directives: {
        TransferDom
    },
    components: {Loading},
    data () {
        return {
            ruleList:[],
            showLoading:false
        }
    },
    methods:{
        getService(){
            this.showLoading=true
            post('/patient/getHelpCenter.htm',{hospitalId:sessionStorage.getItem('hospitalId'),typeId:this.$route.query.id},'query').then(res=>{
                if(res.data.ret_code==0){
                    let data=JSON.parse(res.data.ret_data);
                    this.ruleList=data.resource;
                }
            this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log(err,'err')
            })
        }
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        this.getService();
    },
}
</script>
