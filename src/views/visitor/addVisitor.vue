<template>
    <div class="page-container page-addVisitor color-333">   
        <group class="addvisitor-group" label-width="5em" label-margin-right="10px" label-align="left">
            <group-title slot="title" class="group-title ">请填写真实信息</group-title>
            <x-input 
                title="" 
                placeholder="请输入真实的姓名" 
                v-model="name" 
                text-align="right" >
                <div slot="label">
                    <span style="color:red">*</span>
                    <span class="color-666">姓名</span></div>
                </x-input>
            <x-input 
                title="身份证号" 
                placeholder="请输入准确的身份证号" 
                v-model="idCard"
                text-align="right">
                <div slot="label">
                    <span style="color:red">*</span>
                    <span class="color-666">身份证号</span></div>
                </x-input>
            <x-input 
                title="手机号码" 
                placeholder="用于接收就诊短信，请仔细填写" 
                v-model="phone"
                text-align="right">
                <div slot="label">
                    <span style="color:red">*</span>
                    <span class="color-666">手机号码</span></div>
                </x-input>
            <cell class="cellCard"
                title="就诊卡号"  
                is-link 
                value-align="right"
                @click.native="selectVisitCard">
                <div slot="title">
                    <span style="color:red">*</span>
                    <span class="color-666">就诊卡号</span></div>
                <div slot="value">
                    <span >{{visitCard}}</span></div>
            </cell>
        </group>
        <group class="addvisitor-group cell100 margintop8" label-width="4em" label-margin-right="10px">
            <cell  title="既往史" class="lineheight30" is-link @click.native="toHistory(0)" :value="stringSub(pastStr)"></cell>
            <cell title="过敏史" class="lineheight30" is-link @click.native="toHistory(1)" :value="stringSub(allergicStr)"></cell>
        </group>
        <actionsheet
            v-model="visitCardMenuShow"
            :menus="visitmenus"
            @on-click-menu="menuClick"></actionsheet>
        <div class="btns-block margintop50">
            <x-button type="primary" @click.native='validateVisitor' :disabled="!name||!idCard||!phone">确认添加</x-button>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import {GroupTitle, Group, Cell, XInput, Actionsheet, XButton, Toast,Loading, TransferDomDirective as TransferDom,AlertPlugin,XTextarea } from 'vux'
