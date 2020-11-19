<template>
  <div class="app-container">

<!--  风机记录维护表 -->
    <el-card >
      <div class="tableTop">
        <span>风机维护记录表</span>
        <div>
          <el-button type="primary"  @click="addInfo">添加记录</el-button>
          <el-button style="margin-left: 10px" type="primary" icon="el-icon-download" @click="exportExcel">导出</el-button>
        </div>
      </div>
      <el-table
        :data="fansInfo"
        style="width: 100%;margin-top: 20px"
        stripe
      >
        <el-table-column label="事件id" v-if="false" align="center">
          <template slot-scope="{ row }">
            {{ row.subid }}
          </template>
        </el-table-column>
        <el-table-column label="风机号" align="center">
          <template slot-scope="{ row }">
            {{ row.id }}
          </template>
        </el-table-column>
        <el-table-column
          prop="date"
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
        <el-table-column label="详情" align="center">
          <template slot-scope="{ row }">
            <el-button type="primary" plain size="small" @click="jumpFanDetail(row.id,row.subid)">查看详情</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="info"
          label="备注"
          align="center"
          show-overflow-tooltip
        >
        </el-table-column>
      </el-table>
    </el-card>

<!--  添加父级记录  -->
    <el-dialog
      title="添加父记录"
      :visible.sync="dialogFormVisible"
      width="30%"
      center
    >
      <el-form :model="form" :rules="rules" :label-width="formLabelWidth" ref="Form">
        <el-form-item label="时间:" >
          <el-form-item>
            <el-date-picker
              disabled
              style="width: auto"
              v-model="timeValue"
              type="datetime"
              value-format="timestamp">
            </el-date-picker>
          </el-form-item>

        </el-form-item>
        <el-form-item label="风机号:" prop="fanid">
          <el-input style="width: 90%" v-model="form.fanid" clearable></el-input>
        </el-form-item>
        <el-form-item label="维护人:" prop="name" >
          <el-input style="width: 90%" v-model="form.name" clearable></el-input>
        </el-form-item>
        <el-form-item label="备注:" >
          <el-input style="width: 90%" v-model="form.info" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddParent">取 消</el-button>
        <el-button type="primary" @click="addParentInfo('form')">确 定</el-button>
      </div>
    </el-dialog>

<!-- 查看详情 -->
    <el-dialog
      :visible.sync="dialogTableVisible"
      width="50%"
      center
      top = '5vh'
    >
      <el-card :body-style="{ padding: '5px' }">
        <div slot="header">
          <span style="font-size: 18px;font-weight: bolder;color: #333333">风机号: {{ childFanID }}</span>
            <el-button type="primary"  @click="addChildInfo" style="margin-left: 30%">添加记录</el-button>
            <el-button type="primary" @click="modifyDefend">取消维护状态</el-button>
            <el-button v-if="defendState==='未维护'"  type="primary" disabled >取消维护状态</el-button>
            <el-button  type="primary" icon="el-icon-download" @click="exportExcel1">导出</el-button>

        </div>
        <el-table
          :data="childFanInfo"
          style="width: 100%;margin-top: 20px"
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

