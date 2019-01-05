<template>
    <div class="history_content width100 height100 absolute top0 bottom0" style="padding:54px 0 62px 0;">
            <div class="absolute top0 left0 width100" style="z-index:10">
                <tab custom-bar-width="50px" :line-width="3" class="vux-1px-b">
                    <tab-item class="vux-1px-r" :selected="select==0" @on-item-click="changeTab(0)">既往史</tab-item>
                    <tab-item :selected="select==1" @on-item-click="changeTab(1)">过敏史</tab-item>
                </tab>
            </div>
            <div class="height100 paddingbottom10 scrollY" v-if="pastMedicalList.length > 0">
                <div class="bgcolor-white paddingleft15">
                    <div v-if="select == 0">
                        <checker v-model="pastContent" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                            <div class="vux-1px-b" v-for="(item,index) in pastMedicalList" :key="index">
                                <p class="fontsize2 color-666 padding15X">{{item.viceCategoryName}}</p>
                                    <checker-item  v-for="(childItem,childIndex) in item.content" :key="childIndex" :value="childItem">{{childItem}}</checker-item>
                                    
                                <!-- <div v-if="item.viceCategoryName == '疾病史'">
                                    <p class="fontsize2 color-666 padding15X">疾病史</p>
                                    <checker v-if="item.content.length > 0" v-model="value1" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                                        <checker-item v-for="(childItem,childIndex) in item.content" :key="childIndex" :value="childItem">{{childItem}}</checker-item>
                                    </checker>
                                </div>
                                <div v-if="item.viceCategoryName == '传染病'">
                                    <p class="fontsize2 color-666 padding15X">传染病</p>
                                    <checker v-if="item.content.length > 0" v-model="value2" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                                        <checker-item v-for="(childItem,childIndex) in item.content" :key="childIndex" :value="childItem">{{childItem}}</checker-item>
                                    </checker>
                                </div>
                                <div v-if="item.viceCategoryName == '手术史'">
                                    <p class="fontsize2 color-666 padding15X">手术史</p>
                                    <checker v-if="item.content.length > 0" v-model="value3" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                                        <checker-item v-for="(childItem,childIndex) in item.content" :key="childIndex" :value="childItem">{{childItem}}</checker-item>
                                    </checker>
                                </div> -->
                            </div>
                        </checker>

                        <div class="vux-1px-b">
                            <group class="over">
                                <x-textarea v-model.trim="otherPastHistory" :max="200" placeholder="补充其他既往史" :rows="6"></x-textarea>
                            </group>
                        </div>
                    </div>
                    <div  v-if="select == 1">
                        <checker v-model="allergicContent" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                            <div class="vux-1px-b" v-for="(item,index) in allergicList" :key="index">
                                <p class="fontsize2 color-666 padding15X">{{item.viceCategoryName}}</p>
                                    <checker-item v-for="(childItem,childIndex) in item.content" :key="childIndex" :value="childItem">{{childItem}}</checker-item>
                            
                        <!--  <div v-if="item.viceCategoryName == '药物过敏'">
                                <p class="fontsize2 color-666 padding15X">药物过敏</p>
                                <checker v-if="item.content.length > 0" v-model="value4" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                                    <checker-item v-for="(childItem,childIndex) in item.content" :key="childIndex" :value="childItem">{{childItem}}</checker-item>
                                </checker>
                            </div>
                            <div v-if="item.viceCategoryName == '食物过敏'">
                                <p class="fontsize2 color-666 padding15X">食物过敏</p>
                                <checker v-if="item.content.length > 0" v-model="value5" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                                    <checker-item v-for="(childItem,childIndex) in item.content" :key="childIndex" :value="childItem">{{childItem}}</checker-item>
                                </checker>
                            </div> -->
                            </div>
                        </checker>

                        <div class="vux-1px-b">
                            <group class="over">
                                <x-textarea v-model.trim="otherAllergic"  :max="200" placeholder="补充其他过敏史..." :rows="6"></x-textarea>
                            </group>
                        </div>
                    </div>
                </div>
            </div>
            <div class=" absolute vux-1px-t width100 paddingX20 padding10X bottom0 left0 bgcolor-white" style="z-index:10;">
                <x-button type="primary" @click.native="saveHistory">保存</x-button>
            </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { Tab, TabItem, Checker, CheckerItem, Group, XTextarea, XButton,Loading, TransferDomDirective as TransferDom} from 'vux'
