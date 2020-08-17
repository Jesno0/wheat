<template>
    <div>
        <el-divider content-position="left">访问原网址</el-divider>
        <el-form class="content" label-width="auto">
            <el-form-item label="520听书网:">
                <el-link href="http://www.520tingshu.com" target="_blank">http://www.520tingshu.com</el-link>
            </el-form-item>
            <el-form-item label="喜玛拉雅:">
                <el-link href="https://www.ximalaya.com/" target="_blank">https://www.ximalaya.com</el-link>
            </el-form-item>
        </el-form>
           

        <el-divider content-position="left">下载资源</el-divider>
        <down-form class="content" ref="form" v-on:submit="submitForm"
                   urlPlaceholder="请复制上面网址中故事目录地址在这里。例如：http://www.520tingshu.com/book/book5542.html">
        </down-form>

        <el-divider content-position="left">显示结果</el-divider>
        <result class="content" ref="result"></result>
    </div>
</template>

<script>
    import '../../css/Element.css'
    import '../../css/RouterView.css'
    import {ApiStoryInit,ApiStorySync} from '../../js/api'
    import DownForm from './common/DownForm.vue'
    import Result from './common/Result.vue'

    export default {
        name: 'Story',
        components: {
            DownForm,
            Result
        },
        data () {
            return {}
        },
        mounted () {
            let _this = this;
            let _result = _this.$refs.result;
            let _form = _this.$refs.form;
            ApiStoryInit().then(function (init_data) {
                _form.init(Object.assign({
                    save: 'D:\\故事',
                    url: ''
                },init_data));
                _result.write('初始化成功');
            }).catch(function (err) {
                _result.write(err);
                _result.write('初始化失败');
            });
        },
        methods: {
            submitForm(opts) {
                let _this = this;
                let _result = _this.$refs.result;
                _result.write('任务开始中...');
                ApiStorySync(opts).then(function (result) {
                    _result.write('任务完成');
                    _result.write(result);
                }).catch(function (err) {
                    _result.write(err);
                    _result.write('任务失败');
                });
            }
        }
    }
</script>

<style scoped>
</style>