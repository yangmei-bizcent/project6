<template>
    <div class="page-container history_content">  
        <div class="bgcolor-white">
            <div class="textAlignCenter padding20X marginX15 vux-1px-b">
                <x-img :src="doctorPhoto" class="borderRadius50" width="70" height="70"/>
                <div>
                    <rater v-model="evaluateWhole" :max="5" active-color="#ffc933" :font-size="35" :margin="4" :disabled="!(!evaluteData)"></rater>
                    <p v-if="parseInt(evaluateWhole) == 0" class="aa color-666"></p>
                    <p v-if="parseInt(evaluateWhole) == 1" class="aa color-666">待改进</p>
                    <p v-if="parseInt(evaluateWhole) == 2" class="aa color-666">一般</p>
                    <p v-if="parseInt(evaluateWhole) == 3" class="aa color-666">还不错</p>
                    <p v-if="parseInt(evaluateWhole) == 4" class="aa color-666">很好</p>
                    <p v-if="parseInt(evaluateWhole) == 5" class="aa color-666">非常满意 </p>
                </div>
            </div>
            <div class="paddingX15 padding15X" v-if="evaluteData">
                <p v-if="evaluateText!=''" class="lineheight25 fontsize2 color-333">{{stringSub(evaluateText)}}</p>
                <p v-else class="lineheight25 fontsize2 color-333 textAlignCenter">暂无评价内容</p>
            </div>  
            <group class="over" v-if="!evaluteData">
                <x-textarea  v-model.trim="evaluateText" :max="200" placeholder="请输入对医生的评价" :rows="6" ></x-textarea>
            </group>
            <div style="padding:12px 14px 0" v-if="!evaluteData">
                <checker v-model="evaluteLabel" type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected" >
                    <checker-item value="亲切和蔼">亲切和蔼</checker-item>
                    <checker-item value="耐心细致">耐心细致</checker-item>
                    <checker-item value="经验丰富">经验丰富</checker-item>
                    <checker-item value="医术精湛">医术精湛</checker-item>
                    <checker-item value="医德高尚">医德高尚</checker-item>
                    <checker-item value="专业解答">专业解答</checker-item>
                    <checker-item value="认真负责">认真负责</checker-item>
                    <checker-item value="回复及时">回复及时</checker-item>
                </checker>
            </div>
            <div style="padding:12px 14px 0" v-if="evaluteData&&evaluteLabel.length>0">
                <checker  v-model="evaluteLabel"  type="checkbox" default-item-class="checker-item" selected-item-class="checker-item-selected">
                    <checker-item disabled v-for="(item,index) in evaluteLabel" :key="index" :value="item">{{item}}</checker-item>
                </checker>
            </div>
        </div> 
        <div class="width100 paddingX20 padding20X margintop50" v-if="!evaluteData">
            <x-button id='aa' type="primary" class="btn-blue" @click.native='addEvaluate' :disabled="evaluateWhole==0">提交评价</x-button>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>
<script>
import { XImg,XButton,Rater,XTextarea,Group,Checker,CheckerItem,Loading,TransferDomDirective as TransferDom } from 'vux'
import {post,get,del,put} from '../../request/config.js'
import avaterImg from '../../assets/img/dotor-img.png'
export default {
   name: 'aa',
   directives: {
        TransferDom
    },
   components: {XImg ,XButton, Rater,XTextarea,Group,Checker,CheckerItem,Loading},
    data () {
        return {
            doctorPhoto:'',
            evaluteLabel:[],
            evaluteData:{},
            evaluateWhole:0,
            evaluateText:'',
            consult_id:decodeURIComponent(this.$route.query.consult_id),
            showLoading:false,
        }
    },
    methods: {
        onEvent (event) {
            console.log('on', event)
        },
        addEvaluate(){ 
            let labelStr=this.evaluteLabel.toString();
            let textStr=!!(this.evaluateText)&&this.evaluateText!=''?';'+this.evaluateText:''; 
               
            var regStr = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
            if(regStr.test(textStr)){
                textStr=textStr.replace(regStr,"");
            }
            let requestData={
                consult_id:this.consult_id,//this.$route.query.consult_id,
                evaluateWhole:this.evaluateWhole,
                evaluateText:labelStr+textStr
            }
            console.log(requestData,'requestData')
            post('/patient/patientEvaluateExpert.htm',requestData,'query').then(res=>{
                if(res.data.ret_code==0){
                    this.$vux.toast.show({
                        text: "评价成功",
                        type: 'text',
                    })
                    this.getConsultDetail(this.consult_id);
                }else{ 
                    console.log('info',res.data.ret_info);
                }
            }).catch(err=>{
                console.log('err',err)
            })
        },
        getConsultDetail(consult_id){
            this.showLoading=true
            post('/expert/getMzConsult.htm',{consult_id:consult_id},'query').then(res=>{               
                if(res.data.ret_code==0){
                    let data=res.data.ret_data;
                    for(let i=0;i<data.consultDoctors.length;i++){
                        if(data.consultDoctors[i].doctorType==1){
                            this.doctorPhoto=data.consultDoctors[i].doctorPhoto;
                            break;
                        }
                    }
                    console.log(res.data,'data')
                    if(data.evaluate){
                        let spliceIndex=data.evaluate.evaluateText.indexOf(';');
                        console.log(spliceIndex,'index')
                        this.evaluateText=spliceIndex>=0?(data.evaluate.evaluateText).slice(spliceIndex+1):'';
                        let label=spliceIndex>=0?(data.evaluate.evaluateText).substring(0,spliceIndex):data.evaluate.evaluateText;
                        this.evaluteLabel=label==''?[]:label.split(',');
                    }else{
                        this.evaluateText='';
                        this.evaluteLabel=[];
                    }
                    this.evaluteData=data.evaluate;
                    this.evaluateWhole=data.evaluate?data.evaluate.evaluateWhole:0;
                }else{
                    console.log(res.data.ret_info,'info');
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log(err,'err')
            })
        },
        stringSub(val){
            if(val.indexOf(';')==0)
                return val.slice(1)
            else
                return val;
        }
    },
    
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        console.log('评价',this.consult_id)
        this.getConsultDetail(this.consult_id);
    }
}
</script>
