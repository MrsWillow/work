<template>
  <div class="app-container1">
    <el-row :gutter="15">
      <el-form :model="searchForm">
        <el-col :span="4">
          <el-form-item>
<!--            <el-input v-model="searchForm.fan" placeholder="请选择风机号" clearable/>-->
            <el-select
              clearable
              style="width: 100%"
              v-model="searchForm.fan"
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
          <el-form-item>
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
        <el-col :span="10">
          <el-button type="primary" icon="el-icon-search" @click="getRequest('searchForm')">查询</el-button>
          <el-button type="primary" icon="el-icon-download" @click="exportExcel()">导出</el-button>
        </el-col>
        <el-col :span="4" style="text-align: right">
          <el-button type="primary" icon="el-icon-document-add" @click="addInfo()">添加记录</el-button>
        </el-col>

      </el-form>
    </el-row>
    <div>
      <el-table
        fit
        stripe
        highlight-current-row
        :height = tableHeight
        :data="records.slice((currentPage-1)*pageSize,currentPage*pageSize)"
      >
        <el-table-column label="风机号" prop="id"  align="center" >
        </el-table-column>
        <el-table-column label="调整时间" prop="startDate"  align="center" >
        </el-table-column>
        <el-table-column label="调整角度" prop="yaw" align="center">
        </el-table-column>
        <el-table-column label="备注" prop="info" align="center">
        </el-table-column>
      </el-table>
    </div>

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


  <!--  添加记录弹框  -->
    <el-dialog
      :visible.sync="dialogFormVisible"
      width="40%"
    >
      <el-form
        :model="dialogForm"
        :rules="dialogRules"
        :label-width="formLabelWidth"
        ref="dialogForm"
      >
        <el-form-item label="调整时间:" >
          <el-form-item>
            <el-date-picker
              disabled
              style="width: 90%"
              v-model="timeValue"
              type="datetime"
              value-format="timestamp">
            </el-date-picker>
          </el-form-item>

        </el-form-item>
        <el-form-item label="风机号:" prop="fanId">
          <el-input style="width: 90%" v-model.number="dialogForm.fanId" clearable></el-input>
        </el-form-item>
        <el-form-item label="调整角度:" prop="angle" >
          <el-input style="width: 90%" v-model="dialogForm.angle" clearable></el-input>
        </el-form-item>
        <el-form-item label="备注:">
          <el-input style="width: 90%" v-model="dialogForm.remark" clearable></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="cancelAddParent">取 消</el-button>
        <el-button type="primary" @click="addParentInfo('dialogForm')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { get_faninfo } from '@/api/base-fan'
  import { addModifyRecord } from "@/api/service";

  function validFanid(rule, value, callback) {
      let fanid = parseInt(value) || 0
      if(1<= fanid && fanid <=50) {
        callback()
      }
      callback(new Error("风机号需为0-50的数字"))
  }

  export default {
    name: "record",
    data(){
        return{
          tableHeight: '424px',
          checkVal: false, // 全选按钮状态
          fanIdList: [], // 风机号列表
          searchForm: {
            fan: '',
            datePickerList: '',
          },
          dialogForm: {
            fanId: '',
            angle:'',
            remark: '',
          },
          dialogRules: {
            fanId: [
              //{ required: true, message: '请输入风机号' },
              //{ type: 'number', message: '风机号必须为数字值' },
              { trigger: 'blur', validator: validFanid }
            ],
            angle: [
              { required: true, message: '请输入调整角度' },
              { type: 'number', message: '调整角度必须为数字值' }
            ]
          },
          dialogFormVisible: false,
          formLabelWidth: '90px',
          timeValue: '', // 此刻时间值
          currentPage: 1,
          pageSize:9,// 默认一页显示多少条信息
          records:[], // 表格数据
          isInquire : false, // 是否点击了查询按钮
          fileName: '', // 导出 excel 文件名
        }
    },
    mounted() {
      get_faninfo({token:"backend"}).then(response => {
        console.log(response.data)
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
      // 查询
      getRequest(){
        let that = this
        if (that.searchForm.fan == '' || that.searchForm.datePickerList == ''){
          that.$message.error('请完善查询信息');
          return false
        }
        let fans = []
        let selected = that.searchForm.fan
        for(let i=0; i  <selected.length; i++){
          fans.push(selected[i].id)
        }
        this.$axios({
          url: 'yaw_api/modify_record',
          method: 'get',
          params: {
            "ids": fans.join(','),
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
            that.$message.info("查询结果为空!")
          }

        }).catch(function (error) {
            console.log(error)
        })
      },
      // 添加录弹框
      addInfo:function () {
        this.timeValue = new Date()
        this.dialogFormVisible = true
        setTimeout(()=> {
          this.$refs.dialogForm.resetFields()
        },10)
      },
      // 确认添加父级记录
      addParentInfo:function (formName) {
        this.$refs.dialogForm.validate((valid) => {
          var that = this
          if (valid){
            that.dialogFormVisible = false
            // push data to server
            that.pushNewRecord(that)
            // that.dialogForm.fanId = ''
            // that.dialogForm.angle = ''
            // that.dialogForm.remark = ''
            // setTimeout(()=> {
            //   that.$refs.dialogForm.resetFields()
            // },10)
          }
          else{
            return false
          }
        })
      },
      //取消添加父级记录
      cancelAddParent:function(){
        this.dialogFormVisible = false
        this.dialogForm.fanId = ''
        this.dialogForm.angle = ''
        this.dialogForm.remark = ''
      },
      //添加记录
      pushNewRecord(obj){
        let date = obj.timeValue
        let tmstamp = parseInt((new Date(date)).getTime() / 1000)
        /* plan 2 */
        let params = {
          'session': 'hhjjkkjjkjkj',
          'start_time': tmstamp,
          'operator': '',
          'id': obj.dialogForm.fanId,
          'Ywang': obj.dialogForm.angle,
          'info': obj.dialogForm.remark,
          'flag':''
        }
        addModifyRecord(obj.$qs.stringify(params))
          .then(response => {
            if(response.code == 500){
              obj.$message.error(response.msg);
            }
            obj.$message.success(response.msg);
          })
          .catch(function (error) {
            console.log(error)
          })
      },
      //导出表格
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
    padding: 30px;
  }
  .pagination{
    margin-top: 20px;
  }
  .el-checkbox {
    text-align: left;
    padding-left: 16px;
  }
</style>
