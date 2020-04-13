<template>
  <el-container>
    <el-header>Wheat</el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="$route.path" router>
          <main-menu></main-menu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
  import VueRouter from 'vue-router'
  import MainMenu from './components/MainMenu.vue'
  import Fydt from './components/Fydt.vue'
  import Story from './components/Story.vue'

  export default {
    components: {
      MainMenu,
      Fydt,
      Story
    },
    router: new VueRouter({
      routes: [
        {path: '/',redirect: '/fydt'},
        {path: '/fydt', component: Fydt},
        {path: '/520tingshu', component: Story},
        {path: '/compress', component: Story},
        {path: '/task', component: Story}
      ]
    })
  }
</script>

<style scoped>
  .el-container {
    border: 1px solid #eee;
    font-family: Microsoft YaHei;
    color: #303133;
  }
  .el-header {
    background-color: #B3C0D1;
    line-height: 60px;
    text-align: right;
    font-size: 20px;
    color: #ffffff;
  }
  .el-aside {
    overflow: hidden;
  }
  .el-main {
    border: 1px solid #eee;
    padding-left:40px;
    padding-right:100px;
  }
</style>
