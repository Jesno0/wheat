<template>
  <el-container>
    <el-header height="50px">Wheat</el-header>
    <el-container>
      <el-aside width="120px">
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
  import '../css/Element.css'
  import VueRouter from 'vue-router'
  import MainMenu from './components/MainMenu.vue'
  import Fydt from './components/Fydt.vue'
  import Story from './components/Story.vue'
  import Task from './components/Task.vue'
  import Movie from './components/Movie.vue'

  export default {
    components: {
      MainMenu
    },
    router: new VueRouter({
      routes: [
        {path: '/',redirect: '/fydt'},
        {path: '/fydt', component: Fydt},
        {path: '/story', component: Story},
        {path: '/compress', component: Story},
        {path: '/task', component: Task},
        {path: '/movie', component: Movie}
      ]
    })
  }
</script>

<style scoped>
  .el-container {
    border: 1px solid #eee;
    color: #303133;
  }
  .el-header {
    background-color: #B3C0D1;
    line-height: 50px;
    text-align: right;
    font-size: 20px;
    color: #ffffff;
  }
</style>
