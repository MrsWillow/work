<template>
  <div class="passwordBox">
    <div class="passwordBoxTitle">
      密码修改
    </div>
    <el-form
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="83px"
      class="passwordForm"
      :label-position="labelPosition"
    >
      <el-form-item label="原始密码:" prop="oldPass" >
        <el-input type="password" :style="{width: inputWidth}" v-model="ruleForm.oldPass" show-password></el-input>
      </el-form-item>
      <el-form-item label="新密码:" prop="pass" >
        <el-input type="password" :style="{width: inputWidth}" v-model="ruleForm.pass"  show-password></el-input>
      </el-form-item>
      <el-form-item label="确认密码:" prop="checkPass" >
        <el-input type="password" :style="{width: inputWidth}" v-model="ruleForm.checkPass"  show-password></el-input>
      </el-form-item>
      <el-form-item class="btn">
        <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import request from "@/utils/request";
  function changePass (data) {
    return request({
      url: '/api/user/changepwd',
      method: 'POST',
      data
    })
  }
  export default {
    name: "passwd",
    data(){
      var oldPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入原始密码'));
        } else {
          if (this.ruleForm.checkPass !== '') {
            this.$refs.ruleForm.validateField('checkPass');
          }
          callback();
        }
      };
      var pass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else if (value === this.ruleForm.oldPass) {
          callback(new Error('新密码不能与原密码相同!'));
        } else {
          callback();
        }
      };
      var checkPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else if (value !== this.ruleForm.pass) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return{
        inputWidth: '95%',
        labelPosition: 'left',
        ruleForm: {
          oldPass: '',
          pass: '',
          checkPass: '',
        },
        rules: {
          oldPass: [
            { required: true, validator: oldPass, trigger: 'blur' }
          ],
          pass: [
            { required: true, validator: pass, trigger: 'blur' }
          ],
          checkPass: [
            { required: true, validator: checkPass, trigger: 'blur' }
          ],
        }
      }
    },
    methods:{
      submitForm(ruleForm) {
        this.$refs[ruleForm].validate((valid) => {
          var that = this
          if (valid) {
            changePass({
              username: 'admin',             // just on user now
              oldpwd:this.ruleForm.oldPass,
              newpwd:this.ruleForm.pass
            })
              .then(function (response) {
                // console.log(response)
                // alert('hhh')
                that.$message({
                  type: "success",
                  message: '修改成功'
                });
                that.ruleForm.oldPass = ''
                that.ruleForm.pass = ''
                that.ruleForm.checkPass = ''
              })
              .catch(function (error) {
                console.log(error)
              })
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },

    }
  }
</script>

<style scoped>
  .passwordBox{
    width: 450px;
    height: 300px;
    background-color: white;
    /*border-radius: 3px;*/
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
    border-radius: 4px;
  }
  .passwordBoxTitle{
    height: 40px;
    display:flex;
    padding-top: 10px;
    align-items: center;
    justify-content: center;
    font-weight: bolder;
    color: #666666;
    font-size: 18px;
  }
  .btn{
    display: flex;
    justify-content: flex-end;
  }
  .passwordForm{
    width: 100%;
    position: absolute;
    bottom: 0;
    padding: 0 20px;
    box-sizing: border-box;
  }
</style>
