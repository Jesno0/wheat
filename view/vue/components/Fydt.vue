<template>
    <div>
        <el-divider content-position="left">访问原网址</el-divider>
        <el-link class="content" href="https://www.fydt.org" target="_blank">https://www.fydt.org</el-link>

        <el-divider content-position="left">下载资源</el-divider>
        <down-form class="content" ref="form" v-on:submit="submitForm"></down-form>

        <el-divider content-position="left">显示结果</el-divider>
        <result class="content" ref="result"></result>
    </div>
</template>

<script>
    import '../../css/Element.css'
    import '../../css/RouterView.css'
    import {ApiFydtInit,ApiFydtSync} from '../../js/api'
    import DownForm from './common/DownForm.vue'
    import Result from './common/Result.vue'

    export default {
        name: 'Fydt',
        data () {
            return {
            }
        },
        components: {
            DownForm,
            Result
        },
        mounted () {
            let _this = this;
            let _result = _this.$refs.result;
            let _form = _this.$refs.form;
            ApiFydtInit().then(function (init_data) {
                _form.init(Object.assign({
                    save: 'D:\\fydt资料'
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
                ApiFydtSync(opts).then(function (result) {
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