<template>
    <div class="page-container page-doctorIndex">
        <div class="pagetop-bg"></div>
        <div class="doctor-info-card bgcolor-white color-333">
            <div class="card-top">
                <flexbox :gutter="24">
                    <flexbox-item :span="3">
                        <div class="img-container" :style="doctorImgClass">
                            <!-- <img :src="doctorInfo.PhotoPath" alt="医生头像" class="doctor-img" /> -->
                        </div>
                    </flexbox-item>
                    <flexbox-item>
                        <flexbox orient="vertical">
                            <flexbox-item class="lineEllipsis">
                                <span class="fontsize6 ">{{doctorInfo.Name}}</span>
                                <span class="fontsize0 color-666">/&nbsp;{{doctorInfo.ClinicalTitleName}}</span>
                            </flexbox-item>
                            <flexbox-item class="mrgtop0 lineEllipsis">
                                <span class="fontsize-1 color-999">{{doctorInfo.SectionName}}&nbsp;{{doctorInfo.HospitalName}}</span>
                            </flexbox-item>
                            <flexbox-item>
                                <div class="doctor-tag relative">
                                    <div class="tag-bg rate-tag absolute"></div>
                                    <div>评分{{doctorInfo.Score}}</div>
                                </div>
                                <div class="doctor-tag relative">
                                    <div class="tag-bg arrange-tag absolute"></div>
                                    <div>接诊量&nbsp;{{doctorInfo.count}}</div>
                                </div>  
                            </flexbox-item>
                        </flexbox>
                    </flexbox-item>
                </flexbox>
            </div>
            <div class="line-divider"></div>
            <div class="card-bottom">
                <div class="fontsize2" >
                    <span style="display:inline-block"><i class="doctor-goodat"></i>擅长</span>
                    <span  v-show="ellip" @click="showAll" class="showAll">&nbsp;&nbsp;展开<x-icon type="ios-arrow-down" class="collp-icon" size="15"></x-icon></span>
                    <span  v-show="!ellip" @click="notShowAll" class="showAll">&nbsp;&nbsp;收起<x-icon type="ios-arrow-up" class="collp-icon" size="15"></x-icon></span>
                </div>
                <div class="fontsize0 color-666">
                    <!-- {{doctorInfo.Specialty}} -->
                    <span :class="ifEllip">{{doctorInfo.Specialty}}</span>
                   
                </div>
            </div>
        </div>
        <div class="panel-card bgcolor-white fontsize0 color-666 paddingbottom-12">
             <div class="fontsize0 color-666 textAlignCenter paddingtop20 bgcolor-white" v-if="newScheduleList.length == 0">暂无排班</div>
            <div v-for="(item, index) in newScheduleList" :key="index">
                <div class="panel-title">排班信息（{{item.hospitalName}}{{ item.sectionName }}）</div>
                <x-table class="tb-dutyrost" v-if="item.scheduleList != null">
                    <thead>
                        <tr>
                            <th></th>
                            <th class="lineheight20 padding5X" v-for="(weekItem, weekIndex) in item.scheduleList" v-if="weekIndex%2==0" :key="weekIndex">{{ weekItem.week }}<br/>{{weekItem.date}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>上<br>午</td>
                            <td
                                v-for="(visitItem1, visitIndex1) in item.scheduleList" 
                                :key="visitIndex1" 
                                v-if="visitItem1.timeType==0"
                                :class="visitTdClass(visitItem1.state)"
                                @click="visitItem1.state==2?register(visitItem1):''">{{ visitItem1.stateText }}</td>
                        </tr>
                        <tr>
                            <td>下<br>午</td>
                            <td
                                v-for="(visitItem2, visitIndex2) in item.scheduleList" 
                                :key="visitIndex2" 
                                v-if="visitItem2.timeType==1"
                                :class="visitTdClass(visitItem2.state)"
                                @click="visitItem2.state==2?register(visitItem2):''">{{ visitItem2.stateText }}</td>
                        </tr>
                    </tbody>
                </x-table>
            </div>
        </div>
        <div class="panel-card bgcolor-white fontsize0 color-666 marginbottom30">
            <div class="panel-title">收到的评价</div>
            <div v-if="evaluateList.length > 0" class="rate-detail-container  vux-1px-t">
                <flexbox v-for="(item, index) in evaluateList" :key="index" orient="vertical" class="padding15X vux-1px-b">
                    <flexbox-item>
                        <flexbox>
                            <flexbox-item class="fontsize1 color-666">{{ item.phone }}</flexbox-item>
                            <flexbox-item>
                                <rater v-model="item.evaluateWhole" :max="5" active-color="#ffc933" :font-size="18" :margin="2" disabled></rater>
                            </flexbox-item>
                            <flexbox-item class="fontsize-2 color-999">{{ item.createTime }}</flexbox-item>
                        </flexbox>
                    </flexbox-item>
                    <flexbox-item>
                        <div v-for="(tagItem, tagIndex) in item.evaluateTags" :key="tagIndex" class="rate-tag">{{ tagItem }}</div>
                    </flexbox-item>
                    <flexbox-item class="fontsize2 color-333">{{ item.evaluateContent }}</flexbox-item>
                </flexbox>
            </div>
            <div v-if="evaluateList.length == 0" class="rate-detail-container textAlignCenter vux-1px-t paddingbottom20">
                <img src="../../assets/img/doctorIndex_noevaluate.png" class="evaluate-nodata" />
                <div class="nodata-text fontsize2">还没有评价内容</div>
            </div>
        </div>
        <!-- <div class="have-no-more textAlignCenter fontsize0 color-999">没有更多了</div> -->
        <div v-transfer-dom>
            <loading :show="showLoading" text="" position="absolute"></loading>
        </div>
    </div>
</template>

<script>
import '@/assets/less/doctorIndex.less'
import { Flexbox, FlexboxItem, XTable, Rater,dateFormat,Loading,TransferDomDirective as TransferDom } from 'vux'
//import axios from "axios"
import {post,get,del,put,userCenterGet,getDoctorImage} from '../../request/config.js'
import { rejects } from 'assert';
export default {
    data() {
        return {
            rateVal: 3.5,
            doctorInfo:{},
            scheduleList:[],
            unionId:'',
            hospitalId:'',
            doctorId:'',
            departmentId:'',
            newScheduleList:[],
            evaluateList: [],   //评价列表
            //appid:'',
            ellip: true,   //擅长是否收起, true收起, false展开
            doctorImgClass:'',
            showLoading:false,
        }
    },
    directives: {
        TransferDom
    },
    components: {
        Flexbox,
        FlexboxItem,
        XTable,
        Rater,
        dateFormat,
        Loading
    },
    computed: {
        ifEllip: function() {
            return {
                moreLineEllipsis1: this.ellip,
                webkitbox: true
            }
        }
    },
    mounted(){       
        
        this.unionId=this.$route.query.unionId
        sessionStorage.setItem('unionId',this.unionId)
        this.hospitalId=this.$route.query.hospitalId
        this.doctorId=this.$route.query.doctorId;
        this.getDoctorInfo()
        this.getDoctorSchedule()
        this.getDoctorComment()
        sessionStorage.removeItem('description');
        sessionStorage.removeItem('picList');
        sessionStorage.removeItem('applyHistory');
        sessionStorage.removeItem('selectedHistory');
        sessionStorage.removeItem('consultPatient');
        sessionStorage.removeItem('schedule');
        sessionStorage.removeItem('selectVisitorFrom');

        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});   
    },
    methods:{
        visitTdClass(state){
            switch(state) {
                case 0:
                    return 'stop';break;
                case 1:
                    return 'full';break;
                case 2:
                    return 'register';break;
            }
        },
        showAll() {
            this.ellip = false;
        },
        notShowAll() {
            this.ellip = true;
        },
        getDoctorInfo(){
            this.showLoading=true
            post('/appPatient/getExpertDoctorDetail.htm',{
                doctorId:this.doctorId,
                unionId:this.unionId
            }).then(res=>{
                if(res.data.ret_code==0){                   
                    this.doctorInfo=JSON.parse(res.data.ret_data)
                    this.doctorImgClass = {
                        background: 'url("'+this.getDoctorPhoto(this.doctorInfo.PhotoPath)+'") center no-repeat',
                        backgroundSize: 'cover'
                    }
                    this.departmentId=this.doctorInfo.SectionId;

                    let fromPage=this.$route.query.fromPage;
                    let params={};
                    if(fromPage=="doctorSearch"){
                        params={
                            url:sessionStorage.getItem('href')+"doctor/doctorSearch"
                        }
                    }
                    else {
                        params={
                            url:sessionStorage.getItem('href')+"doctor/doctorList?hospitalId="+sessionStorage.getItem('hospitalId')+"&departmentId="+this.departmentId
                        }
                    }
                    rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
                    console.log('getDoctorInfo',this.doctorInfo)
                }else{
                    console.log(res.data.ret_info)
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log('err',err)
            })
        },
        getDoctorSchedule(){
            var date=new Date()
            let startTime=dateFormat(date, 'YYYY-MM-DD')
            let endTime=dateFormat(date.setDate(date.getDate() + 7), 'YYYY-MM-DD')

            post('/appSchedule/getScheduleAfterList.htm',{
                startTime:startTime,
                endTime:endTime,
                unionId:this.unionId,
                hospitalId:this.hospitalId,
                doctorId:this.doctorId,
                numberType:2
            }).then(res=>{
                if(res.data.ret_code==0){
                    console.log('getDoctorSchedule',res.data.ret_data)
                    let oldScheduleList=res.data.ret_data
                    let sectionList=[]
                    this.newScheduleList=[]
                    if(oldScheduleList.length>0){
                        sectionList.push(oldScheduleList[0].departmentId)
                        this.newScheduleList.push({
                            sectionId:oldScheduleList[0].departmentId,
                            sectionName:oldScheduleList[0].department,
                            hospitalName:oldScheduleList[0].hospitalName,
                            scheduleList:[]
                        })
                        for(let i=0;i<oldScheduleList.length;i++){
                            let item=oldScheduleList[i]
                            //console.log('item',item)
                            let sectionIndex=sectionList.indexOf(item.departmentId)
                            if(sectionIndex==-1){
                                sectionList.push(item.departmentId)
                                sectionIndex=sectionList.length-1
                                this.newScheduleList.push({
                                    sectionId:item.departmentId,
                                    sectionName:item.department,
                                    hospitalName:item.hospitalName,
                                    scheduleList:[]
                                })
                            }
                            let obj=this.getWeekAndDate(item.scheduleDate)
                            // 0 停诊;1 约满;2 可预约
                            let state
                            let stateText
                            if(item.stopType==1) {
                                state=0;
                                stateText = '停诊';
                            }  
                            else if(item.stopType==0&&item.patientNumberLeft==0) {
                                state=1;
                                stateText = '约满';
                            }  
                            else if(item.stopType==0&&item.patientNumberLeft>0) {
                                state=2;
                                stateText = '挂号';
                            }
                            let scheduleItem={
                                scheduleDate:item.scheduleDate,
                                week:obj.week,
                                date:obj.date,
                                timeType:item.timeType,
                                price:item.price/100,
                                state:state,
                                stateText:stateText,
                                scheduleId:item.scheduleId
                            }
                            this.newScheduleList[sectionIndex].scheduleList.push(scheduleItem)                                                     
                        }
                        console.log('newScheduleList',this.newScheduleList)

                        for(let i=0;i<this.newScheduleList.length;i++){
                            let tempList=this.newScheduleList[i].scheduleList
                            console.log('this.newScheduleList[i].scheduleList',this.newScheduleList[i].scheduleList)
                            tempList=tempList.sort(this.compare)
                            console.log('this.newScheduleList[i].scheduleList after sort',this.newScheduleList[i].scheduleList)

                            let newList=[]
                            let checkDate=new Date()
                            let count
                            for(let n=0;n<14;n++){
                                let m=0;                             
                                for(;m<this.newScheduleList[i].scheduleList.length;m++){
                                    let cellValue=this.newScheduleList[i].scheduleList[m]
                                    let itemDate=new Date(cellValue.scheduleDate)
                                    if(checkDate.getDate()==itemDate.getDate()){
                                        if(n%2==0&&cellValue.timeType==0)   //上午                                       
                                            break;
                                        if(n%2==1&&cellValue.timeType==1)   //下午
                                            break;
                                    }                                   
                                }
                                //没有排班
                                if(m==this.newScheduleList[i].scheduleList.length){
                                    let tempDate=dateFormat(checkDate, 'YYYY-MM-DD')
                                    let obj=this.getWeekAndDate(tempDate)
                                    let cellValue={
                                            scheduleDate:tempDate,
                                            week:obj.week,
                                            date:obj.date,
                                            timeType:n%2,
                                            price:0,
                                            state:-1,
                                            stateText:"",
                                            scheduleId:""
                                        }
                                    newList.push(cellValue)
                                }else{
                                    newList.push(this.newScheduleList[i].scheduleList[m])
                                }
                                if(n%2==1){
                                    checkDate.setDate(checkDate.getDate()+1)
                                }                                   
                            }
                            this.newScheduleList[i].scheduleList=newList
                            
                        }
                        console.log('newScheduleList',this.newScheduleList)
                        
                    }
                    console.log(this.newScheduleList)
                }else{
                    console.log(res.data.ret_info)
                }
            })
        },
        getDoctorComment(){
            post('/appMzDoctor/getExpertDoctorEvaluates.htm',{
                consultType: 2,
                evaluateType: 4,
                evaluateeId: this.doctorId
            }).then(res=>{
                if(res.data.ret_code==0){
                    this.evaluateList = [];
                    var retDataList = res.data.ret_data.list;
                    console.log('getDoctorComment', retDataList);
                    if(retDataList.length > 0) {
                        retDataList.forEach(element => {
                            let phone = element.consultPatient.phone;
                            let createTime = '';
                            let evaluateTags = [];  //评价标签
                            let evaluateTagsText = '';
                            let evaluateContent = '';   //评价文本
                            if(phone != '') {
                                phone = phone.slice(0,3)+'****'+phone.slice(-4);
                            }
                            if(element.evaluateText != '') {
                                if(element.evaluateText.indexOf(';')!=-1) {
                                    evaluateTagsText = element.evaluateText.split(';')[0];
                                    evaluateContent = element.evaluateText.split(';')[1];
                                }
                                else {
                                    evaluateTagsText = element.evaluateText;
                                }
                                if(evaluateTagsText.indexOf(',')!=-1) {
                                    evaluateTags = evaluateTagsText.split(',');
                                }
                            }
                            if(element.createTime != '') {
                                createTime = element.createTime.slice(0,16);
                            }
                            
                            let item = {
                                phone: phone,
                                evaluateWhole: element.evaluateWhole,
                                createTime: createTime,
                                evaluateTags: evaluateTags,
                                evaluateContent: evaluateContent,
                            };
                            this.evaluateList.push(item);
                        });
                    }
                }
            });
        },
        getWeekAndDate(dateString){
            let today=new Date()
            let dateArray = dateString.split("-");
            let date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
            let week
            if(date.getDate()==today.getDate())
                week='今日'
            else
                week='周'+"日一二三四五六".charAt(date.getDay());
            let newDateString=(date.getMonth()+1)+'.'+date.getDate();
            return {
                week:week,
                date:newDateString
            }
        },
        register(val){
            this.$router.push('/videoInterrogation/addPatient?scheduleId='+val.scheduleId)
        },
        compare(obj1,obj2){
            console.log("in compare")
            let date1=obj1.scheduleDate
            let date2=obj2.scheduleDate

            if(date1<date2){
                return -1
            }else if(date1>date2){
                return 1
            }else{
                let time1=obj1.timeType
                let time2=obj2.timeType
                if(time1<time2)
                    return -1
                else if(time1>time2)
                    return 1
                else
                    return 0
            }
                
        },
        getDoctorPhoto(val){
            return getDoctorImage(val)
        }
    }
}
</script>

