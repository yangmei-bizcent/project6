<template>
    <div class="apply_content">
        <div class="apply_label">病情描述 <span class="color-red">*</span></div>
        <group class="over">
            <x-textarea v-model.trim="description" placeholder="详细描述疾病、症状、发病时间、已服用的药物..." :rows="6"></x-textarea>
        </group>
        <div class="apply_label margintop10">病历资料照片
            <span class="fontsize0" style="float: right; text-align: right; color: #999; ">{{picList.length}}/9</span>
            <div class="vux-1px-top paddingtop10 clear">
                <div class="upload_img_item" v-if="picList.length>0" v-for="(item,i) in picList" :key="i">
                    <img src="../../assets/img/del_img.png" class="absolute top-5 right-5" width="18" @click="deletePic(i)"/>
                    <img :src="item.src" width="78" height="78" @click="show(i)"/>
                </div>
                <div class="uploader_wrap floatLeft" v-if="closeAdd">
                    <x-icon class="margintop10" type="ios-plus-empty" size="60" style="file:#ccc"></x-icon>
                    <input type="file" @change="fileChange($event)" style="opacity: 0;" />
                    <!-- <input type="file" @change="fileChange($event)" style="opacity: 0;" multiple accept='image/*'/> -->
                </div>
            </div>
        </div>
        <group class="margintop10 cell100" label-width="4em" label-margin-right="10px">
            <cell title="既往史" class="lineheight30" is-link @click.native="toHistory(0)" :value="stringSub(pastStr)"></cell>
            <cell title="过敏史" class="lineheight30" is-link @click.native="toHistory(1)" :value="stringSub(allergicStr)"></cell>
        </group>
        <div class="width100 paddingX20 padding20X">
            <x-button type="primary" :disabled="description==''" @click.native="videoApply">确定</x-button>
        </div>
        <div v-transfer-dom>
            <previewer :list="imglist" ref="previewer" :options="options" @on-index-change="logIndexChange"></previewer>
            <loading :show="showLoading" text=""></loading>
        </div>
    </div>
</template>

