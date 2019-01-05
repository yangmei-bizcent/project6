<template>
    <div class="page-container page-orderdetail height100 width100 absolute top0 bottom0" style="padding-bottom:62px">
        <div class="height100 paddingbottom10 scrollY">
            <div class="notice-container fontsize0 textAlignCenter">
                <div>订单状态：{{ orderStateText }}</div>
                <div>{{ orderStateTextDetail }}</div>
                <div class="color-999">{{ hotlineNotice }}</div>
            </div>
            <flexbox class="order-doctor-info bgcolor-white">
                <flexbox-item>
                    <div class="cell-block">
                        <img :src="getDoctorPhoto(consultDoctors.doctorPhoto)" class="doctor-img" />
                    </div>
                    <div class="cell-block">
                        <flexbox orient="vertical">
                            <flexbox-item class="fontsize2 color-333">{{consultDoctors.doctorName}}<span class="fontsize0 color-666">&nbsp;&nbsp;{{consultDoctors.doctorPosition}}</span></flexbox-item>
                            <flexbox-item class="fontsize0 color-999 margintop0">{{consultDoctors.doctorDepartment}}<span class="marginleft15">{{consultDoctors.hospitalName}}</span></flexbox-item>
                        </flexbox>
                    </div>
                </flexbox-item>
            </flexbox>
            <div class="order-panel base-info-panel bgcolor-white fontsize2">
                <div>
                    <table>
                        <tr>
                            <td class="color-666">挂号费</td>
                            <td class="color-333 paddingleft10" align="right">{{consult.preferentialPrice/100}}元</td>
                        </tr>
                        <tr>
                            <td class="color-666">就诊日期</td>
                            <td class="color-333 paddingleft10" align="right">{{schedule.scheduleDate}}&nbsp;{{schedule.timeType==0?'上午':'下午'}}</td>
                        </tr>
                    </table>
                </div>
                <div class="panel-content-bottom">
                    <table>
                        <tr>
                            <td class="color-666">姓<span class="marginleft-2em">名</span></td>
                            <td class="color-333 paddingleft10" align="right">{{consultPatient.name}}</td>
                        </tr>
                        <tr>
                            <td class="color-666">性<span class="marginleft-2em">别</span></td>
                            <td class="color-333 paddingleft10" align="right">{{consultPatient.sex}}</td>
                        </tr>
                        <tr>
                            <td class="color-666">年<span class="marginleft-2em">龄</span></td>
                            <td class="color-333 paddingleft10" align="right">{{consultPatient.age}}岁</td>
                        </tr>
                        <tr>
                            <td class="color-666">身份证号</td>
                            <td class="color-333 paddingleft10" align="right">{{getIDCardText(consultPatient.idCard)}}</td>
                        </tr>
                        <tr>
                            <td class="color-666">就诊卡号</td>
                            <td class="color-333 paddingleft10" align="right">{{consultPatient.treatmentCard?consultPatient.treatmentCard:'暂无就诊卡号'}}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="order-panel bgcolor-white fontsize2">
                <dl class="paddingtop15">
                    <dt class="color-333">病情描述</dt>
                    <dd class="color-666">{{consultPatient.casePresentation?consultPatient.casePresentation:'无'}}</dd>
                    <dt class="color-333">既往史</dt>
                    <dd class="color-666">{{consultPatient.pastIllnessHistory?stringSub(consultPatient.pastIllnessHistory):'无'}}
                        <!-- <span v-for="(item, index) in diseaseHistory" :key="index">{{ item }}{{index==diseaseHistory.length-1?'':'/'}}</span> -->
                    </dd>
                    <dt class="color-333">过敏史</dt>
                    <dd class="color-666">{{consultPatient.allergicHistory?stringSub(consultPatient.allergicHistory):'无'}}
                        <!-- <span v-for="(item, index) in allergyHistory" :key="index">{{ item }}{{index==allergyHistory.length-1?'':'/'}}</span> -->
                    </dd>
                    <dt class="color-333">图文资料</dt>
                    <dd class="color-666">
                        <div v-if="consult.files.length!=0">
                            <flexbox :gutter="0" wrap="wrap">
                                <flexbox-item :span="1/3" v-for="(item, index) in consult.files" :key="index">
                                    <img :src="item.url" class="diseaseImg"  @click="show(index)" />
                                </flexbox-item>
                            </flexbox>
                        </div>
                        <div v-if="consult.files.length==0">
                            无
                        </div>
                    </dd>
                </dl>
            </div>
        </div>
        <div class="absolute bottom0 left0 bgcolor-white width100">
            <div v-if="bottomToolShow" class="paddingX20 padding10X vux-1px-t">
                <flexbox>
                    <flexbox-item v-if="orderState==1">
                        <!-- <a :href="payUrl" target="_blank"> -->
                            <x-button type="primary" class="theme_ff7b35" @click.native="toPay">前去支付</x-button>
                        <!-- </a> -->
                    </flexbox-item>
                    <flexbox-item v-if="orderState==3||orderState==8||orderState==11">
                        <x-button type="default" :disabled='!(this.consult.refundStatus==undefined)' @click.native="$router.push({path:'/videoInterrogation/cancelOrder',query:{consult_id:encodeURIComponent(consult.consult_id)}})">取消并退款</x-button>
                    </flexbox-item>
                    <flexbox-item v-if="orderState==3||orderState==8||orderState==11">
                        <x-button type="primary" @click.native="$router.push({path:'/waitingRoom/waitingRoom',query:{token:token}})">进入候诊间</x-button>
                    </flexbox-item>
                </flexbox>
            </div>
        </div>
        <div v-transfer-dom>
            <previewer :list="imglist" ref="previewer" :options="options" @on-index-change="logIndexChange"></previewer>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import '@/assets/less/orderDetail.less'
