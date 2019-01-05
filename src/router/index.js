import Vue from 'vue'
import Router from 'vue-router'
import '../assets/js/kerkee.js'

const lazyload = (name) => (resolve) => require([`@/views/${name}`], resolve)

Vue.use(Router)

const router = new Router({
    routes: [{
        path: '/entrance',
        name: 'entrance',
        component: lazyload('entrance'),
        meta: {
            title: '云门诊'
        }
    },{
        path: '/',
        name: 'index',
        component: lazyload('index'),
        meta: {
            title: '视频问诊'
        }
    }, {
        path: '/message',
        name: 'message',
        component: lazyload('message'),
        meta: {
            title: '消息中心'
        }
    }, {
        path: '/doctor/doctorSearch',
        name: 'doctorSearch',
        component: lazyload('doctor/doctorSearch'),
        meta: {
            title: '视频问诊'
        }
    }, {
        path: '/section/sectionList',
        name: 'sectionList',
        component: lazyload('section/sectionList'),
        meta: {
            title: '选择科室'
        }
    }, {
        path: '/doctor/doctorList',
        name: 'doctorList',
        component: lazyload('doctor/doctorList'),
        meta: {
            title: '选择医生'
        }
    }, {
        path: '/doctor/doctorIndex',
        name: 'doctorIndex',
        component: lazyload('doctor/doctorIndex'),
        meta: {
            title: '医生主页'
        }
    }, {
        path: '/videoInterrogation/addPatient',
        name: 'addPatient',
        component: lazyload('videoInterrogation/addPatient'),
        meta: {
            title: '视频问诊申请'
        }
    }, {
        path: '/videoInterrogation/videoApply',
        name: 'videoApply',
        component: lazyload('videoInterrogation/videoApply'),
        meta: {
            title: '视频问诊申请'
        }
    }, {
        path: '/visitor/selectVisitor',
        name: 'selectVisitor',
        component: lazyload('visitor/selectVisitor'),
        meta: {
            title: '选择就诊人'
        }
    }, {
        path: '/visitor/addVisitor',
        name: 'addVisitor',
        component: lazyload('visitor/addVisitor'),
        meta: {
            title: '添加就诊人'
        }
    }, {
        path: '/visitor/editVisitor',
        name: 'editVisitor',
        component: lazyload('visitor/editVisitor'),
        meta: {
            title: '编辑就诊人'
        }
    }, {
        path: '/visitor/diseaseHistory',
        name: 'diseaseHistory',
        component: lazyload('visitor/diseaseHistory'),
        meta: {
            title: '疾病史'
        }
    }, {
        path: '/waitingRoom/waitingRoom',
        name: 'waitingRoom',
        component: lazyload('waitingRoom/waitingRoom'),
        meta: {
            title: '候诊间'
        }
    }, {
        path: '/videoInterrogation/cancelOrder',
        name: 'cancelOrder',
        component: lazyload('videoInterrogation/cancelOrder'),
        meta: {
            title: '取消并退款'
        }
    }, , {
        path: '/videoInterrogation/consultationFinish',
        name: 'consultationFinish',
        component: lazyload('videoInterrogation/consultationFinish'),
        meta: {
            title: '问诊结束'
        }
    }, {
        path: '/prescription/prescription',
        name: 'prescription',
        component: lazyload('prescription/prescription'),
        meta: {
            title: '处方笺'
        }
    }, {
        path: '/prescription/image',
        name: 'image',
        component: lazyload('prescription/image'),
        meta: {
            title: '电子处方'
        }
    }, {
        path: '/order/orderDetail',
        name: 'orderDetail',
        component: lazyload('order/orderDetail'),
        meta: {
            title: '订单详情'
        }
    }, {
        path: '/order/orderRecorder',
        name: 'orderRecorder',
        component: lazyload('order/orderRecorder'),
        meta: {
            title: '预约记录'
        }
    }, {
        path: '/helpCenter/helpIndex',
        name: 'helpIndex',
        component: lazyload('helpCenter/helpIndex'),
        meta: {
            title: '帮助中心'
        }
    }, {
        path: '/helpCenter/helpService',
        name: 'helpService',
        component: lazyload('helpCenter/helpService'),
        meta: {
            title: '服务条款'
        }
    }, {
        path: '/evaluate/evaluate',
        name: 'evaluate',
        component: lazyload('evaluate/evaluate'),
        meta: {
            title: '评价'
        }
    }, {
        path: '/diagnosReport/diagnosReport',
        name: 'diagnosReport',
        component: lazyload('diagnosReport/diagnosReport'),
        meta: {
            title: '诊断报告'
        }
    }, {
        path: '/pay/paySuccess',
        name: 'paySuccess',
        component: lazyload('pay/paySuccess'),
        meta: {
            title: '支付成功'
        }
    }]
})


router.beforeEach((to, from, next) => {
    var url=window.location.href;
    var hospitalName="";
    console.log("route before");
    console.log("url",url);
    //获取参数
    var Request = new Object();
    if (url.indexOf("?") != -1) {
        
        var parms=url.split("?");
        var str = parms[1];
        var strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            Request[strs[i].split("=")[0]]=(strs[i].split("=")[1]);
        }
        if(Request["hospitalName"]&&Request["hospitalName"]!=""){
            hospitalName=Request["hospitalName"];
            sessionStorage.setItem("hospitalNewName",hospitalName);
            console.log("hospitalNewName",sessionStorage.getItem("hospitalNewName"));
            // if (to.meta.title) {
            //     if (to.name == 'index') {
            //         document.title = sessionStorage.getItem("hospitalName");
            //     }
            // }
        }
    }
    if (to.meta.title) {
        console.log("to",to.name)
        if (to.name == 'helpService') {
            switch (parseInt(to.query.id)) {
                case 10:
                    document.title = '服务条款';
                    break;
                case 11:
                    document.title = '使用指南';
                    break;
                case 12:
                    document.title = '预约挂号';
                    break;
                case 13:
                    document.title = '就诊相关';
                    break;
                case 14:
                    document.title = '账号相关';
                    break;
                case 15:
                    document.title = '其他问题';
                    break;
            }
        } else {
            if(to.name == 'index'&&hospitalName!=""){
                document.title = decodeURIComponent(sessionStorage.getItem("hospitalNewName"));
            }else
                document.title = to.meta.title
        }
        let indexStr = '';
        if (document.title == '订单详情') {
            indexStr = 'yes'
        } else {
            indexStr = 'no'
        }
        ApiBridge.callNative("KCApiTSLModule", "notifyF", {
            action: 'titleShow',
            param: {
                title: document.title,
                isIndex: indexStr
            }
        });
        document.body.scrollTop = 0
        var input = document.getElementsByTagName('input');
        if (input.length > 0) {
            for (var i = 0; i < input.length; i++) {
                input[i].blur();
            }
        }
        var textarea = document.getElementsByTagName('textarea');
        if (textarea.length > 0) {
            for (var i = 0; i < textarea.length; i++) {
                textarea[i].blur();
            }
        }
        // textarea.blur();
    }
    next();
})

export default router