<script>
import { Group, XTextarea, Toast, Cell, XButton, Icon,ToastPlugin,Loading, TransferDomDirective as TransferDom,Previewer } from 'vux'
import {post,get,del,put,upload} from '../../request/config.js'
import '../../assets/js/exif.js'
import axios from "axios"
import Vue from 'vue'
Vue.use(ToastPlugin)
// import Uploader from 'vux-uploader' Uploader
export default {
    directives: {
        TransferDom
    }, 
  components: { Group, XTextarea, Toast, Cell, XButton, Icon,Loading,Previewer },
  data () {
    return {
        description:sessionStorage.getItem('description')?sessionStorage.getItem('description'):'',
        imgShow: false,
        image: '',
        photoLimit: 9,
        closeAdd: true,
        bigImageIndex: 1,
        patientDetail:{
            patientMedicalHistory:{
                pastMedicalHistory:{},
                allergicHistory:{}
            }
        },
        picList:sessionStorage.getItem('picList')?JSON.parse(sessionStorage.getItem('picList')):[],
        orientation:null,
        activeFiles:null,
        pastMedicalHistory:'',
        pastMedicalHistoryExtra:'',
        allergicHistory:'',
        allergicHistoryExtra:'',
        pastStr:'',
        allergicStr:'',
        disabled:true,
        photoList:[],
        showLoading:false,
        consult_id:'',
        imglist:[],
        options: {
            getThumbBoundsFn (index) {
            // find thumbnail element
            let thumbnail = document.querySelectorAll('.upload_img_item')[index]
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
  watch:{
      description:function(newvalue,oldvalue){
        var regStr = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/ig;
        if(regStr.test(newvalue)){
            this.description=newvalue.replace(regStr,"");
        }
      }
  },
    methods:{
        fileChange(el) {
            if (!el.target.files[0].size) return;
            this.fileList(el.target);
            el.target.value = ""; 
            var self = this;
        },
        getIndex(arr, value) {
            for (var i = 0; i < arr.length; i++) {
                if (value === arr[i]) {
                return i;
                }
            }
            return false;
        },
        image2Base64(img) {
            let _this = this;
            var _img_info = _this.getResizeSizeFromImg(img);
            var canvas = document.createElement("canvas");
            canvas.width = _img_info.w;
            canvas.height = _img_info.h;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, _img_info.w, _img_info.h);
            var dataURL = canvas.toDataURL("image/jpeg");
            return dataURL;
        },
        getImgBase64(url, callback) {
            let self = this;
            var base64 = "";
            var img = new Image();
            img.src = url;
            img.onload = function(e) {
                base64 = self.image2Base64(img);
                callback(base64);
            };
        },
        //计算图片的需要压缩的尺寸。当然，压缩模式，压缩限制直接从setting里面取出来。
        getResizeSizeFromImg: function(img) {
            var settings = {
                maxWidth: 1280, //允许的最大宽度
                maxHeight: 720 //允许的最大高度。
            };
            var _img_info = {
                w: img.width,
                h: img.height
            };
            if (
                _img_info.w <= settings.maxWidth &&
                _img_info.h <= settings.maxHeight
            ) {
                return _img_info;
            }
            var _percent_scale = parseFloat(_img_info.w / _img_info.h);
            var _size_by_mw = {
                w: settings.maxWidth,
                h: parseInt(settings.maxWidth / _percent_scale)
            };
            var _size_by_mh = {
                w: parseInt(settings.maxHeight * _percent_scale),
                h: settings.maxHeight
            };
            if (_size_by_mw.h <= settings.maxHeight) {
                return _size_by_mw;
            }
            if (_size_by_mh.w <= settings.maxWidth) {
                return _size_by_mh;
            }
            return {
                w: settings.maxWidth,
                h: settings.maxHeight
            };
        },
        fileList(fileList) {
            var self =  this;
            EXIF.getData(fileList.files[0],function(){  
                self.orientation=EXIF.getTag(this,'Orientation');  
            }); 
            let _this = this;
            let files = fileList.files;
            let fil;
            if (_this.picList.length >= this.photoLimit) {
                this.$vux.toast.show({
                    text: "最多上传" + this.photoLimit + "张图片",
                    time: 1000,
                })
                return;
            }
            for (let i = 0; i < files.length; i++) {
                fil = files[i];
                //判断是否为图片
                if (files[i].type != "" && files[i].type.indexOf("image") != -1) {
                    let oriSize = files[i].size;
                    // if (files[i].size > 5 * 1024 * 1024) {
                    //     this.$vux.toast.show({
                    //         text: "图片不能大于5M",
                    //         time: 1000,
                    //     })
                    //     return;
                    // }
                    _this.getImgBase64(URL.createObjectURL(fil), function(base64str) {
                        _this.getImgData(base64str,_this.orientation,function(data){  
                            //回调哦
                            // _this.picList.push({ name:fil.name,src: data });
                            if (_this.picList.length == 9) {
                                _this.closeAdd = false;
                            } else {
                                _this.closeAdd = true;
                            }
                           // _this.dataURLtoBlob(data);
                            //调用接口   如果是接受base64  参数为 data   如果参数为二进制流 参数为_this.dataURLtoBlob(data)
                            // console.log( '转换的file',_this.dataURLtoBlob(data,fil.name));
                            // console.log(fil,fil.name);


                            // let formData=new FormData();
                            // formData.append('source_from','webpage_upload')
                            // formData.append('file', _this.dataURLtoBlob(data,fil.name)); 
                            // var canvas = document.createElement('canvas');
                            // var dataURL = canvas.toDataURL('image/jpeg', 1);
                            
                            _this.showLoading=true;
                            var blob = _this.dataURLtoBlob(data,name); // 上一步中的函数
                            var fd = new FormData();
                            fd.append("the_fileName", blob, fil.name);
                            //const longPollingUrl = "https://diagnose.zwjk.com";
                            axios.post(upload + "/uploadfile/upload.htm", fd,{
                                headers:{
                                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
                                }
                            }).then(res => {
                                for (let i = 0; i < res.data.length; i++) {
                                    let img = {
                                        url: _this.changeImageUrl(res.data[i].url),
                                        name: res.data[i].fileName + i
                                    };
                                    console.log('img',img)
                                    _this.picList.push({name:fil.name,src: img.url })
                                    let imgitem={
                                        src: _this.changeImageUrl(res.data[i].url)
                                    }
                                    _this.imglist.push(imgitem);
                                    console.log(_this.imglist,'_this.imglist')
                                    if (_this.picList.length == 9) {
                                        _this.closeAdd = false;
                                    } else {
                                        _this.closeAdd = true;
                                    }
                                    _this.showLoading=false;
                                }
                            }).catch(err=>{
                                console.log(err,"err");
                                _this.showLoading=false;
                                _this.$vux.toast.show({
                                    text: "图片上传失败，请稍候重试",
                                    type: 'text',
                                })
                            });
                        });
                    });
                } else {
                    this.$vux.toast.show({
                        text: "文件类型错误",
                        type: 'text',
                    })
                } 
                _this.showLoading=false;
            }
        },
        changeImageUrl(val){
            //console.log('val',val)
            let prefix=val.substring(0,5)
            //console.log('prefix',prefix)
            if(prefix!="https"){
                //console.log('url',"https"+val.substring(4))
                return "https"+val.substring(4)
            }else{
                return val
            }
        },
        //转文件流 二进制
        dataURLtoBlob(dataurl,name) {
            var arr = dataurl.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]),
                n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime, name:name});
        },
        // 删除照片
        deletePic(i) {
            this.picList.splice(i, 1);
            if (this.picList.length < 9) {
                this.closeAdd = true;
            }
            this.imglist.splice(i,1);
            // this.$emit("uploadSure", this.picList.length);
            // this.$emit("uploadData", this.picList);
        },
        openLightBox(index) {
            this.imgShow = true;
            this.bigImageIndex = index;
        },
        hideImg() {
            this.imgShow = false;
        },
        // 处理旋转
        getImgData(img,dir,next){  
            var image=new Image();  
            image.onload=function(){  
                var degree=0,drawWidth,drawHeight,width,height;  
                //原始宽高  
                drawWidth=this.naturalWidth;  
                drawHeight=this.naturalHeight;  
                //使用canvas修正图片的方向  
                var canvas=document.createElement('canvas');  
                canvas.width=width=drawWidth;  
                canvas.height=height=drawHeight;  
                var context=canvas.getContext('2d');  
                //判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式  
                switch(dir){  
                    //iphone横屏拍摄，此时home键在左侧  
                    case 3:  
                        degree=180;  
                        drawWidth=-width;  
                        drawHeight=-height;  
                        break;  
                    //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)  
                    case 6:  
                        canvas.width=height;  
                        canvas.height=width;  
                        degree=90;  
                        drawWidth=width;  
                        drawHeight=-height;  
                        break;  
                    //iphone竖屏拍摄，此时home键在上方  
                    case 8:  
                        canvas.width=height;  
                        canvas.height=width;  
                        degree=270;  
                        drawWidth=-width;  
                        drawHeight=height;  
                        break;  
                }  
                //使用canvas旋转校正  
                degree&&context.rotate(degree*Math.PI/180);//安卓没有获取旋转角度  
                context.drawImage(this,0,0,drawWidth,drawHeight);  
                //返回校正图片  
                next(canvas.toDataURL("image/png"));  
            }  
            image.src=img;  
        },
        dataBind(){
            let history={};
            if(!sessionStorage.getItem('isChangeHistory')||sessionStorage.getItem('isChangeHistory')==0){
                this.patientDetail = sessionStorage.getItem("consultPatient")?JSON.parse(sessionStorage.getItem("consultPatient")):{};    
                let paststring=this.patientDetail.patientMedicalHistory?this.patientDetail.patientMedicalHistory.pastMedicalHistory:'';
                let allerstring=this.patientDetail.patientMedicalHistory?this.patientDetail.patientMedicalHistory.allergicHistory:'';
                let pastindex=this.patientDetail.patientMedicalHistory?paststring.indexOf(';'):-1;
                let allerindex=this.patientDetail.patientMedicalHistory?allerstring.indexOf(';'):-1;
                history={
                    pastContent:pastindex>=0?paststring.substring(0,pastindex):paststring,
                    pastExtra:pastindex>=0?paststring.slice(pastindex+1):'',
                    allergicContent:allerindex>=0?allerstring.substring(0,allerindex):allerstring,
                    allergicExtra:allerindex>=0?allerstring.slice(allerindex+1):''
                }
                sessionStorage.setItem('applyHistory',JSON.stringify(history));
            }
            else{
                if(sessionStorage.getItem('applyHistory')){
                    history=JSON.parse(sessionStorage.getItem('applyHistory'))
                }
            }
            this.pastMedicalHistory=history.pastContent?history.pastContent:'';
            this.pastMedicalHistoryExtra=history.pastExtra?';'+history.pastExtra:'';
            
            this.allergicHistory=history.allergicContent?history.allergicContent:'';
            this.allergicHistoryExtra=history.allergicExtra?';'+history.allergicExtra:'';

            this.pastStr=this.pastMedicalHistory+this.pastMedicalHistoryExtra;
            this.allergicStr=this.allergicHistory+this.allergicHistoryExtra;  
            
        },
        videoApply(){
            let _this=this;
            let check=sessionStorage.getItem('videoApplySure');
            if(check==1){
                Vue.$vux.toast.text("请勿重复提交",'middle')
                return;
            }
            this.showLoading=true
            let consultPatient=JSON.parse(sessionStorage.getItem('consultPatient'));
            let schedule=JSON.parse(sessionStorage.getItem('schedule'))
            let files=[];
            this.picList.forEach(ele => {
                let file={
                    url:ele.src
                }
                files.push(file);
            });
            let consultData={
                consultStatus:2,
                type:2,
                consultPatient:{
                    idCard:consultPatient.idCard,
                    treatmentCard:consultPatient.medicalCard,
                    name:consultPatient.name,
                    patientId:"",
                    phone:consultPatient.phone,
                    casePresentation:this.description,
                    allergicHistory:this.allergicStr,
                    pastIllnessHistory:this.pastStr,
                },
                consultDoctors:[{
                    doctorId:schedule.doctorId
                }],
                schedule_id :schedule.scheduleId,
                files:files
            };
            sessionStorage.setItem('consultData',JSON.stringify(consultData))
            post('/patient/addMzConsult.htm?token='+sessionStorage.getItem('token')+'&type='+2,consultData,'body').then(res=>{
                console.log(res.data,'res data')
                if(res.data.ret_code==0){
                    sessionStorage.setItem('videoApplySure',1)
                    _this.consult_id=res.data.ret_data.consult_id;
                    if(!(res.data.ret_data.preferentialPrice)||res.data.ret_data.preferentialPrice==0){
                        _this.$vux.toast.show({
                            text: "申请成功",
                            type: 'text',
                        })
                        _this.$router.push('/order/orderRecorder');
                        //_this.$router.push('/order/orderDetail?consult_id='+encodeURIComponent(_this.consult_id));
                    }else if(_this.consult_id&&res.data.ret_data.preferentialPrice&&res.data.ret_data.preferentialPrice>0){
                        this.getPayUrl();
                    }
                    
                }else{
                    _this.$vux.toast.show({
                        text:res.data.ret_info,
                        type:'text',
                    })
                    console.log(res.data.ret_info,'info');
                    _this.$router.push('/doctor/doctorIndex?doctorId='+schedule.doctorId+'&unionId='+sessionStorage.getItem('unionId')+'&hospitalId='+sessionStorage.getItem('hospitalId')+'&fromPage=videoApply')
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                _this.$vux.toast.show({
                        text:err,
                        type:'text',
                    })
                console.log(err,'err')
            })
            sessionStorage.removeItem('description');
            sessionStorage.removeItem('picList');
            sessionStorage.removeItem('applyHistory');
            sessionStorage.removeItem('consultPatient');
            sessionStorage.removeItem('schedule');
            sessionStorage.removeItem('isChangeHistory')
        }  ,
        toHistory(val){
            sessionStorage.setItem('description',this.description);
            sessionStorage.setItem('picList',JSON.stringify(this.picList));
            this.$router.push({path:'/visitor/diseaseHistory',query:{select:val,token:sessionStorage.getItem('token'),fromPage:'videoApply'}})
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
        getPayUrl(){
            post('/common/consultlist.htm',{
                consult_id:this.consult_id,
                payType:4,   //支付方式。0微信，1支付宝，2线下，4 app微信支付
                returnPageUrl:sessionStorage.getItem('href')+'order/orderRecorder'
                //returnPageUrl:sessionStorage.getItem('href')+'order/orderDetail?consult_id='+encodeURIComponent(this.consult_id)
            }).then(res=>{
                if(res.data.ret_code==0){   
                    this.payUrl=res.data.ret_data.payUrl
                    console.log(this.payUrl,'this.payUrl');
                    window.location.href=this.payUrl;
                }else{
                    this.$vux.toast.show({
                        text: "支付失败，请稍候再试",
                        type: 'text',
                    })
                    this.$router.replace('/order/orderDetail?consult_id='+encodeURIComponent(this.consult_id));
                    console.log(res.data.ret_info,'this.payUrl')
                }
            })
        },
        show(index) {
            console.log(index,'index')
            this.$refs.previewer.show(index)
        },
        logIndexChange (arg) {
            console.log(arg,'arg')
        },
    },
    mounted(){
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});
        // this.bindEvent();
        this.dataBind();
    },
}
</script>
<style scoped lang="less">
    .apply_content{
        line-height:0;
        .apply_label{
            font-size: 15px;
            color: #333333;
            padding:10px 15px;
            line-height:24px;
            background:#fff;
        }
        .uploader_wrap{
            width:80px;
            height:80px;
            text-align:center;
            line-height:80px;
            border:1px solid #e2e2e2;
            position:relative;
            path{
                fill:#ccc;
            }
            input{
                position:absolute;
                top:0;
                left:0;
                width:100%;
                height:100%;
            }
        }
        .upload_img_item{
            float:left;
            width:80px;
            height:80px;
            margin-right:10px;
            text-align:center;
            line-height:0;
            font-size:0;
            position:relative;
        }
    }
</style>
