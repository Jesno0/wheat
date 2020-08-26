<template>
    <div>
        <el-form class="content" v-if="isShowForm" :name="name" :model="form" :rules="rules" ref="form" label-width="auto">
            <el-form-item label="保存" prop="save">
                <el-input v-model="form.save" placeholder="请复制文件夹地址在这里。例如：D:\\wheat资料"></el-input>
            </el-form-item>
            <el-form-item label="目录" v-if="isCatalogues" prop="catalogues">
                <el-checkbox :indeterminate="cataloguesIsIndeterminate" v-model="cataloguesCheckAll" @change="cataloguesCheckAllChange">全选</el-checkbox>
                <el-checkbox-group v-model="form.catalogues" @change="cataloguesCheckChange">
                    <el-checkbox v-for="catalogue in init_data.catalogues" :label="catalogue" :key="catalogue">{{catalogue}}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="地址" prop="url" v-if="isUrl">
                <el-input v-model="form.url"
                          :placeholder="urlPlaceholder">
                </el-input>
            </el-form-item>
            <el-form-item label="格式" v-if="isFormats" prop="formats">
                <el-checkbox :indeterminate="formatsIsIndeterminate" v-model="formatsCheckAll" @change="formatsCheckAllChange">全选</el-checkbox>
                <el-checkbox-group v-model="form.formats" @change="formatsCheckChange">
                    <el-checkbox v-for="fm in init_data.formats" :label="fm.id" :key="fm.id">{{fm.name}}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>
            <el-form-item label="保留子文件夹"  v-if="isIsDir" prop="is_dir">
                <el-radio-group v-model="form.is_dir">
                    <el-radio label="1" key="1">是</el-radio>
                    <el-radio label="0" key="0">否</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="操作" prop="type">
                <el-radio-group v-model="form.type">
                    <el-radio v-for="type in init_data.types" :label="type.id" :key="type.id">{{type.name}}</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" v-on:click="submit">运行</el-button>
                <el-button @click="reset">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import '../../../css/Element.css'
    import '../../../css/RouterView.css'

    export default {
        name: 'DownForm',
        props: {
            name: {
                type: String,
                default: 'form'
            },
            urlPlaceholder: {
                type: String,
                default: '请复制网址在这里。'
            }
        },
        data() {
            return {
                isShowForm: false,
                isFormats: false,
                isCatalogues: false,
                isIsDir: false,
                isUrl: false,
                cataloguesCheckAll: true,
                cataloguesIsIndeterminate: false,
                formatsCheckAll: true,
                formatsIsIndeterminate: false,
                form: {
                    save: '',
                    type: '',
                    catalogues: [],
                    formats: [],
                    url: '',
                    is_dir: "1"
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
                    is_dir: [
                        {required: true, message: '请选择是否保留子文件夹', trigger: 'change'}
                    ],
                    formats: [
                        {type: 'array', required: true, message: '请至少选择一种文件类型', trigger: 'change'}
                    ],
                    url: [
                        {required: true, message: '网页地址，不能空', trigger: 'blur'},
                        {min: 11, message: '网页地址不正确', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            init(init_data) {
                console.log(init_data)
                let _this = this;
                _this.init_data = init_data;
                if(init_data.types) {
                    _this.form.type = init_data.types[0].id;
                }
                if(init_data.save) {
                    _this.form.save = init_data.save;
                }
                if(init_data.catalogues) {
                    _this.form.catalogues = init_data.catalogues;
                    _this.isCatalogues = true;
                }
                if(init_data.url || init_data.url === '') {
                    _this.url = init_data.url;
                    _this.form.url = init_data.url;
                    _this.isUrl = true;
                }
                if(init_data.formats) {
                    _this.form.formats = init_data.formats.map(item => {return item.id});
                    console.log(_this.form.formats);
                    _this.isFormats = true;
                }
                if(init_data.is_dir || init_data.is_dir === 0) {
                    _this.form.is_dir = init_data.is_dir;
                    _this.isIsDir = true;
                }
                _this.isShowForm = true;
            },
            submit: function () {
                let _this = this;
                let _form = this.$refs.form;
                _form.validate(function (valid) {
                    if (!valid) return false;
                    _this.$emit('submit',Object(_this.form));
                });
            },
            reset() {
                this.$refs.form.resetFields();
            },
            cataloguesCheckAllChange(val) {
                this.form.catalogues = val ? this.init_data.catalogues : [];
                this.cataloguesIsIndeterminate = false;
            },
            cataloguesCheckChange(val) {
                const checkedCount = val.length;
                this.cataloguesCheckAll = checkedCount === this.init_data.catalogues.length;
                this.cataloguesIsIndeterminate = checkedCount > 0 && checkedCount < this.init_data.catalogues.length;
            },
            formatsCheckAllChange(val) {
                this.form.formats = val ? this.init_data.formats.map(item => {return item.id}) : [];
                this.formatsIsIndeterminate = false;
            },
            formatsCheckChange(val) {
                const checkedCount = val.length;
                this.formatsCheckAll = checkedCount === this.init_data.formats.length;
                this.formatsIsIndeterminate = checkedCount > 0 && checkedCount < this.init_data.formats.length;
            }
        }
    }
</script>

<style scoped>
</style>