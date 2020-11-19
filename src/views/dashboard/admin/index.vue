<template>
  <div class="app-container">
    <div class="head">
      <el-row >
        <el-col :span="8">
          <div class="head-right">
            <i class="el-icon-s-cooperation" :style="{fontSize : iconSize}" style="color: #9aa8b9" ></i>
            <div class="state-num">{{ sumLost }}&nbsp;kwh</div>
          </div>
        </el-col>
        <el-col :span="16">
            <el-row>
              <el-col :span="8">
                <div class="head-right">
                  <el-divider direction="vertical" ></el-divider>
                  <i class="el-icon-success" :style="{fontSize : iconSize}" style="color: #00d200"></i>
                  <div class="state-title">正常</div>
                  <div class="state-num">{{ normalNum }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="head-right">
                  <el-divider direction="vertical" ></el-divider>
                  <i class="el-icon-warning" :style="{fontSize : iconSize}" style="color: #d99030"></i>
                  <div class="state-title">轻微</div>
                  <div class="state-num">{{ warnNum }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="head-right">
                  <el-divider direction="vertical" ></el-divider>
                  <i class="el-icon-error" :style="{fontSize : iconSize}" style="color: #E4514A"></i>
                  <div class="state-title">严重</div>
                  <div  class="state-num">{{ errorNum }}</div>
                </div>
              </el-col>
            </el-row>
        </el-col>
      </el-row>
    </div>

    <div class="content">
      <el-row :gutter="13" >
        <el-col :span="4" class="fans-detail-col" v-for="(item,index) in fansList" :key="index" >
          <div class="fans-detail">
            <div class="fans-detail-top">
              <div style="display: flex">
                风机号: {{ item.id }}
              </div>
              <span v-if="(item.state30 === '正常')" class="fans-detail-top-stateBox" :style="{ backgroundColor:Normal}">{{ item.state30 }}</span>
              <span v-else-if="(item.state30 === '轻微')" class="fans-detail-top-stateBox" :style="{ backgroundColor:Warning}">{{ item.state30 }}</span>
              <span v-else-if="(item.state30 === '严重')" class="fans-detail-top-stateBox" :style="{ backgroundColor:Error}">{{ item.state30 }}</span>
              <span v-else class="otherState">无效</span>
            </div>
            <div class="fans-detail-top1">
              <div>损失系数:&nbsp;{{ item.lost30 }}</div>
              <div>偏差角:&nbsp;{{ item.yawang30 }}</div>
            </div>

            <div class="pointer" :style="{ marginLeft: calPointerWidth(item.yawang30, -12, 12, 80) }">
              <i v-if="item.state30 === '正常'" class="el-icon-caret-bottom" style="color: #00d200"></i>
              <i v-else-if="item.state30 === '轻微'" class="el-icon-caret-bottom" style="color: #d99030"></i>
              <i v-else-if="item.state30 === '严重'" class="el-icon-caret-bottom" style="color: #E4514A"></i>
              <i v-else class="el-icon-caret-bottom" style="color: #adacac"></i>
            </div>

            <div class="progress" ref="progress"> </div>
            <div class="dials">
              <span>-12</span>
              <span>-8</span>
              <span>-4</span>
              <span>0</span>
              <span>4</span>
              <span>8</span>
              <span>12</span>
            </div>
          </div>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'DashboardAdmin',
  mounted() {
    this.getRequest()
  },
  // computed: {
  //   ...mapState({
  //     switchState: state => state.switchState.switchState
  //   })
  // },
  data() {
    return {
      iconSize: '280%',
      fansList: [],
      Defend: '#e8b85f',
      Error: '#E4514A',
      Warning: '#d99030',
      Normal: '#00d200',
      isWarning:'yellow',
      normalNum: '',
      warnNum: '',
      errorNum: '',
      sumLost: '',
    }
  },
  methods: {
    getRequest() {
      let temp = []
      var that = this
      let n = 0, m = 0,l = 0,sum = 0
      setTimeout(function () {
        that.getRequest()
      },60 * 1000)
      this.$axios.get('yaw_api/summary',{
        params: {
          session: '11111'
        }
      })
        .then(function (response) {
          console.log(response.data);
          var header = response.data.data.header
          var content = response.data.data.content
          var describe = response.data.data.describe
          for(let i = 0; i < content.length; i ++){
            let t = {}
            for(let j = 0; j < header.length; j++){
              t[header[j]] = content[i][j]
            }
            temp.push(t)
          }
          // 数据是否有效
          if (!describe.vaild_30) {
            for (let i = 0; i< temp.length; i ++){
              temp[i].lost30 = 0
              temp[i].yawang30 = 0
              temp[i].state30 = '无效'
            }
            that.sumLost = 0
            console.log('数据无效')
            that.fansList = temp
            that.normalNum = 0;
            that.errorNum = 0;
            that.warnNum = 0;
          }
          else{
            console.log('fansInfoList',temp)
            that.fansList = temp
            that.$store.commit('fansInfo/saveFansInfo',temp)
            for (let i = 0; i < temp.length; i++) {
              if (temp[i].state30 === '正常') {
                n ++ ;
              }
              if (temp[i].state30 === '轻微') {
                l ++;
              }
              if (temp[i].state30 === '严重') {
                m ++;
              }
              temp[i].lost30.toFixed(2)
              temp[i].yawang30.toFixed(2)
            }
            sum = describe.lose_pow_30
            that.normalNum = n;
            that.errorNum = m;
            that.warnNum = l;
            that.sumLost = sum.toFixed(2)
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    calPointerWidth(now, min, max, percentage = 80/* 元素所占全部的百分比*/) {
      if (now > max){
        return 85 + '%'
      }else if (now < min){
        return 10 + '%'
      }
      const meta = percentage / (max - min)
      const width = (now - min) * meta + (100 - percentage) / 2 - 1 /* 1 is a fix value*/
      return width + '%'
    },
  },
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  /*position: relative;*/
}
.head{
  height: 110px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}
.el-divider--vertical{
  height: 3em;
  width: 2px;
  margin: 0;
}
.content{
  /*min-height: calc(100vh - 200px);*/
  /*background-color: #d8dce5;*/
  margin-top: 20px;
}
.head-left{
  height: 110px;
  background-color: white;
  padding:0 20px;
  /*display: flex;*/
  /*flex-direction: column;*/
}
.head-right{
  background: white;
  height: 110px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 8%;
  padding-right: 10%;
}
.state-title{
  font-size: 23px;
  color: #979797;
  letter-spacing: 2px;
}
.state-num{
  color: #333333;
  font-size: 45px;
}
.fans-detail{
  height: 130px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
  border-radius: 4px;
}
.fans-detail-col{
  margin-bottom: 15px;
}
.fans-detail-top-stateBox{
  padding: 1px 3px;
  /*background-color:#00d200;*/
  color: white;
  font-size: 13px;
  margin-left: 5px
}
.otherState{
  /*height: 14px;*/
  /*width: 28px;*/
  padding: 1px 3px;
  font-size: 13px;
  background-color: #adacac;
  color: white;
}
.fans-detail-top{
  display: flex;
  justify-content: space-between;
  padding: 15px 14px 0;
  font-size: 13px;
  font-weight: bolder;
  color: #333333;
  align-items: center;
}
.fans-detail-top1{
  display: flex;
  justify-content: space-between;
  padding: 5px 14px 0;
  font-size: 13px;
  color: #666666;
  align-items: center;
}
.pointer{
  width: 8px;
  height: 9px;
  /*color: #E4514A;*/
  margin-top: 27px
}
.progress{
  margin:10px auto 0 ;
  height: 2px;
  width: 80%;
  background: linear-gradient(270deg, #E4514A 0%, #E8B85E 23.96%, #2CD049 48.96%, #E8B85E 77.92%, #E4514A 100%);
}
.dials{
  display: flex;
  justify-content: space-between;
  font-size: 10px;width: 80%;
  margin: 0 auto
}
</style>