import {post,get,del,put} from '../../request/config.js'
export default {
    directives: {
        TransferDom
    },
  components: { Tab, TabItem, Checker, CheckerItem, Group, XTextarea, XButton,Loading},
  data () {
    return {
        otherPastHistory:"",
        otherAllergic:"",
        pastContent:[],
        allergicContent:[],
        select:this.$route.query.select,
        pastMedicalList:[],
        allergicList:[],
        patientId:this.$route.query.select,
        showLoading:false
    }
  },
  watch:{
    otherPastHistory:function(newvalue,oldvalue){
        var regStr = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
        if(regStr.test(newvalue)){
            this.otherPastHistory=newvalue.replace(regStr,"");
        }
    },
    otherAllergic:function(newvalue,oldvalue){
        var regStr = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
        if(regStr.test(newvalue)){
            this.otherAllergic=newvalue.replace(regStr,"");
        }
    }
  },
    methods:{
        changeTab(i){
            this.select = i;
        },
        getPastHistory(){
            post('/patient/getMedicalHistoryList.htm',{mainId:1},'query').then(res=>{
                if(res.data.ret_code==0){
                    this.pastMedicalList=res.data.ret_data;
                    }else{
                        console.log("ret_info",res.data.ret_info)
                    }
            }).catch(err=>{
                console.log('err',err);
            })
        },
        getAllergicHistory(){
            post('/patient/getMedicalHistoryList.htm',{mainId:3},'query').then(res=>{
                if(res.data.ret_code==0){
                    this.allergicList=res.data.ret_data;
                    }else{
                        console.log("ret_info",res.data.ret_info)
                    }
                }).catch(err=>{
                console.log('err',err);
            })
        },
        getPatientDetail(){
            if(this.$route.query.patientId){
                post('/patient/getDetailById.htm',{token:sessionStorage.getItem('token'),patientId:this.$route.query.patientId},'query').then(res=>{
                    if(res.data.ret_code==0){
                         console.log(res.data)
                         let data=res.data.ret_data;
                         if(sessionStorage.getItem('selectedHistory')||sessionStorage.getItem('applyHistory')){
                            let history={};
                            if(this.$route.query.fromPage=='videoApply')
                                history=JSON.parse(sessionStorage.getItem('applyHistory'));
                            else
                                history=JSON.parse(sessionStorage.getItem('selectedHistory'));
                            console.log('history',history);
                            if(history!=null){
                                this.pastContent = (history.pastContent == "")?[]:history.pastContent.split(",");
                                this.otherPastHistory=history.pastExtra;
                                
                                this.allergicContent = (history.allergicContent == "")?[]:history.allergicContent.split(",");
                                this.otherAllergic=history.allergicExtra;
                            }
                        }else{
                            let pastStr=data.patientMedicalHistory.pastMedicalHistory;
                            this.pastContent = (pastStr == "无"||pastStr == "")?[]:pastStr.split(",");
                            this.otherPastHistory=data.patientMedicalHistory.pastMedicalHistoryExtra;
                            
                            let allergicStr=data.patientMedicalHistory.allergicHistory;
                            this.allergicContent = (allergicStr == "无"||allergicStr == "")?[]:allergicStr.split(",");
                            this.otherAllergic=data.patientMedicalHistory.allergicHistoryExtra;
                        }    
                    }else{
                        console.log("ret_info",res.data.ret_info)
                    }
                }).catch(err=>{
                    this.showLoading=false
                    console.log('err',err);
                })
            }else{
                if(sessionStorage.getItem('selectedHistory')||sessionStorage.getItem('applyHistory')){
                    let history={};
                    if(this.$route.query.fromPage=='videoApply')
                        history=JSON.parse(sessionStorage.getItem('applyHistory'));
                    else
                        history=JSON.parse(sessionStorage.getItem('selectedHistory'));
                    console.log('history',history);
                    if(history!=null){
                        this.pastContent = (history.pastContent == "")?[]:history.pastContent.split(",");
                        this.otherPastHistory=history.pastExtra;
                        
                        this.allergicContent = (history.allergicContent == "")?[]:history.allergicContent.split(",");
                        this.otherAllergic=history.allergicExtra;
                    }
                }
            }
            this.showLoading=false   
        },
        saveHistory(){
            sessionStorage.setItem('isChangeHistory',1);
            let history={
                pastContent : this.pastContent.toString(),
                pastExtra:this.otherPastHistory,
                allergicContent : this.allergicContent.toString(),
                allergicExtra:this.otherAllergic
            }
            console.log(history,'save history')                  
            if(this.$route.query.fromPage=='videoApply'){
                sessionStorage.setItem('applyHistory',JSON.stringify(history));    
                // this.$router.push('/videoInterrogation/videoApply');
            }
            if(this.$route.query.fromPage=='addVisitor'){
                sessionStorage.setItem('selectedHistory',JSON.stringify(history));    
                // this.$router.push('/visitor/addVisitor?token='+sessionStorage.getItem('token'));
            }
            if(this.$route.query.fromPage=='editVisitor'){
                sessionStorage.setItem('selectedHistory',JSON.stringify(history));    
                // this.$router.push('/visitor/editVisitor?token='+sessionStorage.getItem('token')+'&patientId='+this.$route.query.patientId);
            }
            window.history.go(-1);  
        },
    },
    
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        this.showLoading=true
        this.getPastHistory();
        this.getAllergicHistory();
        this.getPatientDetail();
    },
}
</script>
<style scoped lang="less">
    .section_content{
        font-size:0;
    }
</style>
