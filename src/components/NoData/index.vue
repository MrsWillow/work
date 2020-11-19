<template>
  <div class="noData">
    <span class="noDataBox">暂无数据</span>
  </div>
</template>

<script>
  export default {
    name: "index"
  }
</script>

<style scoped>
  .noData{
    display:table;
    width: 100%;
    height:100%;
    background-color: white;
    color: #909399;
    font-size: 14px;
    text-align: center;
  }
  .noDataBox{
    height: 20px;
    width: 100px;
    display:table-cell;
    vertical-align:middle;
    /*line-height: 425px*/
  }
</style>
