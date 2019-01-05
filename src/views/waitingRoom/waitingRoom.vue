<template>
     <div class="page-container page-waitingroom color-333 height100">
        <div class="height100">
            <scroller lock-x height="100%" @on-scroll-bottom="onScrollBottom" ref="scrollerBottom" :scroll-bottom-offst="100">
                <div>
                    <div v-if="waitingList.length > 0" class="waiting-list">
                        <div class="notice-container fontsize0">
                            <i class="notice-icon marginright10"></i>视频之前您将收到短信提醒或推送消息。建议您在WiFi/3g/4g等良好网络下进行视频。
                        </div>
                        <div v-for="(item,index) in waitingList" :key="index" class="waiting-item">
                                <flexbox orient="vertical" class="waiting-info-flexbox">
                                <flexbox-item>
                                    <flexbox justify="space-around" align="flex-start">
                                        <flexbox-item class="fontsize3 color-333 lineEllipsis">{{item.doctorName}}<span class="fontsize-1 color-999 marginLeft6">{{item.department}}</span></flexbox-item>
                                        <flexbox-item class="textAlignRight" :span="1/3">        
                                            <x-button mini plain type="primary" v-if="item.consultStatus==10" @click.native='reUndiagnose(item)'>重新候诊</x-button>
                                            <x-button mini plain class="theme_default_999" v-else-if="!(item.refundStatus==0||item.refundStatus==1||item.refundStatus==2)" @click.native="cancelConsult(item)">取消预约</x-button>
                                        </flexbox-item>
                                    </flexbox>
                                </flexbox-item>
                                <flexbox-item class="fontsize0 color-666">{{item.scheduleDate}}<span v-if="item.timeType==0">上午</span><span v-else-if="item.timeType==1">下午</span><span v-else>晚上</span></flexbox-item>
                                <flexbox-item class="fontsize0 color-333"><span v-if="item.consultStatus==10">您已过号</span></flexbox-item>
                            </flexbox>
                            <div class="bottom-tool fontsize2 color-666 textAlignCenter" @click="openVideo(item)" v-if="item.consultStatus==4&&!(item.refundStatus==0||item.refundStatus==1)&&item.scheduleDate==currentdate"><i class="video"></i>打开视频</div>
                            <div class="bottom-tool fontsize2 color-666 textAlignCenter"  v-else><i class="video video-disabled"></i>打开视频</div>
                        </div>
                        <load-more :tip="loadWord" :show-loading="showLoadMore"></load-more>
                    </div>
                    <div v-if="waitingList.length == 0" class="have-no-queue">
                        <img src="../../assets/img/waitingroom_noqueue.png" class="waitingqueue-nodata" />
                        <div class="nodata-text">还没有叫号信息</div>
                        <span class="link fontsize1" @click="$router.push('/section/sectionList')">立即挂号<i class="linkto-icon"></i></span>
                    </div>
                </div>
            </scroller>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import '@/assets/less/waitingRoom.less'
import { Flexbox, FlexboxItem, XButton,dateFormat, Scroller, LoadMore ,Loading, TransferDomDirective as TransferDom } from 'vux'
import {post,get,del,put} from '../../request/config.js'
export default {
    data() {
        return {
            waitingList: [],
            pageNum:1,
            pageSize:10,
            consultStatus:'4,10',
            currentdate:'',
            onFetching:false,
            showLoading:false,
            showLoadMore:false,
            pageNum:1,
            total:null,
            keyword:'',
            loadWord:'下拉加载更多...',          
        }
    },
    directives: {
        TransferDom
    },
    components: {
        Flexbox,
        FlexboxItem,
        XButton,
        Scroller, 
        LoadMore,
        Loading
    },
    filters: {
        dateFormat
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});

        let params={
            url:sessionStorage.getItem('href')+"?action=none"
        }
        console.log(params,'parms')
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
        this.currentdate=dateFormat(new Date(), 'YYYY-MM-DD');
        this.getWaitingList();
    },
    methods:{
        getWaitingList(){
            this.showLoading=true
            let requestData={
                token:sessionStorage.getItem('token'),
                consultStatus:this.consultStatus,
                isCancel:0,
                pageNum:this.pageNum,
                pageSize:this.pageSize
            }
            console.log('requestdata',requestData);
            post('/appPatient/getPatientListByStatus.htm',requestData,'query').then(res=>{
                console.log('res',res)
                if(res.data.ret_code==0){
                    console.log(res.data.ret_data.list)
                    if(this.pageNum>1){
                        this.waitingList=this.waitingList.concat(res.data.ret_data.list);
                    }else
                        this.waitingList=res.data.ret_data.list; 
                    // res.data.ret_data.list.forEach(ele => {
                    //     this.waitingList.push(ele)
                    // })
                    this.total=res.data.ret_data.total;
                    this.onFetching = false
                    this.loadWord = parseInt(res.data.ret_data.total)>this.waitingList.length?'下拉加载更多':'没有更多'
                    
                }else{
                    console.log("ret_info",res.data.ret_info)
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log('err',err);
            })
        },
        cancelConsult(item){
             this.$router.push('/videoInterrogation/cancelOrder?consult_id='+encodeURIComponent(item.consult_id));
        },
        reUndiagnose(item){
            let self=this
            post('/applyDoctor/reUndiagnose.htm',{consult_id:item.consult_id,token:sessionStorage.getItem('token')},'query').then(res=>{
                console.log('res',res);
                if(res.data.ret_code==0){
                    console.log('info',res.data.ret_info)
                    self.getWaitingList()
                }else{
                    console.log('info',res.data.ret_info)
                }
            }).catch(err=>{
                console.log('err',err);
            })
        },
        openVideo(item){
            post('/patient/getPhoneVideoUrlGet.htm?type=1&consultId='+item.consult_id).then(res=>{
                console.log('getPhoneVideoUrlGet',res)
                if(res.data.ret_code==0){
                    let obj=res.data.ret_data
                    let params={
                        v1:obj.v1,
                        v2:obj.v2,
                        v3:obj.v3,
                        v4:obj.v4,
                        v5:obj.v5,
                        v6:obj.v6,
                        v7:obj.v7,
                        v8:obj.v8,
                        v9:obj.v9,
                        classid:obj.classId,
                        phone:"",
                        token:"",
                        api_url:"",
                        doctor_phone:""
                    }
                    rbk.platform.callPlugin("NativeFunctionPlugins", "PluginVideoArrayArgu",params, function() {});
                }else{
                    console.log('info',res.data.ret_info)
                }
            })
        },
        
        onScrollBottom(){
            if (this.onFetching) {
            } else {
                if(parseInt(this.total)>this.waitingList.length){
                    this.loadWord = '加载中...'
                    this.onFetching = true
                    setTimeout(() => {
                        this.pageNum += 1;
                        this.getWaitingList();
                    }, 500)
                }
            }
        }
    }

}
</script>

