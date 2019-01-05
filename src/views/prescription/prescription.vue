<template>
    <div class="prescription_content width100 height100 absolute top0 bottom0" style="padding-bottom:62px;">
        <div class="height100 paddingbottom10 scrollY">
            <div class="origin">
                <p>{{schedule.hospitalName}}</p>
                <div class="color-333 relative margintop5">
                    <span class="color-333">处方笺</span>
                    <span class="color-666 fontsize-2 absolute right0" v-if="prescriptionId!=''">NO：{{prescriptionId}}</span>
                </div>
                <table class="fontsize2 width100 lineheight20">
                    <tr>
                        <td class="td_label">姓<span class="paddingleft2em">名</span></td>
                        <td class="td_value">{{patientInfo.name}}</td>
                    </tr>
                    <tr>
                        <td class="td_label">性<span class="paddingleft2em">别</span></td>
                        <td class="td_value">{{patientInfo.sex}}</td>
                    </tr>
                    <tr>
                        <td class="td_label">年<span class="paddingleft2em">龄</span></td>
                        <td class="td_value">{{patientInfo.age}}岁</td>
                    </tr>
                    <tr>
                        <td class="td_label">科<span class="paddingleft2em">室</span></td>
                        <td class="td_value">{{schedule.department}}</td>
                    </tr>
                    <tr>
                        <td class="td_label">就诊卡号</td>
                        <td class="td_value">{{patientInfo.treatmentCard?patientInfo.treatmentCard:'暂无就诊卡号'}}</td>
                    </tr>
                    <tr>
                        <td class="td_label">临床诊断</td>
                        <td class="td_value">{{diagnose.diagnose.indexOf('@mzzd@')>0?diagnose.diagnose.replace(/@mzzd@/g,';'):diagnose.diagnose}}</td>
                    </tr>
                    <tr>
                        <td class="td_label">处方日期</td>
                        <td class="td_value">{{diagnose.diagnoseTime}}</td>
                    </tr>
                </table>
            </div>
            <div class="paddingleft15 bgcolor-white">
                <div class="vux-1px-t vux-1px-b paddingright15">
                    <div class="lineheight20 fontsize1 padding15X" v-for="(item,index) in medicine" :key="index">
                        <p class="color-333 paddingtop">{{item.name}}</p>
                        <p class="color-999 paddingtop10">用法用量：<span class="paddingleft5 vux-1px-r">{{item.timesState}} </span><span class="paddingleft5 paddingright5 vux-1px-r">1次{{item.dosage}}{{item.dosageUnit}}</span><span class="paddingleft5 paddingright5 vux-1px-r">{{item.day}}天</span><span class="paddingleft5">{{item.method}}</span></p>
                    </div>
                </div>
                <div class="padding10X">
                    <table class="fontsize2 width100 lineheight20">
                        <tr>
                            <td class="td_label">医<span class="paddingleft2em">生</span></td>
                            <td class="td_value alignLeft">{{schedule.doctorName}}</td>
                        </tr>
                        <tr>
                            <td class="td_label">审核药师</td>
                            <td class="td_value alignLeft">{{pharmacist_name}}</td>
                        </tr>
                    </table>
                </div>
                <p class="fontsize0 color-999 textAlignCenter paddingright15 paddingbottom15">本处方有效期三天，凭此处方笺到院或合作药房取药</p>
            </div>
        </div>
        <div class="width100 absolute bottom0 left0 bgcolor-white">
            <div class="vux-1px-t paddingX20 padding10X">
                <x-button type="primary" @click.native="getImage()">查看电子处方</x-button>
            </div>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { XButton,Loading, TransferDomDirective as TransferDom,ToastPlugin} from 'vux'
import {post,get,del,put} from '../../request/config.js'
import Vue from 'vue'
Vue.use(ToastPlugin)
export default {
    directives: {
        TransferDom
    },
  components: { XButton,Loading},
  data () {
    return {
        prescriptionId:'',
        patientInfo:{},
        schedule:{},
        diagnose:{diagnose:''},
        medicine:[],
        pharmacist_name:'',
        pdfUrl:'',
        consult_id:decodeURIComponent(this.$route.query.consult_id),
        showLoading:false
    }
  },
    methods:{
        getPrescription(){
            this.showLoading=true
            post('/expert/getMzConsult.htm',{consult_id:this.consult_id},'query').then(res=>{        
                if(res.data.ret_code==0){
                    this.patientInfo=res.data.ret_data.consultPatient;
                    this.schedule=res.data.ret_data.schedule;
                    this.diagnose=res.data.ret_data.diagnose;
                    this.medicine=res.data.ret_data.recipes;
                    this.pharmacist_name=res.data.ret_data.pharmacistName;
                    console.log('getPrescription',res.data.ret_data)
                }else{
                    console.log('ret_info',res.data.ret_info);
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log('err',err)
            })
        },
        getRecipePdf(){          
            post('/applyDoctor/getRecipePicture.htm?consult_id='+this.consult_id).then(res=>{
                if(res.data.ret_code==0){
                    //this.pdfUrl=res.data.ret_info
                    console.log('res.data.ret_data',res.data.ret_data)
                    this.pdfUrl = res.data.ret_data;
                    //window.open(this.pdfUrl)
                    // this.pdfUrl="http://cs.ydyc.zwjk.com/pdf/2018/06/12/4b1b3fb6-50fb-4698-aaf8-f02a079408c6.pdf"
                }else{
                    console.log('ret_info',res.data.ret_info);
                }
            })
        },
        getImage(){
            //window.open(this.pdfUrl)
            //window.location.href=this.pdfUrl
            if(this.pdfUrl==""){
                Vue.$vux.toast.text('电子处方生成中，请稍后再试')
                this.getRecipePdf();
            }else{
                this.$router.push('/prescription/image?url='+this.pdfUrl)
            }          
        }
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        console.log('处方笺',this.consult_id)
        this.getPrescription();
        this.getRecipePdf();
    },
}
</script>
<style scoped lang="less">
    .prescription_content{
        padding-top:8px;
        padding-bottom:72px;
        .origin{
            padding:15px;
            font-size:17px;
            line-height:25px;
            color:#111;
            background:#fff;
            text-align:center;
            overflow:hidden;
        }
        .td_label{
            width:70px;
            color:#666;
            text-align:left;
        }
        .td_value{
            color:#333;
            text-align:right;
            word-break:break-all;
            line-height:20px;
            padding:5px 0 5px 5px;
            &.alignLeft{
                text-align:left;
                padding-right:15px;
            }
        }
    }
</style>
