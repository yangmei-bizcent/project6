<template>
    <div class="entrance_content">
        <div class="entrance_item">
            <a @click="goToMZ">
                <img src="../assets/img/rk_spwz.jpg" width="100%"  onclick="return false"/>
                <div class="entrance_main">
                    <p class="entrance_title">视频问诊</p>
                    <p class="entrance_intro">与医生面对面交流病情 实时沟通更便捷</p>
                    <p class="entrance_btn_wrap"><span class="entrance_btn">立即进入</span></p>
                </div>
            </a>
        </div>
        <div class="entrance_item">
            <a @click="goToTW">
                <img src="../assets/img/rk_twzx.jpg" width="100%"  onclick="return false"/>
                <div class="entrance_main">
                    <p class="entrance_title">图文咨询</p>
                    <p class="entrance_intro">发送病情资料给医生 诊断更有科学依据</p>
                    <p class="entrance_btn_wrap"><span class="entrance_btn">立即进入</span></p>
                </div>
            </a>
        </div>
        <img class="absolute bottom0 left0 zindex1" src="../assets/img/entrance_bg.png" width="100%"  onclick="return false"/>
    </div>
</template>

<script>

import { ToastPlugin, AlertPlugin,Loading, TransferDomDirective as TransferDom  } from 'vux'
import {post,get,del,put,userCenterGet,domain,twWeb} from '../request/config.js'
import Vue from 'vue'
Vue.use(ToastPlugin)
Vue.use(AlertPlugin)
export default {
    directives: {
        TransferDom
    },
    components: {Loading },
    data () {
        return {
            swipperIndex:0,
            token:'',
            hospitalId:'',
            userId:'',
            domain:'',
            twWeb:'',
            showLoading:false
        }
    },
    methods:{
        goToMZ(){
            this.$router.push({ path: "/" ,query:{action:'none'}});
        },
        goToTW(){
            window.location.href=this.twWeb+'/user#/home?token='+this.token
        },
    },
    mounted(){
        console.log(window.location.href);

        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        this.showLoading=true
        this.twWeb=twWeb
        
        //domain动态获取时使用
        if(this.$route.query.domain!=undefined&&this.$route.query.domain!='undefined'&&this.$route.query.domain!=''){
            this.token=this.$route.query.token
            this.domain=this.$route.query.domain
        }else{
            if(sessionStorage.getItem('domain')!=undefined&&sessionStorage.getItem('domain')!='undefined'&&sessionStorage.getItem('domain')!=''){
                this.token=sessionStorage.getItem('token')
                this.domain=sessionStorage.getItem('domain')
            }else{
                this.token=window.location.href.split('?')[1]
                this.domain=window.location.hostname
            }
        }
        //domain固定时使用，即domain无法从window.location.hostname获取
        //this.domain=domain
        //var href = window.location.href;
        // let txt={
        //     url:href,
        //     token:this.token,
        //     domain:this.domain
        // }
        // this.$vux.alert.show({
        //     title: 'url',
        //     content: JSON.stringify(txt)
        // })
        //this.token = href.split('?')[1]
        //this.domain=domain
        //this.token="332e315a087357a9567afe31dd3e0a4b"
        //-----------------------------
        console.log("token",this.token)
        console.log("domain",this.domain)
        sessionStorage.setItem('token',this.token)
        sessionStorage.setItem('domain',this.domain)
        // post('/patient/checkUserToken.htm',{
        //     token:this.token,
        //     domain:this.domain
        // },'query').then(res=>{
        //     if(res.data.ret_code==0){
        //         console.log('checkUserToken',res.data.ret_data)
        //         this.userId=res.data.ret_data.user_id           
        //     }
        //     this.showLoading=false    
        // }).catch(err=>{
        //     this.showLoading=false
        //     console.log('err',err);
        // })         
    }
}
</script>
<style lang="less" scoped>
    .entrance_content{
        width:100%;
        height:100%;
        padding:0 20px;
        overflow:hidden;
        background:#fff;
        .entrance_item{
            margin-top:20px;
            position:relative;
            z-index:10;
        }
        .entrance_title{
            line-height:20px;
            font-size: 20px;
            color: #FFFFFF;
            text-shadow: 0 1px 8px rgba(51,90,205,0.70);
        }
        .entrance_main{
            width:54%;
            height:100%;
            position:absolute;
            top:0;
            left:0;
            padding-left:30px;
            padding-top:6%;
            font-size:0;
            color:white;
        }
        .entrance_intro{
            padding-top:5%;
            line-height:18px;
            font-size: 12px;
            color: #FFFFFF;
            opacity:0.75;
        }
        .entrance_btn{
            padding:3px 8px;
            font-size:12px;
            border:1px solid #fff;
            border-radius:2px;
            opacity: 0.7;
        }
        .entrance_btn_wrap{
            padding-top:16%;
        }
    }
</style>
