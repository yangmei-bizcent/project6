<template>
    <div class="order_content">
        <ul class="order_list">
            <li><span @click="onTabClick(1)" :class="{active:tabStatus == 1}">全部</span></li>
            <li><span @click="onTabClick(2)" :class="{active:tabStatus == 2}">待支付</span></li>
            <li><span @click="onTabClick(3)" :class="{active:tabStatus == 3}">未就诊</span></li>
            <li><span @click="onTabClick(4)" :class="{active:tabStatus == 4}">已就诊</span></li>
        </ul>
        <div style="height:100%">
        <scroller lock-x height="-44px" @on-scroll-bottom="onScrollBottom" ref="scrollerBottom" :scroll-bottom-offst="20">
            <div>
                <div class="order_item" v-for="(item,i) in data" :key="i" @click="goto(item)">
                    <div class="item_top">
                        <span class="floatLeft">{{dateTimeFormat((item.createTime).replace(/\-/g, "/"))}}</span>
                        <span class="floatRight" v-if="item.isCancel==1||(item.isCancel==0&&(item.refundStatus==0||item.refundStatus==1))">已取消</span>                      
                        <span class="floatRight light" v-else-if="item.isCancel==0&&item.consultStatus==2">待支付</span>
                        <span class="floatRight" v-else-if="item.isCancel==0&&item.consultStatus==4">未就诊</span>
                        <span class="floatRight" v-else-if="item.isCancel==0&&item.consultStatus==6">已就诊</span>
                        <span class="floatRight" v-else-if="item.isCancel==0&&item.consultStatus==8">支付超时</span>
                        <span class="floatRight" v-else-if="item.isCancel==0&&item.consultStatus==9">待报告</span>
                        <span class="floatRight" v-else-if="item.isCancel==0&&item.consultStatus==10">已过号</span>
                        <span class="floatRight" v-else-if="item.isCancel==0&&item.consultStatus==11">已过期</span>
                    </div>
                    <div class="vux-1px-t item_mid">
                        <img class="absolute left0 top12 borderRadius50 clear" :src="getDoctorPhoto(item.doctorPhoto)" width="46" height="46"/>
                        <!-- <span v-if="item.isCancel==0&&item.consultStatus==2" class="absolute right0 top12">
                            <button class="orange_btn" @click.native="Pay(item.consult_id)">立即支付</button>
                        </span> -->
                        <span class="absolute right0 top12">
                            <button class="blue_btn floatRight" v-if="item.isCancel==0&&item.type!=null&&item.consultStatus==6">检查检验</button>
                            <button class="blue_btn floatRight marginright5" v-if="item.isCancel==0&&item.hasRecipe==1&&item.consultStatus==6">处方</button>
                        </span>
                        <div>
                            <p class="lineheight20 width100 lineEllipsis">
                                <span class="fontsize2 color-333">{{item.doctorName}}</span>
                                <span class="fontsize0 color-666">{{item.doctorPosition}}</span>
                            </p>
                            <p class="width100 fontsize0 color-999 lineEllipsis margintop5 lineheight20">{{item.department}}</p>
                        </div>
                    </div>
                    <div class="item_bot">
                        <table class="width100% fontsize0 padding10X">
                            <tr class="lineheight25">
                                <td class="color-666" width="70">就诊时间</td>
                                <td class="color-666">{{item.scheduleDate}}</td>
                                <td class="color-333">{{getScheduleTime(item)}}</td>
                            </tr>
                            <tr class="lineheight25">
                                <td class="color-666" width="70">挂号费</td>
                                <td class="color-333">{{item.preferentialPrice/100}}元</td>
                            </tr>
                        </table>
                    </div>
                </div>
                <load-more :tip="parseInt(total)>data.length?'加载更多':'没有更多'" :show-loading="showLoadMore"></load-more>
            </div>
        </scroller>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { Scroller, LoadMore, dateFormat,Loading,ToastPlugin, TransferDomDirective as TransferDom } from 'vux'
