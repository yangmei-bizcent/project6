<template>
    <div>
        <div class="fixed width100 left0 top0 clear" style="height:48px;z-index:100">
            <search v-model="keyword" @on-clear="onClear" @on-cancel="onCancel" @on-submit="onSubmit" ref="search" placeholder="搜索科室" ></search>
        </div> 
        <div style="padding-top:56px;height:100%">
            <div class="doc_result" style="padding-left:0;background:#f5f5f5">
                <div v-if="!sectionList||sectionList.length==0">
                    <div class="textAlignCenter paddingtop50">
                        <img src="../../assets/img/search_noDoc.png" width="160"/>
                        <p class="margintop20" style="color:#6C7D8F">未查询到相关科室</p>
                    </div>
                </div>
                <group class="section_list bgcolor-white" v-if="sectionList&&sectionList.length>0">
                    <cell class="lineheight30 color-333 fontsize2" v-for="item in sectionList" :key="item.department_id" :title="item.departmentName" 
                    :link="'/doctor/doctorList?hospitalId='+hospitalId+'&departmentId='+item.department_id"></cell>
                </group>
                <div v-transfer-dom>
                    <loading :show="showLoading" text=""></loading>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import {Search, Group, Cell,Loading, TransferDomDirective as TransferDom} from 'vux'
import {post,get,del,put} from '../../request/config.js'
export default {
    directives: {
        TransferDom
    },
  components: { Group, Cell,Loading,Search},
  data () {
    return {
        sectionList:[],
        hospitalId:'',
        showLoading:false,
        keyword:'',
        results:[],
        onFetching:false,
        pageNum:1,
        total:0,
    }
  },
    methods:{
         onClear(){
            this.keyword=''
            this.pageNum = 1
            this.sectionList = [];
            // this.getList().then( () => {
            //     this.$refs.scrollerBottom.reset({top: 0})
            // });
            this.getList();
        },
        onCancel(){
            this.keyword=''
            this.pageNum = 1
            this.sectionList = [];
            // this.getList().then( () => {
            //     this.$refs.scrollerBottom.reset({top: 0})
            // });
            this.getList();
        },
        onSubmit(val){
            //this.getList(this.value,1)
            this.pageNum = 1
            this.sectionList = [];
            // this.getList().then( () => {
            //     this.$refs.scrollerBottom.reset({top: 0})
            // });
            this.getList()
        },
        getList(){
            this.showLoading=true
            post('/patient/getScheduleList.htm',{hospitalId:this.hospitalId,keyword:this.keyword},'query').then( res => {
                if(res.data.ret_code==0){          
                    let data=JSON.parse(res.data.ret_data);
                    console.log(data,'data')
                    this.sectionList = data.hadDocDepts;
                }else{
                    console.log(res.data.ret_info)
                }
                this.showLoading=false
            }).catch(err=>{
                this.showLoading=false
                console.log('err',err)
            })
        }
    },
    mounted(){
        this.showLoading=true
        let currparams={
            url:window.location.href
        }
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginGetCurrentUrl",currparams, function() {});

        let params={
            url:sessionStorage.getItem('href')+"?action=none"
        }
        console.log(params,'parms')
        rbk.platform.callPlugin("NativeFunctionPlugins", "PluginJumpGivenUrl",params, function() {});
        
        post('/patient/getHospitalInfo.htm',{domain:sessionStorage.getItem("domain")},'query').then( res => {
            if(res.data.ret_code==0){
                sessionStorage.setItem('hospitalId',res.data.ret_data.hospital.hospitalId)
                sessionStorage.setItem('hospitalName',res.data.ret_data.hospital.name)
                this.hospitalId=res.data.ret_data.hospital.hospitalId
                this.onClear();
            }else{
                console.log(res)
                this.showLoading=false
            }                          
        }).catch(err=>{
            this.showLoading=false
            console.log('err',err);
        })
    },
}
</script>
