<template>
  <div class="app-container1">
    <el-row :gutter="15">
      <el-form :model="searchForm">
        <el-col :span="4">
          <el-form-item>
            <!--            <el-input v-model.number="searchForm.fan" placeholder="请选择风机号" clearable/>-->
            <el-select
              clearable
              style="width: 100%"
              v-model="searchForm.fan"
              collapse-tags
              multiple
              filterable
              value-key="id"
              @change="selectChange"
              placeholder="请选择风机号:">
              <el-checkbox v-model="checkVal" @change="selectAll">全选</el-checkbox>
              <el-option
                v-for="item in fanIdList"
                :key="item.id"
                :value="item"
                :label="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item >
            <el-date-picker
              style="width: 100%"
              v-model="searchForm.datePickerList"
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
      :height = tableHeight
      :data="records.slice((currentPage-1)*pageSize,currentPage*pageSize)"
    >
      <el-table-column label="风机号" prop="id"  align="center" >
      </el-table-column>
      <el-table-column label="起始时间" prop="startDate"  align="center" >
      </el-table-column>
      <el-table-column label="结束时间" prop="startDate"  align="center" >
      </el-table-column>
      <el-table-column label="偏差角" prop="yawang" align="center">
      </el-table-column>
      <el-table-column label="损失系数" prop="pwlose" align="center">
      </el-table-column>
      <el-table-column label="状态" prop="state" align="center">
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


  </div>
</template>

<script>
import { get_faninfo } from '@/api/base-fan'

export default {
  name: "history",
  data(){
    return{
      tableHeight: '424px',
      checkVal: false,
      fanIdList: [], // 风机号列表
      searchForm: {
        fan: '',  // 风机号
        datePickerList: '',  // 时间日期选择器
      },
      timeValue: '', // 此刻时间值
      currentPage: 1,
      pageSize:9, // 默认一页显示多少条信息
      records:[], // 表格数据
      isInquire : false, // 是否点击了查询按钮
      fileName: '',  // 导出 excel 文件名
    }
  },
  mounted() {
    get_faninfo({token:"backend"}).then(response => {
      let data = response.data.content
      let fanid = data[0]
      let fanname = data[1]
      let fanIdList = []
      for(let i = 0; i < fanid.length; i++){
        fanIdList.push({
          id: fanid[i],
          value: fanname[i]
        })
      }
      this.fanIdList = fanIdList
    })
      .catch(error => {
        console.log(error)
      })
  },

  methods:{
    // 全选
    selectAll(val) {
      if (val) {
        this.searchForm.fan = this.fanIdList
      }else {
        this.searchForm.fan = []
      }
    },
    // 选择的值发生变化
    selectChange(val) {
      this.searchForm.fan = val
      if(val.length == this.fanIdList.length){
        this.checkVal = true
      }else {
        this.checkVal = false
      }
      // console.log('选择的风机号', this.searchForm.fan);
    },

    getRequest(){
      let that = this
      if (that.searchForm.fan == '' || that.searchForm.datePickerList == ''){
        that.$message.error('请完善查询信息');
        return false
      }
      let fans = []
      let selected = that.searchForm.fan
      for(let i=0; i<selected.length; i++){
        fans.push(selected[i].id)
      }
      this.$axios({
        url: 'yaw_api/history_yaw',
        method: 'get',
        params: {
          "ids": fans.join(','),  //that.searchForm.fan.join(','),
          "startDate": this.searchForm.datePickerList[0]/1000,
          "endData": this.searchForm.datePickerList[1]/1000,
          'session': 'qwqeqeq'
        },
      }).then(function (response) {
        console.log(response.data);
        if (response.data.content.length) {
          that.tableHeight = ''
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
          that.currentPage = 1
          that.records = temp
          that.isInquire = true
        }
        else {
          that.tableHeight = '424px'
          that.isInquire = true
          that.records = []
          that.$message.info("查询结果为空")
        }
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
