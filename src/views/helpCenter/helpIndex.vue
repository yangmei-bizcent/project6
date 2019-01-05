<template>
    <div class="section_content">
        <group class="section_function">
            <div class="fun_wrap vux-1px-b" style="line-height:40px" v-for="(item,index) in helperList" :key="index">
                <cell :title="item.typeName" :link='item.link' is-link>
                    <img class="block marginright10" slot="icon" width="24" :src="item.src">
                </cell>
            </div>
        </group>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { Group, Cell,Loading,TransferDomDirective as TransferDom} from 'vux'
import {post,get,del,put} from '../../request/config.js'
import fwtk from '../../assets/img/help_fwtk.png'
import syzn from '../../assets/img/help_syzn.png'
import yygh from '../../assets/img/help_yygh.png'
import jzxg from '../../assets/img/help_jzxg.png'
import zhxg from '../../assets/img/help_zhxg.png'
import qtwt from '../../assets/img/help_qtwt.png'
export default {
    directives: {
        TransferDom
    },
    components: { Group, Cell,Loading},
    data () {
        return {
         helperList:[],
         showLoading:false
        }
    },
    methods:{
        getHelperCenter(){
            this.showLoading=true
            post('/patient/getHelpCenter.htm',{hospitalId:sessionStorage.getItem("hospitalId"),typeId:'' },'query').then(res=>{
                if(res.data.ret_code==0){
                    let data=JSON.parse(res.data.ret_data);
                    this.helperList=data.resourceType;
                    this.helperList.forEach( ele => {
                        if(ele.typeName == '服务条款'){
                            ele.src=fwtk;
                            ele.link="../helpCenter/helpService?id="+ele.id;
                        }
                        if(ele.typeName == '使用指南'){
                            ele.src=syzn;
                            ele.link="../helpCenter/helpService?id="+ele.id;
                        }
                        if(ele.typeName == '预约挂号问题'){
                            ele.src=yygh;
                            ele.link="../helpCenter/helpService?id="+ele.id;
                        }
                        if(ele.typeName == '就诊相关问题'){
                            ele.src=jzxg;
                            ele.link="../helpCenter/helpService?id="+ele.id;
                        }
                        if(ele.typeName == '账号相关问题'){
                            ele.src=zhxg;
                            ele.link="../helpCenter/helpService?id="+ele.id;
                        }
                        if(ele.typeName == '其他问题'){
                            ele.src=qtwt;
                            ele.link="../helpCenter/helpService?id="+ele.id;
                        }
                    })
                    console.log(this.helperList)
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log(err,'err')
            });
        }
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});

        let params={
            url:sessionStorage.getItem('href')+"?action=none"
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
        this.getHelperCenter();
    },
}
</script>
