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
                <el-input v-model="ruleForm.url" placeholder="请复制上面网址中故事目录地址在这里。例如：http://www.520tingshu.com/book/book5542.html"></el-input>
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
        <div class="content">
            <el-input class="piece" v-model="output" id="output" type="textarea" rows="12"></el-input>
            <el-button class="button" @click="clearResult()">清空</el-button>
        </div>

    </div>
</template>

<script>
    export default {
        name: 'Story',
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
        created () {
            let _this = this;
            this.$ajax.get('/story/init').then(function (init_data) {
                if(init_data.status != 200) return Promise.reject(init_data);
                init_data = init_data.data.data;
                _this.types = init_data.types;
                _this.ruleForm = {
                    save: 'D:\\故事',
                    url: '',
                    type: init_data.types[0].id
                };
                _this.isShowForm = true;
                _this.write('初始化成功');
            }).catch(function (err) {
                _this.write(err);
                _this.write('初始化失败');
            });
        },
        methods: {
            submitForm(formName) {
                let _this = this;
                let form = this.$refs[formName];
                form.validate(function (valid) {
                    if (!valid) return false;
                    _this.write('任务开始...');
                    _this.$ajax.post('/story/sync', Object(_this.ruleForm)).then(function (result) {
                        result = result.data;
                        if(result.ok === 0) {
                            _this.write(result.msg);
                            _this.write(result.data);
                        }else {
                            _this.write(result);
                        }
                    }).catch(function (err) {
                        _this.write(err);
                        _this.write('任务请求失败');
                    });
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            clearResult() {
                this.output = "";
            },
            write(param) {
                let _this = this;
                let output_str = _this.output;
                if (!param) return;
                switch (param.constructor) {
                    case String:
                        if (output_str) output_str += `\r\n`;
                        output_str += param;
                        _this.output = output_str;
                        _this.$nextTick(function () {
                            let msg = document.getElementById('output');
                            msg.scrollTop = msg.scrollHeight;
                        });
                        break;
                    case Array:
                        param.map(function (item) {
                            _this.write(item);
                        });
                        break;
                    case Object:
                        _this.write(JSON.stringify(param));
                        break;
                }
            }
        }
    }
</script>

<style scoped>
    .content {
        margin-left: 50px;
        margin-bottom: 40px;
    }
    .piece {
        margin-bottom: 20px;
    }
    .button {
        color:#fff;
        background-color: #409eff;
        border-color: #409eff;
    }
</style>