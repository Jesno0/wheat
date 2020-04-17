<template>
    <div>
        <el-divider content-position="left">访问原网址</el-divider>
        <el-link class="content" href="http://www.520tingshu.com" target="_blank">http://www.520tingshu.com</el-link>

        <el-divider content-position="left">下载资源</el-divider>
        <el-form class="content" v-if="isShowForm" name="orderform" :model="ruleForm" :rules="rules" ref="ruleForm"
                 label-width="100px">
            <el-form-item label="保存" prop="save">
                <el-input v-model="ruleForm.save" placeholder="请复制文件夹地址在这里。例如：D:\\故事"></el-input>
            </el-form-item>
            <el-form-item label="地址" prop="url">
                <el-input v-model="ruleForm.url"
                          placeholder="请复制上面网址中故事目录地址在这里。例如：http://www.520tingshu.com/book/book5542.html">
                </el-input>
            </el-form-item>
            <el-form-item label="操作" prop="type">
                <el-radio-group v-model="ruleForm.type">
                    <el-radio v-for="type in types" :label="type.id" :key="type.id">{{type.name}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm('ruleForm')">运行</el-button>
                <el-button @click="resetForm('ruleForm')">重置</el-button>
            </el-form-item>
        </el-form>

        <el-divider content-position="left">显示结果</el-divider>
        <result class="content" ref="result"></result>
    </div>
</template>

<script>
    import '../../css/RouterView.css'
    import {ApiStoryInit,ApiStorySync} from '../../js/api'
    import Result from './common/Result.vue'

    export default {
        name: 'Story',
        components: {
            Result
        },
        data () {
            return {
                isShowForm: false,
                output: '',
                save: '',
                url: '',
                ruleForm: {
                    save: 'D:\\故事',
                    url: ''
                },
                rules: {
                    save: [
                        {required: true, message: '保存资源地址，不能空', trigger: 'blur'},
                        {min: 3, message: '文件夹地址不正确', trigger: 'blur'}
                    ],
                    url: [
                        {required: true, message: '故事目录地址，不能空', trigger: 'blur'},
                        {min: 41, message: '故事目录地址不正确', trigger: 'blur'}
                    ],
                    type: [
                        {required: true, message: '请选择操作类型', trigger: 'change'}
                    ]
                }
            }
        },
        mounted () {
            let _this = this;
            let _result = _this.$refs.result;
            ApiStoryInit().then(function (init_data) {
                _this.types = init_data.types;
                _this.ruleForm = {
                    save: 'D:\\故事',
                    url: '',
                    type: init_data.types[0].id
                };
                _this.isShowForm = true;
                _result.write('初始化成功');
            }).catch(function (err) {
                _result.write('初始化失败');
                _result.write(err);
            });
        },
        methods: {
            submitForm(formName) {
                let _this = this;
                let _result = _this.$refs.results;
                let _form = this.$refs[formName];
                _form.validate(function (valid) {
                    if (!valid) return false;
                    _result.write('任务开始中...');
                    ApiStorySync(Object(_this.ruleForm)).then(function (result) {
                        _result.write('任务执行完成：');
                        _result.write(result);
                    }).catch(function (err) {
                        _result.write('任务请求失败');
                        _result.write(err);
                    });
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            }
        }
    }
</script>

<style scoped>
</style>