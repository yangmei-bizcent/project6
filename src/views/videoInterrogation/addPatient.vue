<template>
    <div class="add_patient width100 height100 absolute top0 bottom0" style="padding-bottom:62px;">
        <div class="height100 paddingbottom10 scrollY">
            <div class="doc_info">
                <x-img class="doc_avatar" :src="getDoctorPhoto(schedule.doctorPhoto)"/>
                <p class="lineheight20px">
                    <span class="doc_name">{{schedule.doctorName}}</span>
                    <span class="color-666 fontsize0 paddingX3">{{schedule.doctorPosition}}</span>
                    <span class="fontsize0 color-999">|</span>
                    <span class="color-666 fontsize0 paddingX3">{{schedule.department}}</span></p>
                <p class="color-999 fontsize0 paddintop5">{{schedule.hospitalName}}</p>
            </div>
            <div class="margintop10">
                <group label-width="3.5em" label-align="left" title-Color="#666666">
                    <cell title="日期" class="lineheight30" :value="schedule.scheduleDate" value-align="right"></cell>
                    <cell title="时间" class="lineheight30" :value="schedule.startTime+'-'+schedule.endTime" value-align="right"></cell>
                    <!-- <cell title="时间" v-if="schedule.timeType==0" value="上午" value-align="left"></cell>
                    <cell title="时间" v-if="schedule.timeType==1" value="下午" value-align="left"></cell>
                    <cell title="时间" v-if="schedule.timeType==2" value="晚上" value-align="left"></cell> -->
                    <cell title="挂号费" class="lineheight30" :value="schedule.price/100+'元'" value-align="right"></cell>
                </group>
            </div>
            <div class="margintop10 cell100">
                <group label-width="5em" label-align="left" title-Color="#666666">
                    <cell title="就诊人" class="lineheight30" value-align="right" :link="'/visitor/selectVisitor?token='+token+'&fromPage=addPatient'" :is-link="true">
                        <div slot="title">                           
                            <span class="color-666">就诊人</span>
                            <span style="color:red">*</span>
                        </div>
                        <div slot="value">
                            <span >{{patientInfo.name==''?'请点击选择就诊人':patientInfo.name}}</span>
                        </div>
                    </cell>
                    <cell title="就诊卡号" class="lineheight30" value-align="right" >
                        <div slot="title">                            
                            <span class="color-666">就诊卡号</span>
                            <span style="color:red">*</span>
                        </div>
                        <div slot="value">
                            <span >{{patientInfo.medicalCard}}</span>
                        </div>
                    </cell>
                </group>
            </div>
        </div>
        <div class="absolute bottom0 left0 bgcolor-white width100">
            <div class="paddingX20 padding10X  vux-1px-t">
                <x-button type="primary" :disabled="patientInfo.name==''" @click.native="applyNext">下一步</x-button>
                <!-- <x-button type="primary" :disabled="(!!patientInfo.name)||patientInfo.name==''" @click.native="applyNext">下一步</x-button> -->
            </div>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { XImg, Group, Cell, XButton,Loading, TransferDomDirective as TransferDom } from "vux";
import { post, get, del, put,getDoctorImage } from "../../request/config.js";
export default {
    directives: {
        TransferDom
    },
  components: { Group, Cell, XButton, XImg,Loading },
  data() {
    return {
      patientInfo: {
          name:'',
          medicalCard:''
      },
      schedule: sessionStorage.getItem('schedule')?JSON.parse(sessionStorage.getItem('schedule')):{},
      //disabled: true,
      token: "",
      scheduleId:"",
      showLoading:false
    };
  },
  mounted() {
    let currparams={
        url:window.location.href
    }
    rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
    sessionStorage.removeItem('isChangeHistory');
    sessionStorage.removeItem('videoApplySure');
    this.token = sessionStorage.getItem("token");
    this.dataBind();
  },
  methods: {
    dataBind(){
        this.showLoading=true
        if(this.$route.query.scheduleId){
            this.scheduleId=this.$route.query.scheduleId
        }else{
            this.scheduleId=JSON.parse(sessionStorage.getItem("schedule")).scheduleId;
        }
        post('/patient/getScheduleDetail.htm',{scheduleId:this.scheduleId},'query').then(res=>{
           console.log(res,'res')
            if(res.data.ret_code==0){
                this.schedule=res.data.ret_data;
                sessionStorage.setItem('schedule',JSON.stringify(this.schedule));
                if(sessionStorage.getItem("consultPatient")) {
                    this.patientInfo = JSON.parse(sessionStorage.getItem("consultPatient"));       
                }
                let params={
                    url:sessionStorage.getItem('href')+"doctor/doctorIndex?doctorId="+this.schedule.doctorId+"&unionId="+sessionStorage.getItem('unionId')+"&hospitalId="+sessionStorage.getItem('hospitalId')
                }
                console.log(params,'==parms==')
                rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
            }else{
                let params={
                    url:sessionStorage.getItem('href')+"?action=none"
                }
                rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
                console.log(res.data.ret_info,'info')
            }
            this.showLoading=false
        }).catch(err=>{
            this.showLoading=false
            console.log(err,'err')
        })
    },
    applyNext() {
      this.$router.push({ path: "/videoInterrogation/videoApply" ,query:{patientId:this.$route.query.patientId}});
    },
    getDoctorPhoto(val){
        return getDoctorImage(val)
    }
  }
};
</script>
<style lang="less" scoped>
.add_patient {
  padding-bottom: 72px;
  .doc_info {
    background: #fff;
    padding: 12px 15px 12px 76px;
    position: relative;
    .doc_avatar {
      width: 46px;
      height: 46px;
      border-radius: 100px;
      overflow: hidden;
      position: absolute;
      top: 12px;
      left: 15px;
    }
    .doc_name {
      font-size: 16px;
      color: #333;
    }
    .paddingX3 {
      padding: 0 3px;
    }
  }
}
</style>

