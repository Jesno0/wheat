<template>
    <div>
        <div class="content">可在网页中查看大图：<el-link href="/#/timeline" target="_blank">timeline</el-link></div>
        <el-container class="content">
            <el-button size="small" type="success" native-type="button" @click="defaultData()">模板数据</el-button>
            <el-upload action="#" :auto-upload="false" :on-change="fileUpload" ref="file" accept=".xlsx">
                <el-button slot="trigger" size="small" type="primary">自定义数据</el-button>
            </el-upload>
            <el-link :href="default_excel_path" type="info" >下载模板</el-link>
        </el-container>
        <el-container class="content">
            <el-radio-group v-model="is_node_name" @change="initG6Data()">
                <el-radio :label="1">显示节点名字</el-radio>
                <el-radio :label="0">隐藏节点名字</el-radio>
            </el-radio-group>
        </el-container>
        <div class="content" id="container"></div>
    </div>
</template>

<script>
    import '../../css/Element.css';
    import '../../css/RouterView.css';
    import G6 from '@antv/g6';
    import Excel from 'exceljs';
    import {FileBuffer} from '../../js/api';

    let container,height,width,graph;

    export default {
        name: 'Timeline',
        data() {
            return {
                default_excel_path: `/view/public/历史时间表.xlsx`,
                graph_data : {},
                excel_data : [],
                is_node_name : 0
            }
        },
        mounted() {
            container = document.getElementById('container');
            width = container.scrollWidth;
            height = container.scrollHeight || 500;
            
            this.initG6();
            this.defaultData();
        },
        methods: {
            /** 初始化G6容器 */
            initG6() {
                const _this = this;
                graph = new G6.Graph({
                    container: 'container',
                    width,
                    height,
                    'drag-canvas': true,
                    'zoom-canvas': true,
                    linkCenter: true,
                    defaultNode: {
                        size: 10,
                        style: {
                            lineWidth: 1,
                        },
                        labelCfg: {
                            position: 'bottom',
                            offset: 2,
                            style: {
                                rotate: Math.PI / 2,
                                textAlign: 'start',
                            }
                        },
                        stateStyles: {
                            hover: {
                                fill: '#aaaaaa',
                                stroke: '#aaaaaa',
                                opacity: 0.8
                            }
                        }
                    },
                    defaultEdge: {
                        style: {
                            lineWidth: 1,
                            radius: 8
                        },
                        stateStyles: {
                            hover: {
                                lineWidth: 2,
                                stroke: '#aaaaaa',
                                opacity: 0.8
                            }
                        }
                    }
                });
                graph.on('edge:mouseenter', function (e) {
                    const edge = e.item;
                    graph.setItemState(edge, 'hover', true);
                    graph.setItemState(edge._cfg.source, 'hover', true);
                    graph.setItemState(edge._cfg.target, 'hover', true);
                });
                graph.on('edge:mouseleave', function (e) {
                    const edge = e.item;
                    graph.setItemState(edge, 'hover', false);
                    graph.setItemState(edge._cfg.source, 'hover', false);
                    graph.setItemState(edge._cfg.target, 'hover', false);
                });
                graph.on('node:mouseenter', function (e) {
                    const node = e.item;
                    graph.setItemState(node, 'hover', true);
                    node._cfg.edges.map(edge => {
                        graph.setItemState(edge, 'hover', true);
                        graph.setItemState(edge._cfg.source, 'hover', true);
                        graph.setItemState(edge._cfg.target, 'hover', true);
                    });
                });
                graph.on('node:mouseleave', function (e) {
                    const node = e.item;
                    graph.setItemState(node, 'hover', false);
                    node._cfg.edges.map(edge => {
                        graph.setItemState(edge, 'hover', false);
                        graph.setItemState(edge._cfg.source, 'hover', false);
                        graph.setItemState(edge._cfg.target, 'hover', false);
                    });
                });
                if(window) window.onresize = () => {
                    if (!graph || graph.get('destroyed')) return;
                    if (!container || !container.scrollWidth || !container.scrollHeight) return;
                    graph.changeSize(container.scrollWidth, container.scrollHeight);
                };
            },
            /** 初始化G6填充内容｛nodes,edges｝ */
            async initG6Data () {
                const _this = this;
                const nodes = [];
                const edges = [];
                this.excel_data.map((row,i) => {
                    const color = this.getColor();
                    const values = row.slice(1,3);
                    let source;
                    values.map((node_name,j) => {
                        if(!node_name) return;
                        
                        let node = nodes.find(_n => {return _n.label.split('\n')[0] == node_name;});
                        if(!node) {
                            node = {
                                id: `${i}${j}`,
                                color,
                            };
                            nodes.push(node);
                        }

                        node.label = node_name;
                        if(parseInt(_this.is_node_name) || (values.length==1)) {
                            node.label += `\n${row[0]}`;
                            if(values.length>1) node.label += ` ${j?'结束':'开始'}`;
                        }

                        if(j == 0) source = node.id;
                        if(source && j == 1) edges.push({
                            source,
                            target: node.id,
                            label: row[0]
                        });
                    });
                });
                nodes.sort((a,b) => {
                    const a_name = a.label.split('\n')[0];
                    const b_name = b.label.split('\n')[0];
                    if(a_name.indexOf(b_name) == 0) return 1;
                    if(b_name.indexOf(a_name) == 0) return -1;

                    const a_header = a_name.slice(0,1);
                    const b_header = b_name.slice(0,1);
                    if(a_header != b_header) return a_header > b_header ? -1: 1;
                    if(a_header != 'B') return _this.sortTime(a_name,b_name);
                    return _this.sortTime(b_name,a_name);
                });

                const nodeMap = new Map();
                const horiPadding = 10;
                const begin = [horiPadding, height * 0.7];
                const end = [width - horiPadding, height * 0.7];
                const xLength = end[0] - begin[0];
                const yLength = end[1] - begin[1];
                const xSep = xLength / nodes.length;
                const ySep = yLength / nodes.length;
                let maxX = 0;
                let maxY = 0; 

                nodes.map((node, i) => {
                    nodeMap.set(node.id, node);
                    node.x = begin[0] + i * xSep;
                    node.y = begin[1] + i * ySep;
                    node.style = {
                        fill: node.color,
                        stroke: node.color
                    };
                });
                edges.map((edge,i) => {
                    const source = nodeMap.get(edge.source);
                    const target = nodeMap.get(edge.target);
                    const x1 = source.x+5;
                    const x2 = target.x-5;
                    if((x1 > maxX)) maxY = source.y;
                    const y = maxY = maxY-20;
                    maxX = Math.max(x2,maxX);

                    edge.type = 'polyline';
                    edge.color = target.color;
                    edge.controlPoints = [{x:x1,y},{x:x2,y}];
                    edge.labelCfg = {
                        refY: 5,
                        style: {
                            fill: edge.color
                        }
                    }
                });

                graph.data({edges,nodes});
                graph.render();

                return {nodes,edges};
            },
            /** 解析excel表格，获取二维数组 */
            async parseExcel(file) {
                const _this = this;
                const workbook = new Excel.Workbook();
                await workbook.xlsx.load(file);

                const back = [];
                workbook.eachSheet((sheet,i) => {
                    return sheet.eachRow((row,j) => {
                        if(j==1) return;
                        back.push(row.values.slice(1,4));
                    });
                });
                return back;
            },
            async defaultData () {
                const file = await FileBuffer(this.default_excel_path);
                this.excel_data = await this.parseExcel(file);
                this.initG6Data();
            },
            async fileUpload(opts) {
                this.$refs.file.clearFiles();
                this.excel_data = await this.parseExcel(opts.raw);
                this.initG6Data();
            },
            getColor () {
                let color = '#';
                while(color.length < 7) {
                    color += Math.floor(Math.random()*16).toString(16);
                }
                return color;
            },
            sortTime(a,b) {
                const a_arr = a.replace('A.D.','').replace('B.C.','').split('.');
                const b_arr = b.replace('A.D.','').replace('B.C.','').split('.');
                if(a_arr[0] != b_arr[0]) return parseInt(a_arr[0]) > parseInt(b_arr[0]) ? 1 : -1;
                
                a = a.slice(a_arr[0].length+1);
                b = b.slice(b_arr[0].length+1);
                return this.sortTime(a,b);
            }
        }
    };
</script>

<style>::-webkit-scrollbar{display:none;}html,body{overflow:hidden;margin:0;}</style>
<style scoped="scoped">
    .el-button {
        margin-right: 8px;
    }
</style>