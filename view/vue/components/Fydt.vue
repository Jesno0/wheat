<template>
    <div>
        <el-divider content-position="left">访问原网址</el-divider>
        <el-link class="content" href="https://www.fydt.org" target="_blank">https://www.fydt.org</el-link>

        <el-divider content-position="left">下载资源</el-divider>
        <el-form class="content"  v-if="isShowForm" name="orderform" :model="form" :rules="rules" ref="form"
                 label-width="100px">
            <el-form-item label="保存" prop="save">
                <el-input v-model="form.save" placeholder="请复制文件夹地址在这里。例如：D:\\fydt资料"></el-input>
            </el-form-item>
            <el-form-item label="目录" prop="catalogues">
                <el-checkbox :indeterminate="cataloguesIsIndeterminate" v-model="cataloguesCheckAll" @change="handleCheckAllChange">全选</el-checkbox>
                <el-checkbox-group v-model="form.catalogues" @change="handleCheckedCitiesChange">
                    <el-checkbox v-for="catalogue in catalogues" :label="catalogue" :key="catalogue">{{catalogue}}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="操作" prop="type">
                <el-radio-group v-model="form.type">
                    <el-radio v-for="type in types" :label="type.id" :key="type.id">{{type.name}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="格式" prop="formats">
                <el-checkbox-group v-model="form.formats">
                    <el-checkbox v-for="format in formats" :label="format.id" :key="format.id">{{format.name}}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="submitForm()">运行</el-button>
                <el-button @click="resetForm()">重置</el-button>
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
        name: 'Fydt',
        data () {
            return {
                isShowForm: false,
                cataloguesCheckAll: true,
                cataloguesIsIndeterminate: false,
                output: '',
                save: '',
                form: {
                    save: ''
                },
                rules: {
                    save: [
                        {required: true, message: '保存资源地址，不能空', trigger: 'blur'},
                        {min: 3, message: '文件夹地址不正确', trigger: 'blur'}
                    ],
                    catalogues: [
                        {type: 'array', required: true, message: '请至少选择一个目录', trigger: 'change'}
                    ],
                    type: [
                        {required: true, message: '请选择操作类型', trigger: 'change'}
                    ],
                    formats: [
                        {type: 'array', required: true, message: '请至少选择一种文件类型', trigger: 'change'}
                    ]
                }
            }
        },
        created () {
            let _this = this;
            this.$ajax.get('/fydt/init').then(function (init_data) {
                if(init_data.status != 200) return Promise.reject(init_data);
                init_data = init_data.data.data;
                _this.init_data = init_data;
                _this.catalogues = init_data.catalogues;
                _this.formats = init_data.formats;
                _this.types = init_data.types;
                _this.form = {
                    save: 'D:\\fydt资料',
                    catalogues: init_data.catalogues,
                    type: init_data.types[0].id,
                    formats: init_data.formats.map(function(item) {return item.id})
                };
                _this.isShowForm = true;
                _this.write('初始化成功');
            }).catch(function (err) {
                _this.write(err);
                _this.write('初始化失败');
            });
        },
        methods: {
            submitForm() {
                let _this = this;
                let form = this.$refs.form;
                form.validate(function (valid) {
                    if (!valid) return false;
                    _this.write('任务开始...');
                    _this.$ajax.post('/fydt/sync', Object(_this.form)).then(function (result) {
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
            resetForm() {
                this.$refs.form.resetFields();
            },
            handleCheckAllChange(val) {
                this.form.catalogues = val ? this.init_data.catalogues : [];
                this.cataloguesIsIndeterminate = false;
            },
            handleCheckedCitiesChange(value) {
                let checkedCount = value.length;
                this.cataloguesCheckAll = checkedCount === this.catalogues.length;
                this.cataloguesIsIndeterminate = checkedCount > 0 && checkedCount < this.catalogues.length;
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