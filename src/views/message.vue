<template>
    <div class="msg_content">
        <div class="paddingleft15 bgcolor-white">
            <div class="msg_item vux-1px-b">
                <img class="msg_img" src="../assets/img/msg_zd.png"/>
                <p class="clear lineheight25">
                    <span class="floatLeft color-333 fontsize2 lineheight20">诊断消息</span>
                    <badge :text="8" class="floatLeft"></badge>
                    <span class="msg_time">2017-05-10 15:04</span>
                </p>
                <p class="msg_detail">吴化平医生给你下诊断了，立即查看！</p>
            </div>
            <div class="msg_item lineheight25">
                <img class="msg_img" src="../assets/img/msg_jh.png"/>
                <p class="clear">
                    <span class="floatLeft color-333 fontsize2 lineheight20">叫号消息</span>
                    <badge :text="8" class="floatLeft"></badge>
                    <span class="msg_time">2017-05-10 15:04</span>
                </p>
                <p class="msg_detail"><span>暂无消息</span></p>
            </div>
        </div>
    </div>
</template>

<script>
import { Badge} from 'vux'
export default {
  components: { Badge},
  data () {
    return {
    }
  },
    methods:{
    }
}
</script>
<style scoped lang="less">
    .msg_content{
        padding-top:8px;
        .msg_item{
            position:relative;
            padding: 15px 15px 15px 57px;
            background:#fff;
            overflow:hidden;
            .msg_img{
                position:absolute;
                left:0px;
                top:15px;
                width:42px;
                height:42px;
            }
            .msg_time{
                float:right;
                font-size: 14px;
                color: #CDCDCD;
            }
            .msg_detail{
                line-height:20px;
                font-size:13px;
                color:#999;
                overflow:hidden;
                white-space:nowrap;
                text-overflow:ellipsis;
            }
        }
    }
</style>
