<template>
  <div class="app-container1">
    <div>
      <el-row :gutter="15">
        <el-form :model="ruleForm">
          <el-col :span="4">
            <el-form-item>
<!--              <el-input style="width: 100%" v-model="ruleForm.searchInput" placeholder="风机号" />-->
              <el-select
                clearable
                style="width: 100%"
                v-model="ruleForm.searchInput"
                collapse-tags
                multiple
                filterable
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
            <el-button type="primary" icon="el-icon-search"  @click="getRequest">查询</el-button>
            <el-button type="primary" icon="el-icon-download" @click="exportExcel()">导出</el-button>
          </el-col>

        </el-form>
      </el-row>
    </div>
    <el-row :gutter="15" >
      <el-col :span="14">
        <el-table
          height="425px"
          stripe
          highlight-current-row
          style="width: 100%;"
          :data="list.slice((currentPage-1)*pageSize,currentPage*pageSize)"
        >
          <el-table-column label="时间" prop="endDate"  align="center" height="10px">
          </el-table-column>
          <el-table-column label="风机号"  align="center" >
            <template slot-scope="{ row }">
              <div >{{ row.name }}</div>
            </template>
          </el-table-column>
          <el-table-column label="偏差角"   align="center" >
            <template slot-scope="{ row }">
              <div >{{ row.yawang }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" prop="state" align="center">
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination
            background
            :current-page.sync="currentPage"
            :page-size="pageSize"
            layout="total, prev, pager, next, jumper"
            :total="list.length">
          </el-pagination>
        </div>
      </el-col>
      <el-col :span="10">
        <div v-show="noData" ><no-data></no-data></div>
        <div v-show="!noData" id="hhh" style="width: 100%;height:425px;margin: 0 auto"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import echarts from 'echarts'
import NoData from '@/components/NoData'
import {get_faninfo} from "@/api/base-fan";
export default {
  name: "index",
  components: {
    NoData,
  },
  data(){
    return {
      checkVal: false, // 全选按钮状态
      fanIdList: [], // 风机号列表
      noData: true,
      ruleForm: {
        searchInput: '',  // 输入框
        datePickerList: '',  // 时间日期选择器
      },
      // rules: {
      //   searchInput: [
      //     { required: true, message: '请输入风机号', trigger: 'blur' },
      //     { pattern: /^\d+(,\d+)*$/,message: '请按规则输入风机号' }
      //   ],
      // },
      currentPage: 1,  // 当前显示第几页
      pageSize:9, // 默认一页显示多少条信息
      list: [],
      xContent: [],
      yContent: [],
      isInquire: false,
      fileName: ''
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
        this.ruleForm.searchInput = this.fanIdList
      }else {
        this.ruleForm.searchInput = []
      }
    },
    // 选择的值发生变化
    selectChange(val) {
      this.ruleForm.searchInput = val
      if(val.length == this.fanIdList.length){
        this.checkVal = true
      }else {
        this.checkVal = false
      }
      // console.log('选择的风机号', this.ruleForm.searchInput);
    },
    getRequest() {
      let temp = []
      var that = this
      if (that.ruleForm.searchInput == '' || that.ruleForm.datePickerList == ''){
        that.$message.error('请完善查询信息');
        return false
      }
      let fans = []
      let selected = that.ruleForm.searchInput
      for(let i=0; i  <selected.length; i++){
        fans.push(selected[i].id)
      }
      this.$axios({
        url: 'yaw_api/history',
        method: 'get',
        params: {
          "session": "sdaadakhfkjfhhls",
          "ids":fans.join(','),
          "startDate":this.ruleForm.datePickerList[0]/1000,
          "endData":this.ruleForm.datePickerList[1]/1000,
          "minSet":10
        },
      })
        .then(function (response) {
          console.log(response.data)
          if (response.data.content.length) {
            that.noData = false
            that.fileName = response.data.filename

            var head = response.data.header
            var content = response.data.content
            for(let i = 0; i < content.length; i ++){
              let t = {}
              for(let j = 0; j < head.length; j++){
                t[head[j]] = content[i][j];
              }
              temp.push(t)
            }
            for (let i = 0;i < temp.length; i++){
              // temp[i].endData.push(endDataArr)
              temp[i].yawang = temp[i].yawang.toFixed(2)
            }
            that.list = temp

            let fanids = {}
            for(let i=0; i<temp.length; i++){
              let key = temp[i].name
              if(fanids[key] == undefined){
                fanids[key] = {
                  time:[],
                  yawang:[]
                }
              }
              fanids[key].time.push(temp[i].endDate);
              fanids[key].yawang.push(temp[i].yawang);
            }
            console.log(fanids)
            let stdtime = []
            let series = []
            for(let fanid in fanids){
              if(stdtime.length == 0){
                stdtime = fanids[fanid].time
              }
              if(stdtime.sort().toString() != fanids[fanid].time.sort().toString()){
                console.log("WARN:时间戳没有对齐")
              }
              series.push({
                name: fanid,
                data: fanids[fanid].yawang,
                type: 'line',
                smooth: true
              })
            }
            // that.drawLines(stdtime, series)
            that.isInquire = true;
            that.$nextTick(
              function () {
                that.drawLines(stdtime, series)
              }
            )
          }
          else {
            that.isInquire = true;
            that.noData = true
            that.list = []
            that.$message.info("查询结果为空")
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    drawLines(x_data, serices, id='hhh'){
      let dom = document.getElementById(id)
      //console.log('dom is', echarts.getInstanceByDom(dom))
      // echarts.dispose(dom)
      this.charts =  echarts.init(dom)
      this.charts.setOption({
        backgroundColor:'#fff',
        title: {
          left:'center',
          text: '偏差角趋势图'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          },
          top: 0,
          right:"10%",
        },
        xAxis: {
          name: '时间',
          type: 'category',
          data: x_data, //['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
          name: '偏差角',
          type: 'value',
          splitLine:{
            show:false
          },
        },
        series: serices,
      },true)
      var line= echarts.init(document.getElementById('hhh'));
      setTimeout(function (){
        window.onresize = function () {
          line.resize();
        }
      },200)

    },
    exportExcel:function () {
      if (this.isInquire && this.fileName != ''){
        window.location.href = "./data/" + this.fileName;
      }
      else{
        this.$message.error('请先查询');
      }
    }
  },
}
</script>

<style scoped>
  .app-container1{
    padding: 30px;
  }
  .pagination{
    margin-top: 50px;
  }
  .noData{
    height:425px;
    background-color: white;
    color: #909399;
    font-size: 14px;
    text-align: center;
  }
</style>
<style>
  .el-checkbox {
    text-align: left;
    padding-left: 16px;
  }
</style>
