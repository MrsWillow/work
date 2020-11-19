<template>
  <div class="app-container1">
    <div>
      <el-row>
        <el-form :model="rulesForm">
          <el-form-item>
            <el-col :span="4">
              <el-form-item>
<!--                <el-input v-model="rulesForm.searchId" placeholder="风机号" style="width: 93%;" clearable/>-->
                <el-select
                  clearable
                  style="width: 93%"
                  v-model="rulesForm.searchId"
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
            <el-col :span="5">
              <el-date-picker
                v-model="rulesForm.times0"
                style="width: auto"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="timestamp"
                @change="getTime0"
              />
            </el-col>
            <el-col :span="5">
              <el-date-picker
                v-model="rulesForm.times1"
                style="width: auto;margin-left: 15px"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="timestamp"
                @change="getTime1"
              />
            </el-col>
            <el-col :span="8">
              <el-button type="primary" icon="el-icon-search" class="btn" @click="getRequest">查询</el-button>
              <el-button type="primary" icon="el-icon-download" class="btn" @click="exportCSV">导出</el-button>
            </el-col>
          </el-form-item>
        </el-form>
      </el-row>
    </div>
    <el-row>
      <el-col :span="24">
        <div v-show="noData" style="height: 350px"><no-data></no-data></div>
        <div v-show="!noData" id="line" class="line" />
      </el-col>
    </el-row>

    <el-table
      stripe
      :data="tableInfo"
      style="width: 100%;margin-top: 20px; "
    >
      <el-table-column
        prop="windSpeed"
        label="风速 (m/s)"
        align="center"
      />
      <el-table-column
        prop='power'
        label="标准功率 (kw)"
        align="center"
      />
      <el-table-column
        prop="power0"
        :label="tdTime1"
        align="center"
      />
      <el-table-column
        prop="power1"
        :label="tdTime2"
        align="center"
      />
      <el-table-column
        prop='powerDiff'
        label="功率差 (kw)"
        align="center"
      />
    </el-table>

  </div>
</template>

<script>
  import echarts from 'echarts'
  import NoData from '@/components/NoData'
  import {get_faninfo} from "@/api/base-fan";
  let isInquire = false //是否查询
  function datetostr(datearr) {
    if (datearr === '') {
      return ''
    }
    const t1 = parseInt(datearr[0] / 1000)
    const t2 = parseInt(datearr[1] / 1000)
    return t1 + '-' + t2
  }

  export default {
    name: "curve",
    components: {
      NoData,
    },
    data() {
      return {
        noData: true,
        fanIdList: [], // 风机号列表
        rulesForm: {
          searchId: '',
          times0: '',
          times1: ''
        },
        data: [],
        tableInfo: [],
        tdTime2: '功率(kw)' ,
        tdTime1: '功率(kw)',
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
      drawLine(windspeed, series, legend, id = 'line') {
        this.charts = echarts.init(document.getElementById(id))
        this.charts.setOption({
          backgroundColor: 'white',
          smooth: true,
          title: {
            left: 'center',
            text: '功率曲线对比'
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
            right:"10%",
          },
          legend: {
            left: '20',
            data: legend
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              data: windspeed,
              name: '风速:m/s',
              axisTick: {
                show: false
              }
            }
          ],
          yAxis: [
            {
              type: 'value',
              splitLine: {
                show: false
              },
              name: '功率:kw',
              splitArea: {
                show: true,
                areaStyle: {
                  color: ['rgb(255,255,255)','rgb(249,249,249)']
                }
              },
              axisTick: {
                show: false
              }
            }
          ],
          series: series
        },true)
        var line= echarts.init(document.getElementById('line'));
        setTimeout(function (){
          window.onresize = function () {
            line.resize();
          }
        },200)
      },
      getRequest: function() {
        let that = this
        let times0 = that.rulesForm.times0
        let times1 = that.rulesForm.times1
        let fanid = that.rulesForm.searchId
        if (fanid === '' || fanid < 0 || times0 === '') {
          that.$message.error('请完善查询信息');
          return false
        }
        let times = datetostr(times0)
        if (times1 !== '') {
          times = times + ',' + datetostr(times1)
        }
        this.$axios({
          url: 'yaw_api/powcurve',
          method: 'get',
          params: {
            'ids': fanid.id,
            'dates': times, // '1539937846-1571473846,1571473846-1603009847',
            'session': 'qwqeqeq'
          }
        })
          .then(function(response) {
            that.noData = false
            that.fileName = response.data.filename
            const headers = response.data.header
            const datas = response.data.content
            let windSpeed,power,power0,power1,powerDiff = undefined
            let legend = ['标准功率']
            let series = []
            for (let i = 0; i < headers.length; i++) {
              let name = headers[i]
              if(name == "xpoints"){
                windSpeed = datas[i]
              }else if(name == "standPower"){
                power = datas[i]
              }else if(name == "diff"){
                powerDiff = datas[i]
              }else{
                if(power0 == undefined){
                  power0 = datas[i]
                  legend.push(headers[i])
                  series.push({
                    name: headers[i],
                    type: 'line',
                    data: datas[i],
                  })
                  that.tdTime1 = '功率(kw)[' + headers[i] +']'
                }else if(power1 == undefined){
                  power1 = datas[i]
                  legend.push(headers[i])
                  series.push({
                    name: headers[i],
                    type: 'line',
                    data: datas[i],
                  })
                  that.tdTime2 = '功率(kw)[' + headers[i] +']'
                }
              }
            }
            series.push({
              name: "标准功率",
              type: 'line',
              data: power,
            })
            const tableData = []
            for (let i = 0; i < windSpeed.length; i++) {
              let t = {}
              t['windSpeed'] = windSpeed[i]
              t['power'] = power[i]
              t['powerDiff'] = powerDiff[i]
              if(power0 != undefined){
                t['power0'] = power0[i]
              }
              if(power1 != undefined){
                t['power1'] = power1[i]
              }
              tableData.push(t)
            }
            that.tableInfo = tableData
            that.$nextTick(function () {
              that.drawLine(windSpeed, series, legend)
            })
            isInquire = true
          })
          .catch(function(error) {
            console.log(error)
          })
      },
      getTime0: function(val) {
        if (val) {
          var startTime = val[0] / 1000
          var endTime = val[1] / 1000
          var Time = startTime + '-' + endTime
        }
      },
      getTime1: function(val) {
        if (val) {
          var startTime = val[0] / 1000
          var endTime = val[1] / 1000
          var Time = startTime + '-' + endTime
        }
      },
      changeTime: function(val) {
        const time = new Date(val)
        const year = time.getFullYear()
        const month = time.getMonth() + 1
        const day = time.getDate()
        return year + '/' + month + '/' + day
      },
      exportCSV: function() {
        if(isInquire && this.fileName != ''){
          window.location.href = "./data/" + this.fileName;
        }
        else{
          this.$message.error('请先查询');
        }
      }
    }
  }
</script>

<style scoped>
  .app-container1{
    padding: 30px
  }
  .dataPicker{
    margin-left: 10px;
    width: 30%;
  }
  .el-button--medium{
    padding: 9px 20px;
    margin-left: 15px;
  }
  .line{
    /*margin-top: 10px;*/
    width: auto;
    height: 350px;
    overflow: hidden;
  }
</style>
