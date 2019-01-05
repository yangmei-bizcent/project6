<template>
    <div class="section_content height100">
        <div class="height100">
            <div class="width100 fixed top0 left0 padding15X bgcolor-white" style="height:135px;margin-bottom:4;z-index:10">
                <p class="paddingX15 lineheight25 fontsize2 color-33">
                    {{activeYear}}年{{activeMonth}}月 
                    <span class="floatRight color-666 fontsize-1" @click="getAllDateDoc">全部</span>
                </p>
                <flexbox :gutter="0" class="paddingtop15 date_wrap">
                    <flexbox-item v-for="item in weeks" :key="item.date" class="textAlignCenter">
                        <p class="fontsize-2 color-999">{{item.day}}</p>
                        <p class="paddingtop15 fontsize0 color-333"><span :class="['Date',activeDate == item.date?'currentDate':'']" @click="getActiveDateDoc(item)">{{item.dateName}}</span></p>
                    </flexbox-item>
                </flexbox>
            </div>
            <div  style="padding-top:145px;height:100%">
                <div class="doc_result">
                    <scroller lock-x height="100%" @on-scroll-bottom="onScrollBottom" ref="scrollerBottom" :scroll-bottom-offst="100">
                        <div>   
                            <div class="textAlignCenter paddingtop50" v-if="results.length==0">
                                <img src="../../assets/img/search_noDoc.png" width="160"/>
                                <p class="margintop20" style="color:#6C7D8F">暂无医生排班</p>
                            </div>
                            <div v-if="results.length>0">
                                <div class="doc_wrap vux-1px-b" v-for="item in results" :key="item.id" @click="onDoctorClick(item)">
                                    <img class="doc_avatar" :src="getDoctorPhoto(item.doctorPhoto)"/>
                                    <div class="doc_info">
                                        <span class="doc_name">{{item.doctorName}}</span>
                                        <span class="vux-1px-r">{{item.doctorPosition}}</span>
                                        <span>{{item.department}}</span>
                                    </div>
                                    <div class="doc_price clear">
                                        <img class="floatLeft" style="margin-right:8px" src="../../assets/img/search_video.png" width="20"/>
                                        <span class="floatLeft">{{item.price/100}}元/次</span>
                                        <span class="floatRight" style="width:120px;text-align: right">{{getSechdeleTime(item)}}</span>
                                    </div>
                                    <p class="dec_gift">擅长：{{item.specialTech}}</p>               
                                    <span v-if="item.stopType==1" class="doc_tag tag tag_disabled">停诊</span>
                                    <span v-else-if="item.stopType==0&&item.patientNumberLeft==0" class="doc_tag tag tag_disabled">约满</span>
                                    <span v-else-if="item.stopType==0&&item.patientNumberLeft>0" class="doc_tag tag tag_able">可预约</span>
                                </div>
                                <load-more :tip="loadWord" :show-loading="showLoadMore"></load-more>
                            </div>
                        </div>
                    </scroller>
                </div>
            </div>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { Flexbox, FlexboxItem, Scroller, LoadMore,Loading,TransferDomDirective as TransferDom ,dateFormat} from 'vux'