import {post,get,del,put} from '../../request/config.js'
import Vue from 'vue'
Vue.use(AlertPlugin)
export default {
    data() {
        return {
            name:sessionStorage.getItem('addVisitorName')?sessionStorage.getItem('addVisitorName'):'',
            age:sessionStorage.getItem('addVisitorAge')?sessionStorage.getItem('addVisitorAge'):'',
            idCard:sessionStorage.getItem('addVisitorIdCard')?sessionStorage.getItem('addVisitorIdCard'):'',
            phone:sessionStorage.getItem('addVisitorPhone')?sessionStorage.getItem('addVisitorPhone'):'',
            visitCard: sessionStorage.getItem('addVisitorVisitCard')?sessionStorage.getItem('addVisitorVisitCard'):'请点击获取就诊卡号',
            pastStr:'',
            allergicStr:'',
            pastMedicalHistory:'',
            allergicHistory:'',
            allergicHistoryExtra:'',
            pastMedicalHistoryExtra:'',
            visitCardMenuShow: false,
            visitmenus: [],
            validateCode:true,
            showLoading:false,
            testLog:'',
            showLog:false
        }
    },
    directives: {
        TransferDom
    },
    components: {
        Group,
        Cell,
        XInput,
        Actionsheet,
        XButton,
        GroupTitle,
        Toast,
        Loading,
        XTextarea 
    },
    methods: {
        menuClick(key, item) {
            var self = this;
            self.visitCard = item;
        },
            selectVisitCard() {
            this.getVisitCard();
            if(this.visitmenus.length==1){
                this.visitCard=this.visitmenus[0];
            }else{
                var self = this;
                self.visitCardMenuShow = true;
            }
        },
        // selectVisitCard() {
        //     var self = this;
        //     this.showLoading=true
        //     if(this.idCard!=""&&this.phone!=""&&this.name!=""){
        //         post("/his/getPatientInfo.htm",{name:this.name,phone:this.phone,idCard:this.idCard,token:sessionStorage.getItem("token")}).then(res=>{
        //             self.visitmenus=[];
        //             if(res.data.ret_code==0){
        //                 let treatmentCard=res.data.ret_data.treatmentCard?res.data.ret_data.treatmentCard:'暂无就诊卡号'
        //                 this.visitmenus.push(treatmentCard)
        //                 if(self.visitmenus.length==1){
        //                     self.visitCard=self.visitmenus[0];
        //                 }else{
        //                     self.visitCardMenuShow = true;
        //                 }
        //             }else{
        //                 self.visitmenus = [];
        //                 self.visitCard="";
        //                 this.$vux.toast.show({
        //                     text: res.data.ret_info,
        //                     type: 'text',
        //                 })
        //             }   
        //             self.showLoading=false
        //         }).catch(err=>{
        //             self.showLoading=false
        //             console.log(err,"err")
        //         })
        //     }else{
        //         self.showLoading=false
        //         self.visitmenus = [];
        //         self.visitCard="";
        //         this.$vux.toast.show({
        //             text: "请输入必填信息",
        //             type: 'text',
        //         })
                
        //     }
        // },
        // changeIdCard(){
        //     this.selectVisitCard();
        // },
        validateName() {
            if(this.name == '') {
                this.$vux.toast.show({
                    text: "请输入姓名",
                    type: 'text',
                })
                this.validateCode = false;
                return false;
            }
        },
        validateIdCard() {
            var idCardNoUtil = {
                /*省,直辖市代码表*/
                provinceAndCitys: {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",
                31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",
                45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",
                65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"},

                /*每位加权因子*/
                powers: ["7","9","10","5","8","4","2","1","6","3","7","9","10","5","8","4","2"],

                /*第18位校检码*/
                parityBit: ["1","0","X","9","8","7","6","5","4","3","2"],

                /*性别*/
                genders: {male:"男",female:"女"},

                /*校验地址码*/
                checkAddressCode: function(addressCode){
                    var check = /^[1-9]\d{5}$/.test(addressCode);   
                    if(!check) return false;
                    if(idCardNoUtil.provinceAndCitys[parseInt(addressCode.substring(0,2))]){
                        return true;
                    }else{
                        return false;
                    }
                },
                /*校验日期码*/
                checkBirthDayCode: function(birDayCode){
                    var check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(birDayCode);
                    if(!check) return false;
                    var yyyy = parseInt(birDayCode.substring(0,4),10);
                    var mm = parseInt(birDayCode.substring(4,6),10);
                    var dd = parseInt(birDayCode.substring(6),10);
                    var xdata = new Date(yyyy,mm-1,dd);
                    if(xdata > new Date()){
                        return false;//生日不能大于当前日期
                    }else if ( ( xdata.getFullYear() == yyyy ) && ( xdata.getMonth () == mm - 1 ) && ( xdata.getDate() == dd ) ){
                        return true;
                    }else{
                        return false;
                    }
                },

                /*计算校检码*/
                getParityBit: function(idCardNo){
                    var id17 = idCardNo.substring(0,17);
                    /*加权 */
                    var power = 0;
                    for(var i=0;i<17;i++){
                    power += parseInt(id17.charAt(i),10) * parseInt(idCardNoUtil.powers[i]);
                    }
                    /*取模*/
                    var mod = power % 11;
                    return idCardNoUtil.parityBit[mod];
                },

                /*验证校检码*/
                checkParityBit: function(idCardNo){
                    var parityBit = idCardNo.charAt(17).toUpperCase();
                    if(idCardNoUtil.getParityBit(idCardNo) == parityBit){
                        return true;
                    }else{
                        return false;
                    }
                },
            };
            if(this.idCard == '') {
                this.$vux.toast.show({
                    text: "请输入正确的身份证号",
                    type: 'text',
                })
                this.validateCode = false;
                return false;
            }else if(this.idCard.length == 15){
                //校验身份证
                //校验地址码
                //校验日期码
                if(!/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/.test(this.idCard) || !idCardNoUtil.checkAddressCode(this.idCard.substring(0,6)) || !idCardNoUtil.checkBirthDayCode('19' + this.idCard.substring(6,12))) {
                    this.$vux.toast.show({
                        text: "请输入正确的身份证号",
                        type: 'text',
                    })
                    this.validateCode = false;
                    return false;
                }
            }else if(this.idCard.length == 18){
                //校验身份证
                if(!/^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(this.idCard) || !idCardNoUtil.checkAddressCode(this.idCard.substring(0,6)) || !idCardNoUtil.checkBirthDayCode(this.idCard.substring(6,14)) || !idCardNoUtil.checkParityBit(this.idCard))  {
                    this.$vux.toast.show({
                        text: "请输入正确的身份证号",
                        type: 'text',
                    })
                    this.validateCode = false;
                    return false;
                }
            }
            else {
                this.$vux.toast.show({
                    text: "请输入正确的身份证号",
                    type: 'text',
                })
                this.validateCode = false;
                return false;
            }
        },
        validatePhone() {
            //if(this.phone == '' || !/^1(3[0-9]{1}|4[57]{1}|5[0-9]{1}|8[0-9]{1}|7[0-9]{1}|9[0-9]{1})\d{8}$/.test(this.phone))
            if(this.phone == '' || !/^1\d{10}$/.test(this.phone))
            {
                this.$vux.toast.show({
                    text: "请输入正确的手机号",
                    type: 'text',
                })
                this.validateCode = false;
                return false;
            }
        },
        validateVisitCard() {
            console.log(this.visitCard,'visitcard')
            if(!(this.visitCard)||this.visitCard == '' )
            {
                this.$vux.toast.show({
                    text: "请选择就诊卡",
                    type: 'text',
                })
                this.validateCode = false;
                return false;
            }
        },
        validateVisitor(){
            this.validateName()==false?'':(this.validateIdCard()==false?'':(this.validatePhone()==false?'':(this.validateVisitCard()==false?'':this.addvisitor())));
        },
        addvisitor(){
            // 验证表单
            // this.validateName();
            // this.validateIdCard();
            // this.validatePhone();
            // this.validateVisitCard();
            this.showLoading=true
            let token=sessionStorage.getItem('token');
            let requestData={
                token:token,
                name:this.name,
                idCard:this.idCard,
                phone:this.phone,
                medicalCard:this.visitCard,
                pastMedicalHistory:this.pastMedicalHistory+this.pastMedicalHistoryExtra, 
                allergicHistory:this.allergicHistory+this.allergicHistoryExtra,   
            }
            console.log('requestData',requestData)
            post('/patient/addPatient.htm',requestData,'query').then(res=>{
                if(res.data.ret_code==0){
                    console.log(res.data.ret_code)
                    this.$vux.toast.show({
                    text: "添加就诊人成功",
                    type: 'text',
                    })
                    // this.$router.push({path:'/visitor/selectVisitor',query:{token:token,fromPage:'addVisitor'}});
                    this.$router.push({path:'/visitor/selectVisitor',query:{token:token,fromPage:sessionStorage.getItem('selectVisitorFrom')}});
                }else{
                    this.$vux.toast.show({
                        text: res.data.ret_info,
                        type:'text',
                    })
                }
                this.showLoading=false
                sessionStorage.removeItem('selectedHistory');
                sessionStorage.removeItem('addVisitorName');
                sessionStorage.removeItem('addVisitorAge');
                sessionStorage.removeItem('addVisitorPhone');
                sessionStorage.removeItem('addVisitorIdCard');
                sessionStorage.removeItem('addVisitorVisitCard');
                sessionStorage.removeItem('isChangeHistory')
            }).catch(err=>{
                this.showLoading=false
                console.log('err',err);
            })  
        },
        getVisitCard(){
            //his调取就诊卡接口,现阶段仅为暂无就诊卡
            if(this.visitmenus==null||this.visitmenus.length==0){
                this.visitmenus=['暂无就诊卡号'];
            }           
        },
        dataBind(){
            let history=JSON.parse(sessionStorage.getItem('selectedHistory'));
            if(history!=null){              
                this.pastMedicalHistory=history.pastContent.length>0?history.pastContent.toString():'';
                this.pastMedicalHistoryExtra=history.pastExtra?';'+history.pastExtra:'';
                this.allergicHistory=history.allergicContent.length>0?history.allergicContent.toString():'';
                this.allergicHistoryExtra=history.allergicExtra?';'+history.allergicExtra:'';
                this.pastStr=this.pastMedicalHistory+this.pastMedicalHistoryExtra;
                this.allergicStr=this.allergicHistory+this.allergicHistoryExtra;
            }
        },
        toHistory(val){
            sessionStorage.setItem('addVisitorName',this.name);
            sessionStorage.setItem('addVisitorAge',this.age);
            sessionStorage.setItem('addVisitorPhone',this.phone);
            sessionStorage.setItem('addVisitorIdCard',this.idCard);
            sessionStorage.setItem('addVisitorVisitCard',this.visitCard);
            this.$router.push({path:'/visitor/diseaseHistory',query:{select:val,fromPage:'addVisitor'}})
        },
        stringSub(val){
            if(val.indexOf(';')==0||val.indexOf('无')==0)
            {
                val=val.slice(1);
                if(val.indexOf(';')==1||val.indexOf(',')==1)
                {
                    return val.slice(1);
                }
                else
                {
                    return val;
                }
            }else{
                return val;
            }
        }
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        this.dataBind();
    }
}
</script>
<style lang="less" scoped>
    .page-addVisitor {
        .group-title {
            font-size: 14px;
            color: #999;
            display: block;
            padding: 10px 14px 6px 14px;
        }
        .addvisitor-group {
            &.margintop8 {
                margin-top: 8px;
            }
            .weui-cells {
                font-size: 16px;
            }
            .weui-cell{
                padding:10px 15px;
                line-height:30px;
            }
            .weui-label {
                color: #666;
            }
        }
        .vux-cell-bd{
            height:24px;
        }
        .btns-block  {
            width: 100%;
            padding: 7px 20px;
            box-sizing: border-box;
        }
    }
</style>

