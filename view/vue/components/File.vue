<template>
    <div>
        <el-divider content-position="left">复制文件</el-divider>
        <down-form class="content" ref="form" v-on:submit="submitForm"
                   urlPlaceholder="请填写需要复制的文件夹地址。例如：D:\\wheat资料">
        </down-form>
        
        <el-divider content-position="left">生成目录</el-divider>
        <down-form class="content" ref="form_catalog" name="form_catalog" v-on:submit="submitForm_catalog"
                   urlPlaceholder="请填写需要生成目录的文件夹地址。例如：D:\\wheat资料">
        </down-form>

        <el-divider content-position="left">显示结果</el-divider>
        <result class="content" ref="result"></result>
    </div>
</template>

<script>
    import '../../css/Element.css'
    import '../../css/RouterView.css'
    import {ApiFileInit,ApiFileSync,ApiFileCatalogue} from '../../js/api'
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
            let _form_catalog = _this.$refs.form_catalog;
            ApiFileInit().then(function (init_data) {
                _form.init({
                    save: 'D:\\复制文件',
                    url: '',
                    is_dir: "1",
                    formats: init_data.formats,
                    types: init_data.types,
                });
                _form_catalog.init({
                    url: '',
                    sorts: init_data.sorts,
                    sort_types: init_data.sort_types,
                    types: init_data.types
                });
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
                ApiFileSync(opts).then(function (result) {
                    _result.write('任务完成');
                    _result.write(result);
                }).catch(function (err) {
                    _result.write(err);
                    _result.write('任务失败');
                });
            },
            submitForm_catalog(opts) {
                let _this = this;
                let _result = _this.$refs.result;
                _result.write('任务开始中...');
                ApiFileCatalogue(opts).then(function (result) {
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