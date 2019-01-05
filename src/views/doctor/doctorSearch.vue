<template>
    <div class="search_content relative height100">
        <div class="height100">
            <div class="fixed width100 left0 top0 clear" style="height:48px;">
                <search v-model="keyword" @on-clear="onClear" @on-cancel="onCancel" @on-submit="onSubmit" ref="search" placeholder="搜索医生" ></search>
            </div>
            <div style="padding-top:58px;height:100%">
                <div class="doc_result">
                    <scroller lock-x height="100%" @on-scroll-bottom="onScrollBottom" ref="scrollerBottom" :scroll-bottom-offst="100">
                        <div>  
                            <div v-if="results.length==0">
                                <div class="textAlignCenter paddingtop50">
                                    <img src="../../assets/img/search_noDoc.png" width="160"/>
                                    <p class="margintop20" style="color:#6C7D8F">未查询到相关医生</p>
                                </div>
                            </div>
                            <div v-if="results.length>0">
                                <div class="doc_wrap vux-1px-b" v-for="item in results" :key="item.id" @click="onDoctorClick(item)">
                                    <img class="doc_avatar" :src="getDoctorPhoto(item.doctorPhoto)"/>
                                    <div class="doc_info">
                                        <span class="doc_name">{{item.doctorName}}</span>
                                        <span v-if="item.doctorPosition" class="vux-1px-r">{{item.doctorPosition}}</span>
                                        <span>{{item.department}}</span>
                                    </div>
                                    <!-- <div class="doc_price">
                                        <img class="inlineMiddle" src="../../assets/img/search_video.png" width="15"/>
                                        <span class="inlineMiddle">{{item.price/100}}元/次</span>
                                    </div>-->
                                    <p class="dec_gift margintop10">擅长：{{item.specialTech}}</p>               
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
import { Search, Scroller, LoadMore,Loading,TransferDomDirective as TransferDom } from 'vux'
import {post,get,del,put,getDoctorImage} from '../../request/config.js'
export default {
    directives: {
        TransferDom
    },
  components: { Search, Scroller, LoadMore,Loading },
  data () {
    return {
        showLoadMore:false,
        showLoading:false,
        results:[],
        onFetching:false,
        pageNum:1,
        total:0,
        keyword:'',
        loadWord:'下拉加载更多...'
    }
  },
    methods:{
        //getResult(){},
        //onFocus(){},
        onClear(){
            this.keyword=''
            this.pageNum = 1
            this.results = [];
            this.getList().then( () => {
                this.$refs.scrollerBottom.reset({top: 0})
            });
        },
        onCancel(){
            this.keyword=''
            this.pageNum = 1
            this.results = [];
            // this.getList().then( () => {
            //     this.$refs.scrollerBottom.reset({top: 0})
            // });
            this.getList().then( () => {
                this.$refs.scrollerBottom.reset({top: 0})
            });
        },
        onSubmit(val){
            //this.getList(this.value,1)
            this.pageNum = 1
            this.results = [];
            this.getList().then( () => {
                this.$refs.scrollerBottom.reset({top: 0})
            });
        },
        getList(){
            return new Promise( (resolve,reject) => {
                this.showLoading=true
                post('/appSchedule/getAWeekScheduleList.htm',{
                    token:sessionStorage.getItem('token'),
                    doctorName:this.keyword,
                    pageNum:this.pageNum,
                    pageSize:10,
                    distinctDoctor:1
                    },'query').then( res => {
                    if(res.data.ret_code==0){  
                        if(this.pageNum>1){
                            this.results=this.results.concat(res.data.ret_data.list);
                        }else
                            this.results=res.data.ret_data.list;     
                        // res.data.ret_data.list.forEach( ele => {
                        //     this.results.push(ele);
                        // })
                        this.total = res.data.ret_data.total                       
                        this.loadWord = parseInt(res.data.ret_data.total)>this.results.length?'下拉加载更多':'没有更多'
                        this.onFetching = false
                        console.log('results',this.results)
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
        onDoctorClick(item){
            this.$router.push('/doctor/doctorIndex?doctorId='+item.doctorId+'&unionId='+item.unionId+'&hospitalId='+item.hospitalId+'&fromPage=doctorSearch')
        },
        onScrollBottom(){
            if (this.onFetching) {
            } else {
                if(parseInt(this.total)>this.results.length){
                    console.log("加载中...")
                    this.loadWord = '加载中...'
                    this.onFetching = true
                    setTimeout(() => {
                        this.pageNum += 1;
                        this.getList();
                    }, 500)
                }
            }
        },
        getDoctorPhoto(val){
            return getDoctorImage(val)
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
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
        // this.getList();
        this.onClear();
    }
}
</script>
