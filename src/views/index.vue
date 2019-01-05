<template>
    <div class="index_content">
        <div class="search_wrapper"> 
            <div class="search_box" @click="$router.push('/doctor/doctorSearch')">
                <span style="opacity:0.7"><icon type="search" class="marginright10 relative top-1" style="color:#fff"></icon>搜索医生</span>
            </div>
            <!-- <span class="chart_link"><i class="index-msg inlineBlock"></i></span> -->
        </div>
        <div class="swipper_wrapper">
            <!-- <swiper auto loop dots-position="center" v-model="swipperIndex">
                <swiper-item :class="['swiper-item','index0',swipperIndex==0?'active':'']">
                    <img src="https://jxptwx.zwjk.com//hospital/3261/20160112/1452600637220.png"/>
                </swiper-item>
                <swiper-item :class="['swiper-item','index1',swipperIndex==1?'active':'']">
                    <img src="https://jxptwx.zwjk.com//hospital/3261/20160112/1452600723403.png"/>
                </swiper-item>
                <swiper-item :class="['swiper-item','index2',swipperIndex==2?'active':'']">
                    <img src="https://jxptwx.zwjk.com//hospital/3261/20160112/1452600578314.png"/>
                </swiper-item>
            </swiper> -->
            <swiper auto loop dots-position="center" v-model="swipperIndex" v-if="imgList.length>1">
                <swiper-item v-for="item in imgList" :key="item.id">
                    <img :src="item.content"/>
                </swiper-item>
            </swiper>
            <swiper auto loop dots-position="center" :show-dots="false" v-if="imgList.length==1">
                <swiper-item v-for="item in imgList" :key="item.id" class="onlyOneImg">
                    <img :src="item.content"/>
                </swiper-item>
            </swiper>
        </div>
        <div class="section_function" style="height:150px">
            <flexbox class="fun_box">
                <flexbox-item>
                    <div class="fun_item relative" @click="$router.push('/section/sectionList')">
                        <img class="fun_item_img" src="../assets/img/index_video.png" width="64" height:="65"/>
                        <img class="call_num" src="../assets/img/gua_num.png" width="30"/>
                        <p class="fun_item_dec">视频问诊</p>
                        <span class="index_divide"></span>
                    </div>
                </flexbox-item>
                <flexbox-item>
                    <div class="fun_item relative" @click="$router.push('/waitingRoom/waitingRoom')">
                        <img class="fun_item_img" src="../assets/img/index_hzj.png" width="64" height:="65"/>
                        <img class="call_num" src="../assets/img/call_num.png" width="30"/>
                        <p class="fun_item_dec">候诊间</p>
                    </div>
                </flexbox-item>
            </flexbox>
        </div>
        <group class="section_function">
            <div class="fun_wrap">
                <cell title="我的问诊" link="/order/orderRecorder">
                    <img class="block marginright10" slot="icon" width="24" src="../assets/img/index_wdwz.png">
                </cell>
                <!-- <cell title="处方订单记录" :link="ysWeb+'/order_list.html?'+this.userId+'&'+this.hospitalId">
                    <img class="block marginright10" slot="icon" width="26" src="../assets/img/index_ddcfjl.png">
                </cell> -->
                <cell title="处方订单记录" :link="ysWeb+'/#/personal/order_manage?token='+this.token">
                    <img class="block marginright10" slot="icon" width="26" src="../assets/img/index_ddcfjl.png">
                </cell>
                <cell title="就诊人管理" link="/visitor/selectVisitor?fromPage=index" >
                    <img class="block marginright10" slot="icon" width="24" src="../assets/img/index_jzrgl.png">
                </cell>
                <cell title="帮助中心" link="/helpCenter/helpIndex">
                    <img class="block marginright10" slot="icon" width="24" src="../assets/img/index_bzzx.png">
                </cell>
            </div>
        </group>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { Icon, Swiper, SwiperItem, Flexbox, FlexboxItem, Cell, Group,ToastPlugin,AlertPlugin,Loading, TransferDomDirective as TransferDom } from 'vux'
