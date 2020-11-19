<template>
  <div class="app-container1">
    <el-row :gutter="15">
      <el-form :model="searchForm" >
        <el-col :span="4">
          <el-form-item>
            <el-select
              clearable
              style="width: 100%"
              v-model="searchForm.fan"
              filterable
              placeholder="请选择风机号:">
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

    <el-row>
      <el-col :span="24">
        <div v-show="noData" style="height: 350px;"><no-data></no-data></div>
        <div v-show="!noData" id="bar" class="bar" ></div>
      </el-col>
    </el-row>
    <el-table
      fit
      stripe
      highlight-current-row
      :data="records"
      style="width: 100%;margin-top: 20px"
    >
      <el-table-column label="风速(m/s)" prop="windSpeed"  align="center" >
      </el-table-column>
      <el-table-column label="频率(h)" prop="hours"  align="center" >
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import echarts from "echarts";
import NoData from '@/components/NoData'
import {get_faninfo} from "@/api/base-fan";

export default {
  name: "windmap",
  components: {
    NoData,
  },
  data(){
    return{
      noData: true,
      fanIdList: [], // 风机号列表
      searchForm: {
        fan: '',  // 风机号
        datePickerList: '',  // 时间日期选择器
      },
      rules: {
        fan: [
          { required: true, message: '请输入风机号'},
          { type: 'number', message: '风机号必须为数字值'}
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
    getRequest:function(){
      let that = this
      if (that.searchForm.fan == '' || that.searchForm.datePickerList == ''){
        that.$message.error('请完善查询信息');
        return false
      }
      this.$axios({
        url: 'yaw_api/windmap',
        method: 'get',
        params: {
          "fanid": this.searchForm.fan.id,
          "startDate": this.searchForm.datePickerList[0]/1000,
          "endDate": this.searchForm.datePickerList[1]/1000,
          'session': 'qwqeqeq'
        },
      }).then(function (response) {
        console.log(response.data.content.length);
        if (response.data.content.length) {
          that.noData = false
          that.fileName = response.data.filename
          let headers = response.data.header
          let contents = response.data.content
          let temp = []
          // let len = contents[0].length || 0
          for(let i = 0; i < contents[0].length; i ++){
            let t = {}
            for(let j = 0; j < headers.length; j++){
              t[headers[j]] = contents[j][i];
            }
            temp.push(t)
          }
          that.records = temp
          that.$nextTick(function () {
            that.drawLines({x:contents[0]||[], y:contents[1]||[]}, headers)
          })
          that.isInquire = true
        }
        else {
          that.isInquire = true
          that.records = []
          that.noData = true
          that.$message.info("查询结果为空!")
        }
      }).catch(function (error) {
        console.log(error)
      })
    },
    drawLines(series,legend,id = 'bar'){
      let chartSeries = []
      let xd_data = []
      if(xd_data.length === 0)
      {
        xd_data = series['x']
        // xd_data = new Array(50).fill('').map( (item, index) => index+1);
      }
      chartSeries.push(
        {
          name: this.legend,
          type: 'bar',
          data: series['y'],
          // data: new Array(50).fill('').map( (item, index) => index+1),
          barWidth: '60%',
          itemStyle: {
            normal: {
              color: '#358cff'
            }
          }
        }
      )
      this.charts = echarts.init(document.getElementById(id))
      this.charts.setOption({
        backgroundColor:'#fff',
        title: {
          left:'center',
          text: '风频图'
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
        legend: {
          left:'20',
          data: legend,
        },
        xAxis: {
          name: '风速(m/s)',
          type: 'category',
          data: xd_data,
          axisLabel: {
            show: true,
            interval:0,
            rotate:45
          },
        },
        yAxis: {
          name:'频率(h)',
          type: 'value',
          splitLine:{
            show:false
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgb(255,255,255)','rgb(249,249,249)']
            }
          },
          axisTick: {
            show: false
          }
        },
        series: chartSeries
      },true)
      var bar = echarts.init(document.getElementById('bar'), true);
      setTimeout(function (){
        window.onresize = function () {
          bar.resize();
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
    },
  }
}
</script>

<style scoped>
  .app-container1{
    padding: 30px
  }
  .pagination{
    margin-top: 20px;
  }

  .bar{
  height:350px;
  width: 100%;
  overflow: hidden;
}
</style>
