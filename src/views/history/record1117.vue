<template>
  <div class="app-container1">
    <el-row :gutter="15">
      <el-form :model="ruleForm" :rules="rules">
        <el-col :span="4">
          <el-form-item prop="fan">
<!--            <el-input v-model.number="ruleForm.fan" placeholder="请选择风机号" clearable/>-->
            <el-select
              clearable
              style="width: 100%"
              v-model="ruleForm.fan"
              collapse-tags
              multiple
              filterable
              @change="selectChange"
              placeholder="请选择风机号:">
              <el-checkbox v-model="checkVal" @change="selectAll">全选</el-checkbox>
              <el-option
                v-for="item in fanIdList"
                :key="item.id"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item >
            <el-date-picker
              style="width: 100%"
              v-model="ruleForm.datePickerList"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="timestamp"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" icon="el-icon-search" @click="getRequest()">查询</el-button>
          <el-button type="primary" icon="el-icon-download" @click="exportExcel()">导出</el-button>
        </el-col>

      </el-form>
    </el-row>

    <el-table
      fit
      stripe
      highlight-current-row
      :data="records.slice((currentPage-1)*pageSize,currentPage*pageSize)"
    >
      <el-table-column v-if="false" label="事件id" prop="dataid"  align="center" >
      </el-table-column>
      <el-table-column label="开始时间" prop="startDate"  align="center" >
      </el-table-column>
      <el-table-column label="结束时间" prop="endDate"  align="center">

      </el-table-column>
      <el-table-column label="操作人" prop="name"  align="center" >

      </el-table-column>
      <el-table-column label="偏差角" prop="yaw" align="center">

      </el-table-column>
      <el-table-column label="操作"  align="center">
        <template slot-scope="{ row }">
          <el-button size="small" type="primary" plain @click="jumpDetail(fan,row.dataid)">查看详情</el-button>
        </template>
      </el-table-column>
      <el-table-column label="备注" prop="info" align="center">

      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        background
        :hide-on-single-page="true"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="records.length">
      </el-pagination>
    </div>

    <!-- 查看详情 -->
    <el-dialog
      :visible.sync="dialogTableVisible"
      width="50%"
      center
      top = '5vh'
    >
      <el-card :body-style="{ padding: '10px' }">
        <div slot="header" >
          <div slot="header" >
            <span style="font-size: 18px;font-weight: bolder;color: #333333">风机操作详情表</span>
            <el-button style="margin-left: 58%" type="primary" icon="el-icon-download" @click="exportExcel1">导出</el-button>
          </div>
        </div>
        <el-table
          :data="childFanInfo"
          style="width: 100%;"
          stripe
        >
          <el-table-column
            prop="Date"
            label="时间"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="name"
            label="操作人"
            align="center"
          >
          </el-table-column>
          <el-table-column
            prop="yawang"
            label="偏差角"
            align="center"
          >
          </el-table-column>
        </el-table>
      </el-card>

    </el-dialog>
  </div>
</template>

