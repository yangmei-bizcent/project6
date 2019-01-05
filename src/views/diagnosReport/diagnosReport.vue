<template>
    <div class="page-container page-diagnosReport height100 absolute top0 bottom0 width100" style="padding-bottom:65px;">
        <div class="height100 paddingbottom10 scrollY">

            <div class="report-panel">
                <div class="textAlignCenter marginbottom15">
                    <div class="fontsize3 color-333 bold">{{hospitalName}}</div>
                    <div class="fontsize3 color-666">诊断报告</div>
                </div>
                <div class="panel-tit fontsize3 color-111">
                    <span class="tit-tag"></span>诊断结果
                </div>
                <div class="panel-content fontsize1 color-666">
                    <span v-for="(item,index) in diagnosesInfo" :key="index">{{item.diagnose.indexOf('@mzzd@')>0?item.diagnose.replace(/@mzzd@/g,';'):item.diagnose}}</span>
                </div>
            </div>
            <div class="report-panel">
                <div class="panel-tit fontsize3 color-111">
                    <span class="tit-tag"></span>诊断意见
                </div>
                <div class="panel-content fontsize1 color-666">
                    <span v-for="(item,index) in diagnosesInfo" :key="index">{{item.dispositionSuggestions}}</span>
                </div>
            </div>
            <div class="report-panel paddingbottom8">
                <div class="panel-tit fontsize3 color-111">
                    <span class="tit-tag"></span>RP
                </div>
                <div class="panel-content fontsize1 color-666" v-if="medicine&&medicine.length>0">
                    <flexbox orient="vertical">
                        <flexbox-item class="fontsize1 border-bottom-dashed paddingbottom10" v-for="(item, index) in medicine" :key="index">
                            <flexbox orient="vertical">
                                <flexbox-item>
                                    <span v-if="item.prescriptiontype=='1'" class="medic-type-tag bg4c97ff">西药</span>
                                    <span v-else class="medic-type-tag bgFF864C">中药</span>
                                    <span class="color-333">{{ item.name }}</span>
                                    <span class="floatRight color-333">{{ item.amount }}{{ item.amountUnit }}</span>
                                </flexbox-item>
                                <flexbox-item class="color-999">
                                    {{ item.useDesc }}
                                    <p class="lineheight20px">用法用量：
                                        <span class="doc_name">{{item.timesState}}</span>
                                        <span class="fontsize0 color-999">|</span>
                                        <span class="color-999 fontsize0 paddingX3">1次{{item.dosage}}{{item.dosageUnit}}</span>
                                        <span class="fontsize0 color-999">|</span>
                                        <span class="color-999 fontsize0 paddingX3">{{item.day}}天</span>
                                        <span class="fontsize0 color-999">|</span>
                                        <span class="color-999 fontsize0 paddingX3">{{item.method}}</span>
                                    </p>
                                </flexbox-item>
                            </flexbox>
                        </flexbox-item>
                        <flexbox-item class="textAlignRight" v-if="medicalStatus!=-1">
                            <x-button mini type="primary" class="theme_ff7b35" @click.native="goToMedicalOrder" v-if="medicalStatus==1">查看购药订单</x-button>
                            <x-button mini type="primary" class="theme_ff7b35" @click.native="show = true" v-else>立即购买</x-button>

                        </flexbox-item>
                    </flexbox>
                </div>
                <div class="panel-content fontsize1 color-666" v-if="!medicine||medicine.length==0">
                    <span>无</span>
                </div>
            </div>
            <div class="report-panel">
                <div class="panel-tit fontsize3 color-111">
                    <span class="tit-tag"></span>检查项目
                </div>
                <div class="panel-content fontsize1 color-666" v-if="testReports.length!=0">
                    <table cellspacing="0" cellpadding="0">
                        <tr v-for="(item, index) in testReports" :key="index" >
                            <td>{{ item.project }}</td>
                            <td align="right">{{ item.part }}</td>
                        </tr>
                    </table>
                </div>
                <div v-if="testReports.length==0">
                    <span>无</span>
                </div>
            </div>
            <div class="report-panel">
                <div class="panel-tit fontsize3 color-111">
                    <span class="tit-tag"></span>检验项目
                </div>
                <div class="panel-content fontsize1 color-666" v-if="examinationReports.length!=0">
                    <table cellspacing="0" cellpadding="0">
                        <tr v-for="(item, index) in examinationReports" :key="index" >
                            <td>{{ item.name }}</td>
                            <td align="right">{{ item.sampleType }}</td>
                        </tr>
                    </table>
                </div>
                <div v-if="examinationReports.length==0">
                    <span>无</span>
                </div>
            </div>
            <div class="report-panel position-relative">
                <span v-if="hideLink" class="collsp-link fontsize0 absolute right14 bottom42" @click="hideVisitorInfo">
                    收起<x-icon type="ios-arrow-up" class="collp-icon" size="15"></x-icon>
                </span>
                <div class="panel-tit fontsize3 color-111">
                    <span class="tit-tag"></span>问诊信息
                    <span v-if="showLink" class="collsp-link fontsize0 floatRight margintop5" @click="showVisitorInfo">
                        展开<x-icon type="ios-arrow-down" class="collp-icon" size="15"></x-icon>
                    </span>
                </div>
                <transition name="slide">
                    <div v-show="visitorInfoShow" class="panel-content fontsize1 color-666">
                        <dl>
                            <dt>患者信息</dt>
                            <dd>
                                <table cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td>姓名</td>
                                        <td align="right">{{patientInfo.name}}</td>
                                    </tr>
                                    <tr>
                                        <td>性别</td>
                                        <td align="right">{{patientInfo.sex}}</td>
                                    </tr>
                                    <tr>
                                        <td>年龄</td>
                                        <td align="right">{{patientInfo.age}}岁</td>
                                    </tr>
                                    <tr>
                                        <td>手机号</td>
                                        <td align="right">{{patientInfo.phone}}</td>
                                    </tr>
                                    <tr>
                                        <td>身份证号</td> 
                                        <td align="right">{{getIDCardText(patientInfo.idCard)}}</td>
                                    </tr>
                                    <tr>
                                        <td>就诊卡号</td>
                                        <td align="right">{{patientInfo.treatmentCard?patientInfo.treatmentCard:'暂无就诊卡号'}}</td>
                                    </tr>
                                </table>
                            </dd>
                            <dt>主诉</dt>
                            <dd><span v-for="(item,index) in diagnosesInfo" :key="index">{{item.chiefComplaint?item.chiefComplaint:'无'}}</span></dd>
                            <dt>现病史</dt>
                            <dd><span v-for="(item,index) in diagnosesInfo" :key="index">{{item.illnessHistory?item.illnessHistory:'无'}}</span></dd>
                            <dt>既往史</dt>
                            <dd>
                                {{pastHistoryStr?pastHistoryStr:'无'}}
                                <!-- <span v-for="(item, index) in diseaseHistory" :key="index">{{ item }}{{index==diseaseHistory.length-1?'':'&nbsp;/&nbsp;'}}</span> -->
                            </dd>
                            <dt>过敏史</dt>
                            <dd>
                                {{allergicHistoryStr?allergicHistoryStr:'无'}}
                                <!-- <span v-for="(item, index) in allergyHistory" :key="index">{{ item }}{{index==allergyHistory.length-1?'':'&nbsp;/&nbsp;'}}</span> -->
                            </dd>
                        </dl>
                    </div>
                </transition>
            </div>
    
        </div>

        <div class="absolute bottom0 left0 bgcolor-white width100" style="z-index:100">
            <div class="paddingX20 padding10X vux-1px-t">
                <flexbox>
                    <flexbox-item>
                        <x-button plain type="primary" @click.native="$router.push('/evaluate/evaluate?consult_id='+encodeURIComponent(consult_id))">{{evaluate?"查看评价":"进行评价"}}</x-button>
                    </flexbox-item>
                    <flexbox-item>
                        <x-button type="primary" @click.native="$router.push('/order/orderDetail?consult_id='+encodeURIComponent(consult_id))">查看会诊单</x-button>
                    </flexbox-item>
                </flexbox>
            </div>
        </div>
        <div class="fixed-presc" @click="goToPrescription()" v-if="medicalStatus!=-1" style="z-index:10">
            <div class="relative paddingleft35">
                <i class="presc-icon absolute left0" style="top:4px"></i><span class="marginleft5">查看处方笺</span>
            </div>
        </div>
        <div v-transfer-dom>
            <confirm v-model="show" title="购药" content="是否购买药品，该处方有效期3天" @on-cancel="onCancel" @on-confirm="onConfirm"></confirm>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import '@/assets/less/diagnosReport.less'
