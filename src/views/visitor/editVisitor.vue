<template>
    <div class="page-container page-addVisitor color-333">   
        <group class="addvisitor-group" label-width="5em" label-margin-right="10px" label-align="left">           
            <x-input 
                title="" 
                placeholder="请输入真实的姓名" 
                v-model="name"
                text-align="right">
                <div slot="label">
                    <span style="color:red">*</span>
                    <span class="color-666">姓名</span></div>
                </x-input>
            <x-input 
                title="" 
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
            <cell title="既往史" class="lineheight30" is-link @click.native="toHistory(0)" :value="stringSub(pastStr)"></cell>
            <cell title="过敏史" class="lineheight30" is-link @click.native="toHistory(1)" :value="stringSub(allergicStr)"></cell>
        </group>
        <actionsheet
            v-model="visitCardMenuShow"
            :menus="visitmenus"
            @on-click-menu="menuClick"></actionsheet>
        <div class="btns-block margintop50">
            <x-button type="primary"  @click.native='deleteVisitor'>删除</x-button>
            <x-button type="primary" class="btn-blue" @click.native='validateVisitor'>保存</x-button>
        </div>
        <div v-transfer-dom>
            <confirm v-model="isShow" title="删除就诊人" content="是否确认删除就诊人" @on-cancel="onCancel" @on-confirm="onConfirm"></confirm>
        </div>
        <div v-transfer-dom>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import {GroupTitle, Group, Cell, XInput, Actionsheet, XButton, Toast ,Confirm,Loading,TransferDomDirective as TransferDom  } from 'vux'