import {post,get,del,put,getDoctorImage} from '../../request/config.js'
export default {
    directives: {
        TransferDom
    },
  components: { Flexbox, FlexboxItem, Scroller, LoadMore,Loading,dateFormat },
  data () {
    return {
        weeks:[],
        activeYear:'',
        activeMonth:'',
        activeDate:0,
        status:1,
        onFetching: false,
        showLoadMore:false,
        showLoading:false,
        departmentId:'',
        pageNum:1,
        paramDate:'',
        total:'',
        results:[],
        loadWord:'下拉获取更多'
    }
  },
    methods:{
        //初始化日期表格
        getDate(){
            let nowDate = new Date();
            //let nowDate = new Date("2018-12-30");     跨年或跨月临界值
            for(var i = 0 ; i<7; i++){
                let item = {};
                item.year= nowDate.getFullYear();
                item.month = nowDate.getMonth()+1;
                item.date = nowDate.getDate();
                switch(nowDate.getDay()){
                    case 0 :
                        item.day = '日';
                        //item.dateName = '休息';
                        item.dateName = String(nowDate.getDate());
                        break ;
                    case 1 :
                        item.day = '一';
                        item.dateName = String(nowDate.getDate());
                        break ;
                    case 2 :
                        item.day = '二';
                        item.dateName = String(nowDate.getDate());
                        break ;
                    case 3 :
                        item.day = '三';
                        item.dateName = String(nowDate.getDate());
                        break ;
                    case 4 :
                        item.day = '四';
                        item.dateName = String(nowDate.getDate());
                        break ;
                    case 5 :
                        item.day = '五';
                        item.dateName = String(nowDate.getDate());
                        break ;
                    case 6 :
                        item.day = '六';
                        //item.dateName = '休息';
                        item.dateName = String(nowDate.getDate());
                        break ;
                }
                if(i == 0){
                    this.activeYear = nowDate.getFullYear();
                    this.activeMonth = nowDate.getMonth()+1;
                }
                this.weeks.push(item);
                nowDate = new Date(nowDate.getTime() + 1000*60*60*24)
            }
        },
        //获取排班列表
        getList(){
            return new Promise( (resolve,reject) => {
                this.showLoading=true
                post('/appSchedule/getAWeekScheduleList.htm',{
                    token:sessionStorage.getItem('token'),
                    departmentId:this.departmentId,
                    date:this.paramDate,
                    pageNum:this.pageNum,
                    pageSize:10
                    },'query').then( res => {
                    if(res.data.ret_code==0){
                        if(this.pageNum>1){
                            this.results=this.results.concat(res.data.ret_data.list);
                        }else
                            this.results=res.data.ret_data.list;  
                            // if(res.data.ret_data.list.length==0)
                            //     this.getAllDateDoc();
                        // res.data.ret_data.list.forEach( ele => {
                        //     this.results.push(ele);
                        // })
                        this.total = res.data.ret_data.total
                        this.loadWord = parseInt(res.data.ret_data.total)>this.results.length?'下拉加载更多':'没有更多'
                        this.onFetching = false;
                        console.log('res.data.ret_data.list',res.data.ret_data.list)
                    }else{
                        console.log(res.data.ret_info)
                    }
                    this.showLoading=false
                    resolve();
                }).catch(err=>{
                    this.showLoading=false
                    console.log('err',err)
                })
            })
        },
        // 点击全部 获取七天内所有医生排班
        getAllDateDoc(){
            this.activeDate = 0;
            this.paramDate =  "";
            this.pageNum = 1;
            this.results = [];
            this.getList().then( () => {
                this.$refs.scrollerBottom.reset({top: 0})
            });
        },
        // 点击指定日期 获取医生排班
        getActiveDateDoc(item){
            this.activeYear =item.year;
            this.activeMonth =item.month;
            this.activeDate = item.date;
            this.paramDate = this.activeYear+'-'+this.activeMonth+'-'+this.activeDate;
            console.log("this.paramDate",this.paramDate)
            this.pageNum = 1;
            this.results = [];
            this.getList().then( () => {
                this.$refs.scrollerBottom.reset({top: 0})
            });
        },
        //下拉加载更多
        onScrollBottom(){
            if (this.onFetching) {
            } else {
                if(parseInt(this.total)>this.results.length){
                    this.loadWord = "加载中..."
                    this.onFetching = true
                    setTimeout(() => {
                        this.pageNum += 1;
                        this.getList();
                    }, 500)
                }
            }
        },
        onDoctorClick(item){
            this.$router.push('/doctor/doctorIndex?doctorId='+item.doctorId+'&unionId='+item.unionId+'&hospitalId='+item.hospitalId+"&fromPage=doctorList")
        },
        getDoctorPhoto(val){
            return getDoctorImage(val)
        },
        getSechdeleTime(val){
            let date=new Date(val.scheduleDate);
            let txt=dateFormat(date,'MM-DD')+' '+val.startTime+'-'+val.endTime
            return txt;
        }
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});

        let params={
            url:sessionStorage.getItem('href')+"section/sectionList"
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
        
        this.departmentId=this.$route.query.departmentId;
        this.getDate();
        let nowDate = new Date();       
        //let nowDate = new Date("2018-12-30"); 跨年或跨月临界值
        let item={
            year : nowDate.getFullYear(),
            month : nowDate.getMonth()+1,
            date : nowDate.getDate()
        }
        this.getActiveDateDoc(item);
    }
}
</script>
<style scoped lang="less">
    .date_wrap{
        .Date{
            display:inline-block;
            width:30px;
            height:30px;
            line-height:30px;
            text-align:center;
            border-radius:50%;
            &.currentDate{
                color:#fff;
                background:#4185F3;
            } 
        }
    }
</style>