import {post,get,del,put,userCenterGet,ysWeb,domain} from '../request/config.js'
import Vue from 'vue'
Vue.use(ToastPlugin)
Vue.use(AlertPlugin)
export default {
    directives: {
        TransferDom
    },
  components: { Icon, Swiper, SwiperItem, Flexbox, FlexboxItem, Cell, Group,Loading},
  data () {
    return {
        swipperIndex:0,
        token:'',
        hospitalId:'',
        userId:'',
        ysWeb:'',
        domain:'',
        showLoading:false,
        imgList:[]
    }
  },
    methods:{

    },
    mounted(){
        let self=this
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});

        var href = window.location.href;

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
        //this.token="154074d297e9d00e1cff619d516240ad"
        //this.domain=domain
        console.log("token",this.token)
        console.log("domain",this.domain)

        // let txt={
        //     url:href,
        //     token:this.token,
        //     domain:this.domain
        // }
        // this.$vux.alert.show({
        //     title: 'url',
        //     content: JSON.stringify(txt)
        // })

        let hrefStr=window.location.href.split('?')[0]
        this.showLoading=true
        this.ysWeb=ysWeb
        sessionStorage.setItem('token',this.token)
        sessionStorage.setItem('domain',this.domain)
        sessionStorage.setItem('href',hrefStr)
        sessionStorage.removeItem('videoApplySure');
        sessionStorage.removeItem('description');
        sessionStorage.removeItem('picList');
        sessionStorage.removeItem('applyHistory');
        sessionStorage.removeItem('selectedHistory');
        sessionStorage.removeItem('consultPatient');
        sessionStorage.removeItem('schedule');
        sessionStorage.removeItem('selectVisitorFrom');
        post('/patient/getHospitalInfo.htm',{domain:this.domain},'query').then( res => {
            if(res.data.ret_code==0){
                sessionStorage.setItem('hospitalId',res.data.ret_data.hospital.hospitalId)
                sessionStorage.setItem('hospitalName',res.data.ret_data.hospital.name)
                this.hospitalId=res.data.ret_data.hospital.hospitalId
                let list=res.data.ret_data.slideShow
                for(let i=0;i<list.length;i++){
                    if(list[i].target==2){
                        this.imgList.push(list[i])
                    }
                }
                console.log("imgList",this.imgList)
            }else{
                console.log(res)
            }
            this.showLoading=false
            post('/patient/checkUserToken.htm',{
                token:self.token,
                domain:self.domain
            },'query').then(res=>{
                if(res.data.ret_code==0){
                    self.userId=res.data.ret_data.user_id
                }   
            }).catch(err=>{
                console.log('err',err);
            })       
            
        }).catch(err=>{
            this.showLoading=false
            console.log('err',err);
        })
            
    }
}
</script>
<style scoped lang="less">
    .index_content{
        padding-bottom:20px;
        // background:#f7f7f7;
        .search_wrapper{
            position:relative;
            background:#4185F3;
            overflow:hidden;
            .search_box{
                padding:5px 10px;
                padding-left:15px;
                margin:5px 15px 15px 15px;
                font-size: 14px;
                color: #FFFFFF;
                background: rgba(23,95,155,0.22);
                border-radius: 4px;
            } 
            .chart_link{
                position:absolute;
                width:24px;
                height:24px;
                right:15px;
                top:8px;
                color: #FFFFFF;
                .index-msg {
                    width: 24px;
                    height: 24px;
                    background: url('../assets/img/index_msg.png') center no-repeat;
                    background-size: contain;
                }
            }
        }
        .section_function{
            padding:12px 15px 0;
            overflow:hidden;
            .fun_box{
                padding:20px 0 ;
                background: #FFFFFF;
                border: 1px solid #FFFFFF;
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.04);
                border-radius: 4px;
            }
            .fun_item{
                text-align:center;
                font-size:0;
            }
            .fun_item_img{
                width:64px;
            }
            .call_num{
                position:absolute;
                top:5px;
                right:50%;
                margin-right:-40px;
            }
            .fun_item_dec{
                font-size: 18px;
                color: #333;
                letter-spacing: 0.26px;
                font-weight:bold;
            }
            .fun_wrap{
                line-height:40px;
                font-size:16px;
                background:#fff;
                border: 1px solid #FFFFFF;
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.04);
                border-radius: 4px;
            }
            .index_divide{
                display:inline-block;
                position:absolute;
                width:1px;
                height:62px;
                right:0px;
                top:50%;
                margin-top:-31px;
                box-shadow: inset 0 0 0 0 #E2E2E2;
                background:#E2E2E2;
            }
            .vux-label{
                color:#333;
            }
        }
    }
</style>