import { Flexbox, FlexboxItem, XButton,Confirm,Loading,TransferDomDirective as TransferDom  } from 'vux'
import {post,get,del,put,ysWeb} from '../../request/config.js'
export default {
    data() {
        return {
            visitorInfoShow: false,     // 问诊信息是否显示
            showLink: true,     //展开链接是否显示
            hideLink: false,        //收起链接是否显示

            hospitalName:sessionStorage.getItem('hospitalName'),
            detail:{},
            patientInfo:{},
            diagnosesInfo:[],
            medicine: [],
            recipeReports:[],
            testReports:[],   //检查项目
            examinationReports:[],   //检验项目
            diseaseHistory: [],
            allergyHistory: [],
            patientList:[],
            evaluate:{},
            show:false,
            medicalStatus:-1,
            buyMedicalUrl:'',
            consultId:'',
            uuid:'',
            hospitalId:'',
            consult_id:decodeURIComponent(this.$route.query.consult_id),
            showLoading:false,
            pastHistoryStr:'',
            allergicHistoryStr:''
        }
    },
    computed: {
        
    },
    directives: {
        TransferDom
    },
    components: {
        Flexbox,
        FlexboxItem,
        XButton,
        Confirm,
        Loading 
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        console.log('诊断报告',this.consult_id)
        this.getDiagnoseDetail();
    },
    methods:{
        onCancel () {
            console.log('on cancel')
        },
        onConfirm (msg) {
            console.log('on confirm')
            // let check=sessionStorage.getItem('buyMedical')
            // if(check!=1)
            this.setYSData()
            // else
            //     window.location.href=this.buyMedicalUrl
        },
        showVisitorInfo() {
            var self = this;
            self.showLink = false;
            self.hideLink = true;
            self.visitorInfoShow = true;
        },
        hideVisitorInfo() {
            var self = this;
            self.showLink = true;
            self.hideLink = false;
            self.visitorInfoShow = false;
        },
        goToPrescription(){
            this.$router.push('/prescription/prescription?consult_id='+encodeURIComponent(this.consult_id))
        },
        //  跳转至药事平台购药订单页面
        goToMedicalOrder(){
            // let check=sessionStorage.getItem('buyMedical')
            // if(check!=1)
            this.setYSData()
            // else
            //     window.location.href=this.buyMedicalUrl
        },
        getDiagnoseDetail(){
            let _this=this;
            this.showLoading=true
            post('/patient/getPatientDiagnoseDetail.htm',{consult_id:this.consult_id},'query').then(res=>{
                console.log('getPatientDiagnoseDetail',res)
                if(res.data.ret_code==0){
                    this.detail=res.data.ret_data;
                    this.patientInfo=this.detail.consultPatient;
                    this.diagnosesInfo=this.detail.diagnoses;  

                     if(this.diagnosesInfo&&this.diagnosesInfo.length>0){
                        for(let i = 0 ;i<this.diagnosesInfo.length;i++){
                            this.pastHistoryStr+=this.diagnosesInfo[i].pastIllnessHistory==''?'':this.diagnosesInfo[i].pastIllnessHistory+';';
                            this.allergicHistoryStr+=this.diagnosesInfo[i].allergicHistory==''?'':this.diagnosesInfo[i].allergicHistory+';';
                        }
                        this.pastHistoryStr=this.pastHistoryStr.length>0?this.pastHistoryStr.substring(0,this.pastHistoryStr.length-1):this.pastHistoryStr;
                        this.allergicHistoryStr=this.allergicHistoryStr.length>0?this.allergicHistoryStr.substring(0,this.allergicHistoryStr.length-1):this.allergicHistoryStr;
                    }else{
                        this.pastHistoryStr='';
                        this.allergicHistoryStr='';
                    }

                    this.consultDoctors=this.detail.consultDoctors;
                    this.medicine=this.detail.recipes;  //药品
                    //this.recipeReports=this.detail.recipeReports?this.detail.recipeReports:[];   
                    if(this.detail.recipeReports&&this.detail.recipeReports.length>0){
                        this.recipeReports=this.detail.recipeReports;
                        for(let i = 0 ;i<this.detail.recipeReports.length;i++){
                            if(this.detail.recipeReports[i].type==1)
                                this.testReports.push(this.detail.recipeReports[i]);
                            else if(this.detail.recipeReports[i].type==2)
                                this.examinationReports.push(this.detail.recipeReports[i]);
                        }
                    }else{
                        this.recipeReports=[];
                        this.testReports=[];
                        this.examinationReports=[];
                    }
                    this.evaluate=this.detail.evaluate; //评价
                    
                    this.patientInfo.allergicHistory=this.patientInfo.allergicHistory.replace(/;/g,'');
                    this.patientInfo.pastIllnessHistory=this.patientInfo.pastIllnessHistory.replace(/;/g,'')
                    
                    this.diseaseHistory=this.patientInfo.pastIllnessHistory.split(',');
                    this.allergyHistory=this.patientInfo.allergicHistory.split(',');


                    this.hospitalId=this.detail.consultDoctors[0].hospitalIdString
                    this.consultId=this.detail.consult_id
                    this.uuid=this.detail.uuid
                    _this.setMedicalStatus()
                    _this.getPatientList()
                    this.showLoading=false
                }else{
                    this.showLoading=false
                    this.$vux.toast.show({
                        text:res.data.ret_info,
                        type: 'text',
                    })
                    //console.log('ret_info',res.data.ret_info)
                }
                
            }).catch(err=>{
                _this.showLoading=false
                _this.$vux.toast.show({
                    text:err,
                    type: 'text',
                })
                console.log('err',err)
            })
        },
        getPatientList(){
            post('/patient/getPatientByUserId.htm?token='+sessionStorage.getItem('token')).then(res=>{
                if(res.data.ret_code==0){
                    this.patientList=res.data.ret_data
                }
            })
        },
        // 设置买药跳转地址
        setMedicalStatus(){
            if(this.detail.buyMedicine!=1&&this.detail.buyMedicine!=0&&this.detail.buyMedicine!=2){    
                this.medicalStatus=-1 
            }else{               
                if(this.detail.buyMedicine==1){
                    this.medicalStatus=1
                    // this.buyMedicalUrl=ysWeb+"/order_details.html?"+this.uuid                    
                    this.buyMedicalUrl=ysWeb+"/#/personal/order_manage/order_detail?orderId="+this.uuid+"&token="+sessionStorage.getItem("token")
                }else{
                    this.medicalStatus=0
                    // this.buyMedicalUrl=ysWeb+"/home_purchase.html?"+this.uuid+"&"+this.hospitalId
                    this.buyMedicalUrl=ysWeb+"/#/buy_medicine/pharmacy_list?hospitalid="+this.hospitalId+"&prescriptionId="+this.uuid+"&token="+sessionStorage.getItem("token")
                }   
            }   
        },
        // 购药确认
        buyConfirm(){
            this.show=true
        },
        //  设置药事平台对接数据
        setYSData(){           
            post('/patient/goBuyMedicine.htm',{token:sessionStorage.getItem('token'),consult_id:this.consultId}).then(res=>{
                if(res.data.ret_code==0){
                    window.location.href=this.buyMedicalUrl
                }
                else{
                    this.$vux.toast.show({
                        text:res.data.ret_info,
                        type: 'text',
                    })
                }
            })
                    
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

