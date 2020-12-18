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
  import File from './components/File.vue'
  import Book from './components/Book.vue'
  import Task from './components/Task.vue'
  import Genealogy from './components/Genealogy.vue'
  import Poetry from './components/Poetry.vue'
  import Movie from './components/Movie.vue'
  import Introduce from './components/Introduce.vue'

  export default {
    components: {
      MainMenu
    },
    router: new VueRouter({
      routes: [
        {path: '/',redirect: '/fydt'},
        {path: '/fydt', component: Fydt},
        {path: '/book', component: Book},
        {path: '/story', component: Story},
        {path: '/compress', component: Story},
        {path: '/task', component: Task},
        {path: '/file', component: File},
        {path: '/genealogy', component: Genealogy},
        {path: '/poetry', component: Poetry},
        {path: '/movie', component: Movie},
        {path: '/introduce', component: Introduce}
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
