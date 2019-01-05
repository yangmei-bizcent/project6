<template>
    <div class="page-container page-selecVisitor absolute top0 bottom0 width100 height100" style="padding-bottom:62px;">
        <div class="visitor-list-container height100 paddingbottom20 scrollY">
            <ul v-if="visitors.length > 0">
                <li v-for="(item, index) in visitors" :key="index" :class="index%2==0?'odd':'even'"  @click="selectVisitor(item)">
                    <flexbox orient="vertical" align="center" class="flexbox">
                        <flexbox-item>
                            <flexbox>
                                <flexbox-item :span="3" class="label color-666">姓名</flexbox-item>
                                <flexbox-item class="val color-333">{{ item.name }}<span class="divider">|</span><span v-if="item.sex==1">男</span><span v-else-if="item.sex==2">女</span><span v-else>未知</span><span class="divider">|</span>{{ item.age }}岁</flexbox-item>
                            </flexbox>
                        </flexbox-item>
                        <flexbox-item >
                            <flexbox>
                                <flexbox-item :span="3" class="label color-666">身份证号</flexbox-item>
                                <flexbox-item class="val color-333">{{getIDCardText(item.idCard) }}</flexbox-item>
                            </flexbox>
                        </flexbox-item>
                    </flexbox>
                </li>
            </ul>
            <div v-if="visitors.length == 0" class="have-no-visitor">
                <img src="../../assets/img/visitor_nodata.png" class="visitor-nodata" />
                <div class="nodata-text">还没有就诊人，快去添加～</div>
            </div>
        </div>
        <div class="absolute bottom0 left0 bgcolor-white width100">
            <div class="paddingX20 padding10X vux-1px-t">
                <x-button type="primary" class="btn-blue" @click.native="addVisitor"  ><x-icon type="ios-plus-empty" class="plus-white-icon" size="30"></x-icon>添加就诊人</x-button>
            </div>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>
<script>
import { Flexbox, FlexboxItem, XButton,Loading, TransferDomDirective as TransferDom } from 'vux'
import {post,get,del,put} from '../../request/config.js'
export default {
    data() {
        return {
            visitors: [],
            token:'',
            showLoading:false,
        }
    },
    directives: {
        TransferDom
    },
    components: {
        Flexbox,
        FlexboxItem,
        XButton,
        Loading
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        console.log('frompage',this.$route.query.fromPage)
        sessionStorage.setItem('selectVisitorFrom',this.$route.query.fromPage)
        this.token=sessionStorage.getItem('token');
        this.getVisitors();
        let params={};
        if(this.$route.query.fromPage=='index'){  //就诊人管理，退回到首页
            params={
                url:sessionStorage.getItem('href')+"?action=none"
            }
            rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
        }else if(this.$route.query.fromPage=='addPatient'){   //申请预约，退回到医生主页
            params={
                url:sessionStorage.getItem('href')+"videoInterrogation/addPatient?scheduleId="+JSON.parse(sessionStorage.getItem("schedule")).scheduleId
            }
            rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
        }
    },
    methods:{
        getVisitors(){
            this.showLoading=true
            post('/patient/getPatientByUserId.htm',{token:this.token},'query').then(res=>{
                if(res.data.ret_code==0){
                    this.visitors=res.data.ret_data;
                    console.log("visitors",this.visitors)
                }else{
                    console.log("ret_info",res.data.ret_info)
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log('err',err);
            })
        },
        selectVisitor(item){
            sessionStorage.removeItem('applyHistory');
            sessionStorage.removeItem('selectedHistory')
            sessionStorage.removeItem('isChangeHistory')
            console.log('item',item);
            post('/patient/getDetailById.htm',{token:this.token,patientId:item.id},'query').then(res=>{
                console.log('res',res)
                if(res.data.ret_code==0){
                    let visitorDetail=res.data.ret_data;
                    console.log("visitorDetail",visitorDetail)
                    sessionStorage.setItem('consultPatient',JSON.stringify(visitorDetail));
                    if(!sessionStorage.getItem('schedule')){
                        sessionStorage.setItem('selectedPatientId',item.id);
                        this.$router.push({path:'/visitor/editVisitor?token='+sessionStorage.getItem('token')+'&patientId='+item.id})
                    } 
                    else{
                        console.log(sessionStorage.getItem("schedule"),'1111')
                        this.$router.push({path:'/videoInterrogation/addPatient?token='+sessionStorage.getItem('token'),query:{patientId:item.id,scheduleId:JSON.parse(sessionStorage.getItem("schedule")).scheduleId}})   //返回上一页
                    }
                        
                    /* if(this.$route.query.fromPage=='addPatient'){
                        this.$router.push({path:'/videoInterrogation/addPatient',query:{consultPatient:visitorDetail}})   //返回上一页
                    } */
                }else{
                    console.log("ret_info",res.data.ret_info)
                }
            }).catch(err=>{
                console.log('err',err)
            })
        },
        addVisitor(){
            if(this.visitors.length>=20){
                this.$vux.toast.show({
                    text: "就诊人数量已达上限",
                    type: 'text',
                })
                return;
            }
            sessionStorage.removeItem('selectedHistory');
            sessionStorage.removeItem('addVisitorName');
            sessionStorage.removeItem('addVisitorAge');
            sessionStorage.removeItem('addVisitorPhone');
            sessionStorage.removeItem('addVisitorIdCard');
            sessionStorage.removeItem('addVisitorVisitCard');
           this.$router.push({path:'/visitor/addVisitor?token='+sessionStorage.getItem('token')});
        },
        getIDCardText(val){
            if(val){
                let prefix=val.substring(0,4)
                let suffix=val.slice(val.length-4)
                let stars="**********"
                return prefix+stars+suffix
            }          
        },
    }
}
</script>
<style scoped lang="less">
    .page-container {
        .plus-white-icon {
            position: relative;
            top: 8px;
            fill: #fff;
        }
        &.page-selecVisitor {
            font-size: 16px;
            color: #333;
            .have-no-visitor {
                padding-top: 25%;
                text-align: center;
                .visitor-nodata {
                    width: 42%;
                }
                .nodata-text {
                    font-size: 17px;
                    color: #6c7d8f;
                    margin-top: 28px;
                }
            }
        }
    }
    .visitor-list-container {
        li {
            line-height:0;
            padding-left: 10px;
            background-color: #fff;
            box-shadow: 0 2px 6px 0 rgba(0,0,0,0.04);
            margin-top: 12px;
            >.vux-flexbox{
                >.vux-flexbox-item{
                    line-height:25px;
                    overflow:hidden;
                }
            }
            .flexbox {
                padding: 14px 0;
                .divider {
                    color: #e2e2e2;
                    margin: 0 10px;
                }
            }
            &.odd {
                border-left: 4px solid #4185f3;
            }
            &.even {
                border-left: 4px solid #29bfa5;
            }
        }
    }
</style>