<!--  添加子级记录 -->
    <el-dialog
      title="添加子记录"
      :visible.sync="dialogTableChildVisible"
      width="30%"
      center
      append-to-body
    >
      <el-form :model="childForm" :label-width="formLabelWidth" :rules="childRules" ref="childForm">
        <el-form-item label="时间:">
          <el-date-picker
            disabled
            style="width: auto"
            v-model="timeValue"
            type="datetime"
            >
          </el-date-picker>
        </el-form-item>

        <el-form-item label="维护人:"  prop="name">
          <el-input style="width: 90%" v-model="childForm.name" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddChild">取 消</el-button>
        <el-button type="primary" @click="addChildrenInfo('childForm')">确 定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
  import { addModifyRecord,addChildModifyRecord,modifyDefendState } from '@/api/service'
  import { mapState } from 'vuex'
  //风机维护记录表
  function getPageDate(obj){
    obj.$axios({
      url: "yaw_api/record_detail_head_null",
      method: "get",
      params: {
        session: '11111'
      }
    }).then(res => {
      let data = res.data.data.content
      let fanlist = []
      for(let i=0; i<data.length; i++ ) {
        let t = data[i]
        fanlist.push({
          id: t[0],
          date: t[1],
          //name: t[2],
          name: t[3],
          yawang: t[4],
          info: t[5],
          subid:t[6]
        })

      }
      obj.fansInfo = fanlist;
      obj.fileName = res.data.filename


    })
  }

  //添加父级记录
  function pushNewRecord(obj){
    let date = obj.timeValue
    let tmstamp = parseInt((new Date(date)).getTime() / 1000)

    /* plan 2 */
    let params = {
      'session': 'hhjjkkjjkjkj',
      'start_time': tmstamp,
      'operator': obj.form.name,
      'id': obj.form.fanid,
      'Ywang': obj.getFanYaw(obj.form.fanid),
      'info': obj.form.info
    }
    addModifyRecord(obj.$qs.stringify(params))
      .then(response => {
        if(response.code == 500){
          obj.$message.error(response.msg);
        }
        console.log(111)
        getPageDate(obj);
      })
      .catch(function (error) {
        console.log(error)

      })

  }

  //添加子级记录
  function pushChildNewRecord(obj){
    let date = obj.timeValue
    let tmstamp = parseInt((new Date(date)).getTime() / 1000)

    /* plan 2 */
    let params = {
      'session': 'hhjjkkjjkjkj',
      'date': tmstamp,
      'operator': obj.childForm.name,
      'id': obj.childFanID,
      'ywang': obj.getFanYaw(obj.childFanID),
      'head_id': obj.eventID
    }
    addChildModifyRecord(obj.$qs.stringify(params))
      .then(response => {
        if (response.code != 200){
          obj.$message.error(response.msg);
        }
        console.log(response)
        obj.jumpFanDetail(obj.childFanID, obj.eventID);
      })
      .catch(function (error) {
        console.log(error)
      })

  }

  //取消维护状态
  function cancelDefend(obj) {
    let data = {
      'session': '11111',
      'id': obj.childFanID
    }
    modifyDefendState(obj.$qs.stringify(data))
    .then(function (response) {
      console.log(response)
      obj.dialogTableVisible = false
      getPageDate(obj);
    })
    .catch(function (error) {
      console.log(error)
    })
  }

  export default {
    name: "service",
    mounted() {
      getPageDate(this);
    },
    //首页所有数据
    computed:{
      ...mapState({
        fansList: state => state.fansInfo.fansList
      })
    },
    data(){
      return {
        rules: {
          fanid: [
            { required: true, message: '请输入风机号'},
            { pattern: /^\d+$/, message: '风机号只能为数字' }
          ],
          name: [
            { required: true, message: '请输入维护人信息' }
          ]
        },
        childRules: {
          name: [
            { required: true, message: '请输入维护人信息' }
          ]
        },
        fansInfo: [],  //所有风机信息
        childFanInfo: [],  //某台风机信息
        childFanID: '',   // 某台风机的风机号
        eventID: '', //风机维护记录表事件id
        defendState: '维护',
        dialogFormVisible: false,  //  添加父级记录弹框
        dialogTableVisible: false,  //  查看详情弹框
        dialogTableChildVisible: false, //  添加子级记录弹框
        //  父级记录表单
        form: {
          name: '',
          fanid: '',
          info: ''
        },
        // 子级记录表单
        childForm: {
          name: ''
        },
        formLabelWidth: '70px',
        timeValue: '', // 此刻时间值
        fileName: '', // 导出父级表格
        childFileName: '' // 导出子级表格
      }
    },
    methods:{
      // 导出父级表格
      exportExcel: function(){
        if (this.fileName != ''){
          window.location.href = "./data/" + this.fileName;
        }
      },
      // 导出子级表格
      exportExcel1: function(){
        if (this.childFileName != ''){
          window.location.href = "./data/" + this.childFileName;
        }
      },
      //取消维护状态
      modifyDefend:function () {
        cancelDefend(this)
      },
      // 查看详情
      jumpFanDetail:function (fan,event){
        this.dialogTableVisible = true
        this.childFanID = fan
        console.log(this.childFanID)
        this.eventID = event
        var that = this
        this.$axios({
          url:'yaw_api/modify_record_detail',
          method: 'get',
          params: {
            session: 'sdaadakh',
            ids: fan,
            dataid: event
          }
        })
        .then(function (response) {
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
          console.log(temp)
          that.childFanInfo = temp
        })
        .catch(function (error) {
          console.log(error)
        })
      },

      // 添加父级记录弹框
      addInfo:function () {
        this.timeValue = new Date()
        this.dialogFormVisible = true
      },

      // 添加子级记录弹框
      addChildInfo:function () {
        this.timeValue = new Date()
        this.dialogTableChildVisible = true
      },

      // 确认添加父级记录
      addParentInfo:function (formName) {
        this.$refs.Form.validate((valid) => {
          var that = this
          if (valid){
            that.dialogFormVisible = false
            // push data to server
            pushNewRecord(that)
            that.form.name = ''
            that.form.fanid = ''
            that.form.info = ''
          }
          else{
            return false
          }
        })

      },

      //取消添加父级记录
      cancelAddParent:function(){
        this.dialogFormVisible = false
        this.form.name = ''
        this.form.fanid = ''
        this.form.info = ''
      },

      // 确认添加子级记录
      addChildrenInfo:function (formName) {
        this.$refs.childForm.validate((valid) => {
          if (valid){
            let that = this
            pushChildNewRecord(that)
            that.dialogTableChildVisible = false
            that.childForm.name = ''
          }
          else {
            return false
          }
        })

      },

      // 取消添加子级记录
      cancelAddChild:function(){
        this.dialogTableChildVisible = false
        this.childForm.name = ''
      },

      // 根据风机号查找偏差角
      getFanYaw:function (FanID) {
        for (let i = 0;i < this.fansList.length; i++){
          if(this.fansList[i].id == FanID){
            console.log(this.fansList[i].yawang10)
            return this.fansList[i].yawang10 || -9999
          }
        }
        return -9999
      }

    }
  }
</script>

<style scoped>
  .top{
    background-color: white;
    color: #666666;
    font-size: 16px;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    border-radius: 3px;
    /*letter-spacing: 1px;*/
  }
  .tableTop{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bolder;
    font-size: 17px;
    padding: 0 20px;
  }
</style>
<style>
  .el-tooltip__popper {
    font-size: 14px;
    max-width:40%
  }
</style>
