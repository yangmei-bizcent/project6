import qs from 'qs'
import axios from "axios"
import {
  ToastPlugin
} from 'vux'
import Vue from 'vue'
Vue.use(ToastPlugin)


/**
 * 配置编译环境和线上环境之间的切换
 * 
 * baseUrl: 域名地址
 * apiUrl: 域名地址
 * 
 */

let baseUrl = '';
let apiUrl = '';
let routerMode = 'history';

axios.interceptors.request.use(function (config) {
  // 处理请求之前的配置
  // console.log(config)
  return config;
}, function (error) {
  // 请求失败的处理
  return Promise.reject(error);
});

axios.interceptors.response.use(response => {
  // 处理响应数据
  if (response.data.ret_code == 5) {
    //Vue.$vux.toast.text('登录超时，请重新登录')
    //返回登录页
    rbk.platform.alertDialogConfirmShow(
      "提示", "登录超时，请重新登录", "确定",
      function () {
        rbk.platform.callPlugin("method", "PluginLoginErrorArrayArgu");
      }
    );
  }
  return response;
}, function (error) {
  console.log(error)
  // 处理响应失败
  return Promise.reject(error);
});


export const appid = "hyzxqd92516f1616725e66f0b42db5c0cce5"


// 移动远程域名（domain无法动态获取时使用）
export const domain = "" 
//export const domain = "csydyc.zwjk.com"       //云门诊测试
//export const domain = "ymzydyc.zwjk.com"        //云门诊生产
//export const domain = "ymzjxyy.zwjk.com"      //嘉兴一院
//export const domain = "ymzyhxrm.zwjk.com"     //云和县人民医院 
//export const domain = "ydyc.xinyilu.com"      //九和
//export const domain = "ymzshsrm.zwjk.com"     //思睿明

// 移动远程接口地址
//export const ydycApi = "https://csydyc.zwjk.com"          //云门诊测试
export const ydycApi = "https://ymzydyc.zwjk.com"           //云门诊生产
//export const ydycApi = "https://ydyc.xinyilu.com:8043"    //九和
//export const ydycApi = "https://ymzshsrm.zwjk.com"        //思睿明

// 药事平台页面地址
//export const ysWeb = "https://ysgltest.zwjk.com/yscphapp_new"     //测试
// export const ysWeb = "https://yscph.zwjk.com/yscphapp_new"          //生产
export const ysWeb = "https://healthsxfront.zwjk.com/change"      //药事生产     

// 图文咨询
//export const twWeb="https://devmission.zwjk.com"
export const twWeb = "https://testmission.zwjk.com"

//  图片上传接口地址
export const upload = "https://diagnose.zwjk.com"


if (process.env.NODE_ENV == 'development') {
  baseUrl = ''
  apiUrl = ydycApi
} else if (process.env.NODE_ENV == 'production') {

  baseUrl = '/web';
  apiUrl = ydycApi
}


var URL = {
  base: apiUrl, //添加多个base-url(key为调用的sign,base为默认)
}

const errorFn = error => {
  switch (error.response.status) {
    case 400:
      Vue.$vux.toast.text('请求错误(400)')
      break
    case 403:
      Vue.$vux.toast.text('拒绝访问(403)')
      break
    case 404:
      Vue.$vux.toast.text('请求出错(404)')
      break
    case 405:
      Vue.$vux.toast.text('拒绝访问(405)')
      break
    case 408:
      Vue.$vux.toast.text('请求超时(408)')
      break
    case 500:
      Vue.$vux.toast.text('服务器错误(500)')
      break
    case 501:
      Vue.$vux.toast.text('服务未实现(501)')
      break
    case 502:
      Vue.$vux.toast.text('网络错误(502)')
      break
    case 503:
      Vue.$vux.toast.text('服务不可用(503)')
      break
    case 504:
      Vue.$vux.toast.text('网络超时(504)')
      break
    case 505:
      Vue.$vux.toast.text('HTTP版本不受支持(505)')
      break
    default:
      Vue.$vux.toast.text('连接出错')
  }
}

const getBaseUrl = (sign = 'base') => URL[sign]

const baseConfig = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
  },
  transformRequest: [
    data => (typeof (data) !== 'object') ? data : qs.stringify(data)
  ],
  paramsSerializer: params => qs.stringify(params),
  timeout: 10000
}

const jsonConfig = {
  headers: {
    "Content-Type": "application/json"
  },
  // withCredentials: true,
  timeout: 10000
}

const formConfig = {
  headers: {
    "Content-Type": "multipart/form-data"
  },
  // withCredentials: true,
  //  timeout: 10000
}

export const get = (_url, obj, type, sign) => axios(_url, {
  baseURL: getBaseUrl(sign),
  ...baseConfig,
  params: obj
}).catch(errorFn)
export const del = (_url, obj, type, sign) => axios.delete(_url, {
  baseURL: getBaseUrl(sign),
  ...baseConfig,
  params: obj
}).catch(errorFn)

export const post = (_url, obj, type, sign) => {
  let config
  if (type === 'json' || type === 'body')
    config = jsonConfig
  else if (type === 'form')
    config = formConfig
  else
    config = baseConfig
  config = {
    baseURL: getBaseUrl(sign),
    withCredentials: true,
    ...config
  }
  return axios.post(_url, obj, config).catch(errorFn)
}

export const put = (_url, obj, type, sign) => {
  let config
  if (type === 'json' || type === 'body')
    config = jsonConfig
  else if (type === 'form')
    config = formConfig
  else
    config = baseConfig
  config = {
    baseURL: getBaseUrl(sign),
    ...config
  }
  return axios.put(_url, obj, config).catch(errorFn)
}


// 获取医生头像
export const getDoctorImage = (val) => {
  let photo = val
  let defaultImg = "https://diagnose.zwjk.com/upload/2018/06/24/1529824411954.png"
  if (photo) {
    let prefix = photo.substring(0, 5)
    //console.log('prefix',prefix)
    if (prefix == "https")
      return val
    else
      return defaultImg
  } else {
    return defaultImg
  }

}