import {post,get,del,put} from '../../request/config.js'
export default {
    data() {
        return {
            name:sessionStorage.getItem('editVisitorName')?sessionStorage.getItem('editVisitorName'):'',
            age:sessionStorage.getItem('editVisitorAge')?sessionStorage.getItem('editVisitorAge'):'',
            idCard:sessionStorage.getItem('editVisitorIdCard')?sessionStorage.getItem('editVisitorIdCard'):'',
            phone:sessionStorage.getItem('editVisitorPhone')?sessionStorage.getItem('editVisitorPhone'):'',
            visitCard: sessionStorage.getItem('editVisitorVisitCard')?sessionStorage.getItem('editVisitorVisitCard'):'请点击获取就诊卡号',
            pastMedicalHistory:'',
            pastMedicalHistoryExtra:'',
            allergicHistory:'',
            allergicHistoryExtra:'',
            pastStr:'',
            allergicStr:'',
            visitCardMenuShow: false,
            visitmenus: [],
            isShow:false,
            validateCode:true,
            showLoading:false
        }
    },
    components: {
        Group,
        Cell,
        XInput,
        Actionsheet,
        XButton,
        GroupTitle,
        Toast ,
        Confirm,
        Loading
    },
    directives: {
        TransferDom
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
        validateVisitCard()
        {
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
            this.validateName()==false?'':(this.validateIdCard()==false?'':(this.validatePhone()==false?'':(this.validateVisitCard()==false?'':this.editvisitor())));
        },
        editvisitor(){
            let token=sessionStorage.getItem('token');
            let id=this.$route.query.patientId;
            let requestData={
                token:token,
                id:id,
                name:this.name,
                idCard:this.idCard,
                phone:this.phone,
                medicalCard:this.visitCard,
                pastMedicalHistory:this.pastMedicalHistory+this.pastMedicalHistoryExtra,   
                allergicHistory:this.allergicHistory+this.allergicHistoryExtra,
            }
            console.log(requestData,'requestdata')
            post('/patient/addPatient.htm',requestData,'query').then(res=>{
                if(res.data.ret_code==0){
                    console.log(res.data.ret_code)
                    this.$vux.toast.show({
                    text: "修改就诊人成功",
                    type: 'text',
                })
                    // this.$router.push({path:'/visitor/selectVisitor',query:{token:token,fromPage:'editVisitor'}});
                    this.$router.push({path:'/visitor/selectVisitor',query:{token:token,fromPage:sessionStorage.getItem('selectVisitorFrom')}});
                }else{
                    console.log("ret_info",res.data.ret_info)
                    this.$vux.toast.show({
                        text: res.data.ret_info,
                        type:'text',
                    })
                }
                sessionStorage.removeItem('selectedHistory');
                sessionStorage.removeItem('editVisitorName');
                sessionStorage.removeItem('editVisitorAge');
                sessionStorage.removeItem('editVisitorPhone');
                sessionStorage.removeItem('editVisitorIdCard');
                sessionStorage.removeItem('editVisitorVisitCard');
                sessionStorage.removeItem('isChangeHistory');
            }).catch(err=>{
                console.log('err',err);
            })
        },
        deleteVisitor(){
            this.isShow=true;
            
        },
        onCancel(){
            this.isShow=false;
        },
        onConfirm(){
            post('/patient/deletePatient.htm',{token:sessionStorage.getItem('token'),patientId:this.$route.query.patientId}).then(res=>{
                if(res.data.ret_code==0){
                    this.$vux.toast.show({
                        text: "删除就诊人成功",
                        type: 'text',
                    })
                    //  this.$router.push({path:'/visitor/selectVisitor',query:{token:sessionStorage.getItem('token'),fromPage:'editVisitor'}});
                     this.$router.push({path:'/visitor/selectVisitor',query:{token:sessionStorage.getItem('token'),fromPage:sessionStorage.getItem('selectVisitorFrom')}});
                }else{
                    console.log(res.data.ret_info,'info')
                }
            }).catch(err=>{
                console.log(err,'err')
            })
        },
        getVisitCard(){
            //his调取就诊卡接口,现阶段仅为暂无就诊卡
            if(this.visitmenus==null||this.visitmenus.length==0){
                this.visitmenus=['暂无就诊卡号'];
            }           
        },
        getPatientDetail(){
            this.showLoading=true
            post('/patient/getDetailById.htm',{token:this.$route.query.token,patientId:this.$route.query.patientId},'query').then(res=>{
                if(res.data.ret_code==0){   
                    this.patientDetail=res.data.ret_data;
                    console.log('patient',this.patientDetail)
                    sessionStorage.setItem('editVisitorName',this.patientDetail.name);
                    sessionStorage.setItem('editVisitorAge',this.patientDetail.age);
                    sessionStorage.setItem('editVisitorPhone',this.patientDetail.phone);
                    sessionStorage.setItem('editVisitorIdCard',this.patientDetail.idCard);
                    sessionStorage.setItem('editVisitorVisitCard',this.patientDetail.medicalCard);

                    let history={};
                    if(!sessionStorage.getItem('isChangeHistory')||sessionStorage.getItem('isChangeHistory')==0){  
                        this.name=this.patientDetail.name;
                        this.age=this.patientDetail.age
                        this.idCard=this.patientDetail.idCard;
                        this.phone=this.patientDetail.phone;
                        this.visitCard=this.patientDetail.medicalCard;
                        
                        let pastindex=this.patientDetail.patientMedicalHistory.pastMedicalHistory.indexOf(';');
                        let allerindex=this.patientDetail.patientMedicalHistory.allergicHistory.indexOf(';')
                        
                        history={
                            pastContent:pastindex>=0?this.patientDetail.patientMedicalHistory.pastMedicalHistory.substring(0,pastindex):this.patientDetail.patientMedicalHistory.pastMedicalHistory,
                            pastExtra:pastindex>=0?this.patientDetail.patientMedicalHistory.pastMedicalHistory.slice(pastindex+1):'',
                            allergicContent:allerindex>=0?this.patientDetail.patientMedicalHistory.allergicHistory.substring(0,allerindex):this.patientDetail.patientMedicalHistory.allergicHistory,
                            allergicExtra:allerindex>=0?this.patientDetail.patientMedicalHistory.allergicHistory.slice(allerindex+1):''
                        }
                        sessionStorage.setItem('selectedHistory',JSON.stringify(history));
                    }else{  
                        if(sessionStorage.getItem('selectedHistory')){
                            history=JSON.parse(sessionStorage.getItem('selectedHistory'))
                        }
                    }
                    this.pastMedicalHistory=history.pastContent?history.pastContent:'';
                    this.pastMedicalHistoryExtra=history.pastExtra?';'+history.pastExtra:'';
                    
                    this.allergicHistory=history.allergicContent?history.allergicContent:'';
                    this.allergicHistoryExtra=history.allergicExtra?';'+history.allergicExtra:'';

                    this.pastStr=this.pastMedicalHistory+this.pastMedicalHistoryExtra;
                    this.allergicStr=this.allergicHistory+this.allergicHistoryExtra;                                     
                }else{
                    console.log('info',res.data.ret_info)
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log(err,'err')
            })
            
        },        
        toHistory(val){
            sessionStorage.setItem('editVisitorName',this.name);
            sessionStorage.setItem('editVisitorAge',this.age);
            sessionStorage.setItem('editVisitorPhone',this.phone);
            sessionStorage.setItem('editVisitorIdCard',this.idCard);
            sessionStorage.setItem('editVisitorVisitCard',this.visitCard);
            this.$router.push({path:'/visitor/diseaseHistory?fromPage=editVisitor&select='+val+'&token='+sessionStorage.getItem('token')+'&patientId='+this.$route.query.patientId})         
        },
        stringSub(val){
            if(val.indexOf(';')==0||val.indexOf('无')==0)
            {
                val=val.slice(1);
                if(val.indexOf(';')==0||val.indexOf(',')==0)
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
        },
        getIDCardText(val){
            if(val){
                let prefix=val.substring(0,4)
                let suffix=val.slice(val.length-4)
                let stars="**********"
                return prefix+stars+suffix
            }         
        },
        getPhoneText(val){
            if(val){
                let prefix=val.substring(0,3)
                let suffix=val.slice(val.length-4)
                let stars="****"
                return prefix+stars+suffix
            }         
        },
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        this.getPatientDetail();
        
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
        .btns-block  {
            width: 100%;
            padding: 7px 20px;
            box-sizing: border-box;
        }
    }
</style>

