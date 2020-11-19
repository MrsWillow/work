<template>
  <div class="app-container1">
    <div>
      <el-date-picker
        v-model="time"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="timestamp">
      </el-date-picker>
      <el-button type="primary" icon="el-icon-search" class="btn" @click="getRequest" >查询</el-button>
      <el-button type="primary" icon="el-icon-download" class="btn" @click="importExcel">导出</el-button>
    </div>

    <el-row>
      <el-col :span="24" style="margin-top: 20px;">
        <div v-show="noData" style="height: 350px;">
          <no-data></no-data>
        </div>
        <div v-show="!noData" id="bar" class="bar" ></div>
      </el-col>
    </el-row>

    <el-table
      :data="farmShakeList"
      style="width: 100%;margin-top: 20px;"
      stripe>
      <el-table-column  label="风机号" align="center">
        <template slot-scope="{ row }">
          {{ row.fanid }}
        </template>
      </el-table-column>
      <el-table-column label="调整次数" align="center">
        <template slot-scope="{ row }">
          {{ row.times }}
        </template>
      </el-table-column>
      <el-table-column label="可用发电量(MWH)" align="center">
        <template slot-scope="{ row }">
          {{ row.production }}
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
  import echarts from "echarts";
  import NoData from '@/components/NoData'
  let isInquire = false
  export default {
    name: "farm",
    components: {
      NoData,
    },
    data(){
      return{
        noData: true,
        time: '',
        legend: '',
        farmShakeList: [],
        dialogTableVisible: false,
        innerVisible: false,
        detailData: [],
        currentPage: 1,
        pageSize:10,// 默认一页显示多少条信息
        KPIID: '',
        kpiStartTime: '',
        kpiEndTime: '',
        fileName: ''
      }
    },
    methods:{
      getRequest: function(){
        let temp = []
        let that = this
        let time = that.time
        let startDate = parseInt(that.time[0] /1000)
        let endtDate = parseInt(that.time[1] /1000)
        if (time === ""){
          that.$message.error('请选择时间');
          return false
        }
        this.$axios({
          url: 'yaw_api/fantable',
          method: 'get',
          params: {
            'session':"sdaadakhfkjfhhls",
            'startDate' : startDate,
            'endDate' : endtDate
          },
        })
          .then(function (response) {
            console.log(response.data)
            that.noData = false
            that.fileName = response.data.filename
            var headers = response.data.header
            var contents = response.data.content
            for(let i = 0; i < contents.length; i ++){
              let t = {}
              for(let j = 0; j < headers.length; j++){
                t[headers[j]] = contents[i][j];
              }
              t['production'] = t['production']
              temp.push(t)
            }
            that.farmShakeList = temp
            let series = {}
            let x = []
            let y = []
            for(let i =0; i<contents.length; i++){
              x.push(contents[i][0])
              y.push(contents[i][2])
              series = {
                y:y,
                x:x
              }
            }
            that.$nextTick(function () {
              that.drawLines(series)
            })
            isInquire = true

          })
          .catch(function (error) {
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
            text: '风机可用发电量对比'
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
            name: '风机号',
            type: 'category',
            data: xd_data,
            axisTick: {
              show: false
            }
          },
          yAxis: {
            name:'可用发电量(MWH)',
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
        })
        var bar = echarts.init(document.getElementById('bar'));
        setTimeout(function (){
          window.onresize = function () {
            bar.resize();
          }
        },200)
      },
      changeTime:function (val) {
        let time = new Date(val)
        let year = time.getFullYear()
        let month = time.getMonth() + 1
        let day = time.getDate()
        return year + '/' + month + '/' + day
      },
      importExcel:function () {
        if (isInquire && this.fileName != ''){
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
  .el-button--medium{
    padding: 9px 20px;
    margin-left: 10px;
  }
  .el-divider--vertical{
    margin: 0 10px;
  }
  .bar{
    height:350px;
    width: 100%;
    overflow: hidden;
  }
</style>