import { Flexbox, FlexboxItem, XButton,dateFormat,Loading,ToastPlugin,TransferDomDirective as TransferDom,Previewer   } from 'vux'
import {post,get,del,put,userCenterGet,getDoctorImage} from '../../request/config.js'
import Vue from 'vue'
Vue.use(ToastPlugin)    
export default {
    data() {
        return {
            bottomToolShow: false,  //底部工具栏是否显示
            orderState: null,  // 待支付1，支付超时2，未就诊3，已就诊4，已过期5，申请退款6，同意退款7，拒绝退款8，退款成功9，退款失败10，
            orderStateText: '',
            orderStateTextDetail: '',
            hotlineNotice: '',
            orderInfo:'',
            diagnose:'',
            consult:{
                files:[]
            },
            consultDoctors:'',
            consultPatient:'',
            schedule:'',
            token:sessionStorage.getItem('token'),
            payUrl:'',
            consult_id:decodeURIComponent(this.$route.query.consult_id),
            consultTime:'',
            minites:'20',
            seconds:'00',
            payTimeStr:'00:00:00',
            showLoading:false,
            imglist:[],
            options: {
                getThumbBoundsFn (index) {
                // find thumbnail element
                let thumbnail = document.querySelectorAll('.diseaseImg')[index]
                // get window scroll Y
                let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
                // optionally get horizontal scroll
                // get position of element relative to viewport
                let rect = thumbnail.getBoundingClientRect()
                // w = width
                return {x: rect.left, y: rect.top + pageYScroll, w: rect.width}
                // Good guide on how to get element coordinates:
                // http://javascript.info/tutorial/coordinates
                }
            }
        }
    },
    directives: {
        TransferDom
    },
    components: {
        Flexbox,
        FlexboxItem,
        XButton,
        Loading,
        Previewer
    },
    filters: {
        dateFormat
    },
    mounted() {
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});

        let params={
            url:sessionStorage.getItem('href')+"order/orderRecorder"
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
        console.log('订单详情',this.consult_id)
        this.token=sessionStorage.getItem('token')
        this.getDetail()    
        //this.getPayUrl();     
    },
    methods:{
        getDetail(){
            let _this=this;
            this.showLoading=true
            post('/patient/getConsultDetail.htm',{
                token:sessionStorage.getItem('token'),
                consult_id:this.consult_id
            }).then(res=>{
                if(res.data.ret_code==0){                                                        
                    this.orderInfo=res.data.ret_data;
                    console.log('getConsultDetail',this.orderInfo)
                    this.diagnose=this.orderInfo.diagnose
                    this.consult=this.orderInfo.consult
                    //this.consultTime=dateFormat(parseInt(this.consult.payOrderCreateTime));、
                    for(let i in this.consult.consultDoctors){
                        if(this.consult.consultDoctors[i].doctorType==1){
                            this.consultDoctors=this.consult.consultDoctors[i]
                            break
                        }

                    } 
                    if(this.consult.files&&this.consult.files.length>0){
                        for(let i in this.consult.files){
                            let imgitem={
                                src:this.consult.files[i].url
                            }
                            this.imglist.push(imgitem);
                        }
                    }                
                    this.consultPatient=this.consult.consultPatient
                    if(!this.consult.schedule){
                        this.schedule={
                            scheduleDate:''
                        };
                        this.$vux.toast.show({
                            text: "详情获取失败",
                            type: 'text',
                        })
                        this.showLoading=false
                        history.go(-1)
                        return;
                    }
                    else
                        this.schedule=this.consult.schedule

                    if(this.consult.consultStatus==2){
                        this.getPayUrl();  
                    }
                    this.stateTrans()
                    this.changePageInfo(this.orderInfo)
                }else{
                    this.$vux.toast.show({
                        text: res.data.ret_info,
                        type: 'text',
                    })
                    console.log(res.data.ret_info)
                }
                this.showLoading=false
            }).catch(err=>{
                _this.showLoading=false
                _this.$vux.toast.show({
                    text: "支付平台调用失败",
                    type: 'text',
                })
                console.log(err,'err')
            })
        },
        getPayUrl(){
            post('/common/consultlist.htm',{
                consult_id:this.consult_id,
                payType:4,   //支付方式。0微信，1支付宝，2线下，4 app微信支付
                returnPageUrl:sessionStorage.getItem('href')+'order/orderRecorder'
                //returnPageUrl:sessionStorage.getItem('href')+'order/orderDetail?consult_id='+encodeURIComponent(this.consult_id)
            }).then(res=>{
                console.log(res,'res')
                if(res.data.ret_code==0){    
                    this.payUrl=res.data.ret_data.payUrl
                    console.log('payUrl',this.payUrl)
                }
                // }else{
                //     this.$vux.toast.show({
                //         text: "支付平台调用失败",
                //         type: 'text',
                //     })
                //     this.$router.replace('/order/orderDetail?consult_id='+encodeURIComponent(this.consult_id));
                //     console.log(res.data.ret_info)
                // }
            })
        },
        // 接口预约状态与页面预约状态转换
        stateTrans(){
            if(this.consult.refundStatus!=undefined){   //有退款相关操作
                switch(this.consult.refundStatus){
                    case 0: this.orderState=6;break;    //申请退款
                    case 1: this.orderState=7;break;    //同意退款
                    case 2: this.orderState=8;break;    //拒绝退款
                }
            }else{  //没有退款相关操作
                switch(this.consult.consultStatus){
                    //case 2: this.orderState=1;this.getDifferTime(this.consult.payOrderCreateTime);break;    //待支付
                    case 2: this.orderState=1;break;    //待支付
                    case 8: this.orderState=2;break;    //支付超时
                    case 4: this.orderState=3;break;    //未就诊
                    //case 10:this.orderState=3;break;    //未就诊(重新候诊)
                    case 10:this.orderState=11;break;    //已过号
                    case 6: this.orderState=4;break;    //已就诊
                    case 11:this.orderState=5;break;    //已过期(???)
                }

            }
        },
        changePageInfo(obj){
            var self = this;
            if(self.orderState==1 || self.orderState==3 || self.orderState==7 || self.orderState==8 || self.orderState==11) {
                self.bottomToolShow = true;
            }
            switch(self.orderState) {
                case 1:
                    self.orderStateText = '待支付';
                    //self.orderStateTextDetail = '请在 '+this.payTimeStr+' 内支付，超时自动失效！';
                    self.orderStateTextDetail = '请在20分钟内支付，超时自动失效！';
                    self.hotlineNotice = '';
                    break;
                case 2:
                    self.orderStateText = '支付超时';
                    self.orderStateTextDetail = '此订单20分钟内未支付，已自动取消！';
                    self.hotlineNotice = '';
                    break;
                case 3:
                    self.orderStateText = '未就诊';
                    self.orderStateTextDetail = '开始叫号后，将会有短信通知，请保持手机畅通！';
                    self.hotlineNotice = '';
                    break;
                case 4:
                    self.orderStateText = '已就诊';
                    self.orderStateTextDetail = '';
                    self.hotlineNotice = '';
                    break;
                case 5:
                    self.orderStateText = '已过期';
                    self.orderStateTextDetail = '您未及时就诊';
                    self.hotlineNotice = '';
                    break;
                case 6:
                    self.orderStateText = '申请退款';
                    self.orderStateTextDetail ='取消原因：'+obj.consult.reasonCancel;
                    self.hotlineNotice = '';
                    break;
                case 7:
                    self.orderStateText = '同意退款';
                    self.orderStateTextDetail = '';
                    self.hotlineNotice = '';
                    break;
                case 8:
                    self.orderStateText = '拒绝退款';
                    self.orderStateTextDetail = '拒绝原因：'+obj.consult.refundReason//'提交信息有误';
                    self.hotlineNotice = '如有疑问，可联系医院热线电话：400-800-8888';
                    break;
                // case 9:
                //     self.orderStateText = '退款成功';
                //     self.orderStateTextDetail = '';
                //     self.hotlineNotice = '';
                //     break;
                // case 10:
                //     self.orderStateText = '退款失败';
                //     self.orderStateTextDetail = '提交信息有误';
                //     self.hotlineNotice = '如有疑问，可联系医院热线电话：400-800-8888';
                //     break;
                case 11:
                    self.orderStateText = '已过号';
                    self.orderStateTextDetail = '请进入候诊间重新候诊';
                    self.hotlineNotice = '';
                    break;
            }
        },
        getIDCardText(val){
            if(val){
                let prefix=val.substring(0,4)
                let suffix=val.slice(val.length-4)
                let stars="**********"
                return prefix+stars+suffix
            }         
        },
        getDifferTime(paytime){
            let nowtime= new Date();
            let time=0;
            let minutes=20 * 60 * 1000 ;
            time=Number(paytime) + Number(minutes);
            let t=time-nowtime.getTime();
            let m = 0;
            let s = 0;
            let timeStr=this.payTimeStr;
            if(t > 0 ) 
            {
                m = Math.floor(t / 1000 / 60 % 60);
                s = Math.floor(t / 1000 % 60);
                this.payTimeStr=m+'分'+s+'秒';
                this.orderStateTextDetail = '请在 '+this.payTimeStr+' 内支付，超时自动失效！';
                t -= 1000;
                setTimeout(() => {
                    this.getDifferTime( paytime)
                }, 1000);
            } else {
                this.payTimeStr='00:00:00'
                this.orderState = 2
                this.changePageInfo()
            }
        },
        stringSub(val){
            if(val.indexOf(';')>=0){
                let index=val.indexOf(';');
                let contentStr=val.substring(0,index);
                let otherStr=val.slice(index+1);
                contentStr=contentStr.indexOf(',')>0?contentStr.replace(/,/g,'/'):contentStr;
                return (contentStr==''?'':contentStr+';')+otherStr;
            }
            else{
                return val.indexOf(',')>0?val.replace(/,/g,'/'):val;
            }
                
        },
        getDoctorPhoto(val){
            return getDoctorImage(val)
        },
        toPay(){
            if(!this.payUrl||this.payUrl==''){ 
                this.$vux.toast.show({
                    text: "支付失败，请稍候再试",
                    type: 'text',
                })
            }else
                window.location.href=this.payUrl;
        },
        show(index) {
            console.log(index,'index')
            this.$refs.previewer.show(index)
        },
        logIndexChange (arg) {
            console.log(arg,'arg')
        },
    }
}
</script>

