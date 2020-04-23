<template>
    <div>
        <el-menu-item index="/fydt">
            <span slot="title"><i class="el-icon-bangzhu"></i>FYDT</span>
        </el-menu-item>
        <el-menu-item index="/story">
            <span slot="title"><i class="el-icon-mic"></i>故事</span>
        </el-menu-item>
        <el-submenu index="/compress" disabled>
            <template slot="title"><i class="el-icon-document-copy"></i>加解密</template>
            <el-menu-item index="3-1"><i class="el-icon-collection-tag "></i>加密</el-menu-item>
            <el-menu-item index="3-2"><i class="el-icon-collection-tag "></i>解密</el-menu-item>
        </el-submenu>
        <el-menu-item index="/task">
            <span slot="title"><i class="el-icon-finished"></i>任务</span>
        </el-menu-item>
        <el-menu-item>
            <span slot="title"><i class="el-icon-s-custom"></i>
                <el-link href="https://www.processon.com/view/link/5e7aedf9e4b08e4e243bb389" target="_blank">族谱</el-link>
            </span >
        </el-menu-item>
        <el-menu-item>
            <span slot="title"><i class="el-icon-headset"></i>
                <el-link href="https://www.zanmeishi.com/" target="_blank">诗歌</el-link>
            </span >
        </el-menu-item>
        <el-menu-item index="/movie">
            <span slot="title"><i class="el-icon-film"></i> 电影</span>
        </el-menu-item>
    </div>
</template>

<script>
    import '../../css/Element.css';
    
    export default {
        name: 'MainMenu',
        data () {
            return {}
        }
    }
</script>

<style scoped>

</style>