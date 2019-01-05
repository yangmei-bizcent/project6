<template>
    <div class="pay_content"> 
        <icon type="success" is-msg style="font-size:83px"></icon>
        <p class="paddingtop25 color1 fontsize4">支付成功</p>
        <p class="color2 fontsize-2" style="padding:10px 12% 25px">请于预约日期收到短信后，进入就诊页面，等待医生视频问诊。</p>
        <p class="paddingX15"><x-button type="primary" @click.native='finish'>完成</x-button></p>
    </div>
</template>

<script>
import { Icon, XButton } from 'vux'
export default {
    components: {Icon,XButton},
    data () {
        return {
        }
    },
    methods:{  
        finish(){}   
    }
}
</script>
<style lang="less" scoped>
    .pay_content{
        height:100%;
        background:#fff;
        padding-top:45px;
        text-align:center;
        .color1{
            color: #2D3034;
        }
        .color2{
            color: #9B9B9B;
        }
    }
</style>