<script>
  import { get_faninfo } from '@/api/base-fan'
  export default {
    name: "record",
    data(){
        return{
          checkVal: false,
          oldOptions: [],
          fanIdList: [], // 风机号列表
          ruleForm: {
            fan: [],  // 风机号
            datePickerList: [],  // 时间日期选择器
          },
          rules: {
            fan: [
              { required: true, message: '请选择风机号', trigger: 'blur'},
              // { type: 'number', message: '风机号必须为数字值'}
            ],
          },
          dialogTableVisible: false,
          childFanInfo: [],
          currentPage: 1,
          pageSize:9,// 默认一页显示多少条信息
          value: false,
          fan: '',
          records:[],
          isInquire : false,
          fileName: '',
          childFileName: ''
        }
    },
    mounted() {
      get_faninfo({token:"backend"}).then(response => {
        let data = response.data.content
        let fanid = data[0]
        let fanname = data[1]
        let fanIdList = []
        // let allSelect = {
        //   id: 0,
        //   value: '全选'
        // }
        // fanIdList.unshift(allSelect)
        for(let i = 0; i < fanid.length; i++){
          fanIdList.push({
            id: fanid[i],
            value: fanname[i]
          })
        }
        this.fanIdList = fanIdList
        console.log(fanIdList)
       })
      .catch(error => {
        console.log(error)
      })
    },
    methods:{
      // 全选
      selectAll(val) {
        if (val) {
          let allIdArr = []
          for (let item of this.fanIdList) {
            allIdArr.push(item.value)
          }
          this.ruleForm.fan = allIdArr
        }else {
          this.ruleForm.fan = []
        }
      },
      // 选择的值发生变化
      selectChange(val) {
        this.ruleForm.fan = val
        if(val.length == this.fanIdList.length){
          this.checkVal = true
        }else {
          this.checkVal = false
        }
        console.log('选择的风机号', this.ruleForm.fan);
      },
      // 全选
      // selectAllFan(valArr) {
      //   let allIdArr = []
      //   // 保存所有选项
      //   for (let item of this.fanIdList) {
      //     allIdArr.push(item.value)
      //   }
      //   let oldVal = []
      //   if (this.oldOptions.length === 1){
      //     oldVal = []
      //   }else oldVal = this.oldOptions
      //   // 当前选中的有'全选'
      //   if (valArr.includes('全选')) {
      //     // console.log(1,this.ruleForm.fan);
      //     this.ruleForm.fan = allIdArr
      //   }
      //   // 旧数据包含'全选'，当前选中数据不包含全选
      //   if (oldVal.includes('全选') && !valArr.includes('全选')) {
      //     this.ruleForm.fan = []
      //   }
      //   // 旧数据包含'全选'，当前选中数据包含全选
      //   if (oldVal.includes('全选') && valArr.includes('全选')) {
      //     let index = valArr.indexOf('全选')
      //     valArr.splice(index, 1) // 排除全选选项
      //     this.ruleForm.fan = valArr
      //   }
      //   // 旧数据不包含'全选'，当前选中数据不包含'全选'
      //   if (!oldVal.includes('全选') && !valArr.includes('全选')) {
      //     console.log(11)
      //     // 除了全选外 其他全部选中时
      //     if (valArr.length === allIdArr.length - 1) {
      //       this.ruleForm.fan = ['全选'].concat(valArr)
      //     }
      //   }
      //   // 数据发生变化时保存数据，作为下次对比的旧数据
      //   this.oldOptions = this.ruleForm.fan
      //   console.log('选择的风机号',this.ruleForm.fan);
      // },
      getRequest(){
        let that = this
        if (that.ruleForm.fan == ''){
          that.$message.error('请选择风机号');
          return false
        }
        if (that.ruleForm.datePickerList == ''){
          that.$message.error('请选择时间');
          return false
        }
        // let selectedFanId = that.ruleForm.fan
        // let index = selectedFanId.indexOf('全选')
        // selectedFanId.splice(index, 1) // 排除全选选项
        this.$axios({
          url: 'yaw_api/modify_record',
          method: 'get',
          params: {
            "ids": that.ruleForm.fan.join(','),
            "startDate": this.ruleForm.datePickerList[0]/1000,
            "endData": this.ruleForm.datePickerList[1]/1000,
            'session': 'qwqeqeq'
          },
        }).then(function (response) {
          that.fileName = response.data.filename
          let headers = response.data.header
          let contents = response.data.content
          let temp = []
          for(let i = 0; i < contents.length; i ++){
            let t = {}
            for(let j = 0; j < headers.length; j++){
              t[headers[j]] = contents[i][j];
            }
            temp.push(t)
          }
          that.records = temp
          that.isInquire = true
        }).catch(function (error) {
            console.log(error)
        })
      },
      exportExcel() {
        if (this.isInquire && this.fileName != ''){
          window.location.href = "./data/" + this.fileName;
        }
        else{
          this.$message.error('请先查询');
        }
      },
      jumpDetail(fan,event){
        var that = this
        fan = that.ruleForm.fan
        that.dialogTableVisible = true
        this.$axios({
          url:'yaw_api/modify_record_detail',
          method: 'get',
          params: {
            session: 'sdaadakh',
            ids: fan,
            dataid: event
          }
        }).then(function (response) {
          that.childFileName = response.data.filename
          let data = response.data.content
          let temp = []
          for(let i = 0; i < data.length; i++ ) {
            let t = data[i]
            temp.push({
              Date: t[0],
              name: t[1],
              yawang: t[2],
            })
          }
          that.childFanInfo = temp
        })
      },
      exportExcel1() {
        if (this.childFileName != ''){
          window.location.href = "./data/" + this.childFileName;
        }
      },
    }
  }
</script>

<style >
  .app-container1{
    padding: 30px
  }
  .pagination{
    margin-top: 20px;
  }
  .el-checkbox {
    text-align: left;
    padding-left: 16px;
  }
</style>