import {post,get,del,put,userCenterGet,getDoctorImage} from '../../request/config.js'
import Vue from 'vue'
Vue.use(ToastPlugin)  
export default {
  directives: {
    TransferDom
  },
  components: { Scroller, LoadMore,dateFormat,Loading  },
  data () {
    return {
        tabStatus:1,
        onFetching:false,  //状态字段  滚动加载更多的方法会执行很多遍
        showLoadMore:false,
        showLoading:false,
        total:20,
        pageNum:1,
        data:[]
    }
  },
    methods:{
        onScrollBottom(){
            if (this.onFetching) {
            } else {
                if(parseInt(this.total)>this.data.length){
                    this.onFetching = true
                    setTimeout(() => {
                        this.pageNum += 1;
                        this.getList();
                    }, 500)
                }
            }
        },
        getList(){
            let self=this
            this.showLoading=true
            post('/appPatient/getPatientListByStatus.htm',{
                token:sessionStorage.getItem('token'),
                consultStatus:this.orderStatus,
                pageNum:this.pageNum,
                pageSize:10
            }).then(res=>{
                if(res.data.ret_code==0){
                    if(this.pageNum>1){
                        self.data=self.data.concat(res.data.ret_data.list);
                    }else
                        self.data=res.data.ret_data.list;  
                    // res.data.ret_data.list.forEach( ele => {
                    //     self.data.push(ele);
                    // })
                    self.total = res.data.ret_data.total;
                    this.onFetching = false;
                    console.log('res.data.ret_data.list',res.data.ret_data.list)
                }else{
                    console.log(res.data.ret_info)
                }
                this.showLoading=false;
            }).catch(err=>{
                this.showLoading=false
                console.log(err,'err')
            })
        },
        onTabClick(val){
            if(val==2)      //待支付
                this.orderStatus='2'
            else if(val==3) //未就诊
                this.orderStatus='4,10'
            else if(val==4) //已就诊
                this.orderStatus='6'
            else            //全部
                this.orderStatus=''
            this.tabStatus=val
            this.pageNum=1
            this.data=[]
            this.total=0
            this.$nextTick(() => {
                this.$refs.scrollerBottom.reset({top: 0})
            })
            this.getList()
        },
        getScheduleTime(val){
            let txt
            if(val.timeType==0)
                txt='上午'
            else if(val.timeType==1)
                txt='下午'
            else
                txt='晚上'
            return txt+' '+val.startTime+'-'+val.endTime
            // if(val==0)
            //     return '上午 09:00-12:00'
            // else
            //     return '下午 12:00-18:00'
        },
        dateTimeFormat(val){
            let date=new Date(val);
            return dateFormat (date,'MM-DD HH:mm')
        },
        goto(val){
            if(val.isCancel==0&&val.consultStatus==6)
                this.$router.push('/diagnosReport/diagnosReport?consult_id='+encodeURIComponent(val.consult_id))
            else
                this.$router.push('/order/orderDetail?consult_id='+encodeURIComponent(val.consult_id))
        },
        getDoctorPhoto(val){
            return getDoctorImage(val)
        },
        Pay(val){
            post('/common/consultlist.htm',{
                consult_id:val,
                payType:4,   //支付方式。0微信，1支付宝，2线下，4 app微信支付
                returnPageUrl:sessionStorage.getItem('href')+'order/orderRecorder'
                //returnPageUrl:sessionStorage.getItem('href')+'order/orderDetail?consult_id='+encodeURIComponent(this.consult_id)
            }).then(res=>{
                console.log(res,'res')
                if(res.data.ret_code==0){    
                    window.location.href=res.data.ret_data.payUrl
                    console.log('payUrl',this.payUrl)
                }else{
                    this.$vux.toast.show({
                        text: "支付失败，请稍候再试",
                        type: 'text',
                    })
                }
            })
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
        console.log(params,'parms')
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});

        this.$nextTick(() => {
            this.$refs.scrollerBottom.reset({top: 0})
        })
        this.onTabClick(1)      
    },
}
</script>
<style lang="less" scoped>
    .order_content{
        height:100%;
        position:relative;
        padding-top:44px;
        box-sizing:border-box;
        .order_list{
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:44px;
            line-height:44px;
            background:#fff;
            box-shadow: 0 3px 3px #eee;
            list-style:none;
            overflow:hidden;
            z-index:10;
            li{
                float:left;
                width:25%;
                font-size:15px;
                text-align:center;
                list-style:none;
                .active{
                    color:#4185F3;
                }
            }
        }
        .order_item{
            margin-top:8px;
            padding:0 14px;
            background:#fff;
            .item_top{
                height:44px;
                line-height:44px;
                color:#999; 
                font-size:15px; 
                overflow:hidden;
            }
            .top12{
                top:12px;
            }
            .light{
                color:#FF7B35;
            }
            .item_mid{
                position:relative;
                min-height:70px;
                padding:12px 105px 12px 60px;
            }
            .orange_btn{
                font-size:12px;
                padding:5px 10px;
                color:#fff;
                background:#FF7B35;
                border-radius:4px;
                border:0;
            }
            .blue_btn{
                font-size:12px;
                padding:3px 6px;
                color:#4185F3;
                border-radius:3px;
                border:1px solid #4185F3;
                background:#fff;
            }
            .item_bot{
                border-top:1px dashed #E2E2E2;
            }
        }
    }
</style>
