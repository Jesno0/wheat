<template>
    <div>
        <el-menu-item index="/fydt">
            <span slot="title"><i class="el-icon-bangzhu"/>FYDT</span>
        </el-menu-item>
        <el-menu-item index="/interpretation">
            <span slot="title"><i class="el-icon-picture"/>述经</span>
        </el-menu-item>
        <el-menu-item index="/book">
            <span slot="title"><i class="el-icon-notebook-2"/>书本</span>
        </el-menu-item>
        <el-menu-item index="/story">
            <span slot="title"><i class="el-icon-mic"/>故事</span>
        </el-menu-item>
        <el-menu-item index="/file">
            <span slot="title"><i class="el-icon-document-copy"/>文件</span>
        </el-menu-item>
        <el-submenu index="/compress" disabled>
            <template slot="title"><i class="el-icon-document-copy"/>加解密</template>
            <el-menu-item index="3-1"><i class="el-icon-collection-tag"/>加密</el-menu-item>
            <el-menu-item index="3-2"><i class="el-icon-collection-tag"/>解密</el-menu-item>
        </el-submenu>
        <el-menu-item index="/task">
            <span slot="title"><i class="el-icon-finished"/>任务</span>
        </el-menu-item>
        <el-menu-item index="/timeline">
            <span slot="title"><i class="el-icon-time"/>时间线</span>
        </el-menu-item>
        <el-menu-item index="/genealogy">
            <span slot="title"><i class="el-icon-s-custom"/>族谱</span>
        </el-menu-item>
        <el-menu-item index="/poetry">
            <span slot="title"><i class="el-icon-headset"/>诗歌</span>
        </el-menu-item>
        <el-menu-item index="/movie">
            <span slot="title"><i class="el-icon-film"/>电影</span>
        </el-menu-item>
        <el-menu-item index="/introduce">
            <span slot="title"><i class="el-icon-tickets"/>说明</span>
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