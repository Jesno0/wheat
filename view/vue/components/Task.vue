<template>
    <div>
        <el-divider content-position="left">查找任务</el-divider>
        <el-form class="content" label-width="100px">
            <el-form-item label="关键字">
                <el-input v-model="id" placeholder="请输入你想查找或删除的相关内容，不填写表示全部任务。"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="find()">查找</el-button>
                <el-button @click="remove()">删除</el-button>
            </el-form-item>
        </el-form>

        <el-divider content-position="left">执行任务</el-divider>
        <el-form class="content" label-width="100px">
            <el-button type="primary" @click="run()">开始</el-button>
            <el-button @click="cancel()">停止</el-button>
        </el-form>

        <el-divider content-position="left">显示结果</el-divider>
        <el-form class="content" label-width="100px">
            <el-form-item label="状态">
                <el-radio-group v-model="status" disabled>
                    <el-radio :label="1">运行</el-radio>
                    <el-radio :label="0">停止</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="总数" v-model="total_count">{{total_count}}</el-form-item>
            <result class="content" ref="result"></result>
        </el-form>
    </div>
</template>


<script>
    import '../../css/RouterView.css'
    import {ApiTaskList,ApiTaskRemove,ApiTaskStart,ApiTaskStop} from '../../js/api'
    import Result from './common/Result.vue'

    export default {
        name: 'Task',
        components: {
            Result
        },
        data () {
            return {
                output: '',
                id: '',
                status: '',
                total_count: '-'
            }
        },
        mounted() {
            this.find();
        },
        methods: {
            find() {
                let _this = this;
                let _result = _this.$refs.result;
                _result.write('查找中...');
                ApiTaskList(_this.id).then(function (result) {
                    _this.status = result.status ? 1 : 0;
                    _this.total_count = result.total_count;
                    _result.write('查找完成：');
                    _result.write(result.rows);
                }).catch(function (err) {
                    _result.write('查找请求失败');
                    _result.write(err);
                })
            },
            remove() {
                let _this = this;
                let _result = _this.$refs.result;
                _result.write('删除中...');
                ApiTaskRemove(_this.id).then(function (result) {
                    _this.write(`删除数量：${result}`);
                }).catch(function (err) {
                    _result.write('删除请求失败');
                    _result.write(err);
                });
            },
            run() {
                let _this = this;
                let _result = _this.$refs.result;
                _result.write('任务启动中...');
                ApiTaskStart().then(function (result) {
                    _result.write('任务请求完成');
                    _result.write(result);
                }).catch(function (err) {
                    _result.write('任务请求失败');
                    _result.write(err);
                });
            },
            cancel() {
                let _this = this;
                let _result = _this.$refs.result;
                _result.write('任务取消中...');
                ApiTaskStop.then(function (result) {
                    _result.write('任务请求完成');
                    _result.write(result);
                }).catch(function (err) {
                    _result.write('任务请求失败');
                    _result.write(err);
                });
            }
        }
    }
</script>

<style scoped>
</style>