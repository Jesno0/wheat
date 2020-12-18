<template>
    <div>
        <el-divider content-position="left">使用说明</el-divider>
        <el-form class="content" label-width="auto">
            <el-form-item>
                执行操作后，可在
                <el-link href="/#/task">任务</el-link>
                菜单中查看具体进度。
            </el-form-item>
        </el-form>

        <el-divider content-position="left">网页打开</el-divider>
        <el-form class="content" label-width="auto">
            <el-form-item>
                若需要大界面，可使用浏览器：
                <el-link href="http://localhost:3003" target="_blank"> http://localhost:3003 </el-link>
            </el-form-item>
        </el-form>
        

        
    </div>
</template>

<script>
    import '../../css/Element.css'
    import '../../css/RouterView.css'

    export default {
        name: 'Introduce'
    }
</script>

<style scoped>
</style>