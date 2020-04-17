<template>
    <div>
        <el-input class="piece" v-model="output" id="output" type="textarea" rows="12"></el-input>
        <el-button class="button" @click="clearResult()">清空</el-button>
    </div>
</template>

<script>
    import '../../../css/RouterView.css'

    export default {
        name: 'Result',
        data() {
            return {
                output: ''
            }
        },
        methods: {
            clearResult() {
                this.output = "";
            },
            write(param) {
                if (!param) return;
                let _this = this;
                let output_str = _this.output;
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
                        _this.write('[');
                        param.map(function (item) {
                            _this.write(item);
                        });
                        _this.write(']');
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
    .button {
        margin-left: 100px;
    }
</style>