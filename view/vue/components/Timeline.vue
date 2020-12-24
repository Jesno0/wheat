<template>
    <div>
        <div class="content">可在网页中查看大图：<el-link href="/#/timeline" target="_blank">timeline</el-link></div>
        <el-container class="content">
            <el-button size="small" type="success" native-type="button" @click="initData()">模板数据</el-button>
            <el-upload action="#" :auto-upload="false" :on-change="fileUpload" ref="file" accept=".xlsx">
                <el-button slot="trigger" size="small" type="primary">自定义数据</el-button>
            </el-upload>
            <el-link :href="default_excel_path" type="info" >下载模板</el-link>
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
            }
        },
        mounted() {
            container = document.getElementById('container');
            width = container.scrollWidth;
            height = container.scrollHeight || 500;
            
            this.initG6();
            this.initData();
        },
        methods: {
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
            async initData (file) {
                const {edges,nodes} = this.graph_data = await this.parseExcel(file);
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

                graph.data(this.graph_data);
                graph.render();

                return {nodes,edges};
            },
            async parseExcel(file) {
                file = file || await FileBuffer(this.default_excel_path);

                const workbook = new Excel.Workbook();
                await workbook.xlsx.load(file);

                const nodes = [];
                const edges = [];
                workbook.eachSheet((sheet,i) => {
                    sheet.eachRow((row,j) => {
                        if(j==1) return;

                        const color = this.getColor();
                        let source;
                        row.values.slice(2,4).map((node_name,k) => {
                            if(!node_name) return;
                            
                            let node = nodes.find(_n => {return _n.label.split('\n')[0] == node_name;});

                            if (node) {
                                node.label += `\n${row.values[1]} ${k?'结束':'开始'}`;
                            } else {
                                node = {
                                    id: `${j}${k}`,
                                    label: `${node_name}\n${row.values[1]} ${k?'结束':'开始'}`,
                                    color,
                                };
                                nodes.push(node);
                            }

                            if(k == 0) source = node.id;
                            if(k == 1) edges.push({
                                source,
                                target: node.id,
                                label: row.values[1]
                            });
                        });
                    });
                });

                nodes.sort((a,b) => {
                    const a_name = a.label.split('\n')[0];
                    const b_name = b.label.split('\n')[0];
                    const a_header = a_name.slice(0,1);
                    const b_header = b_name.slice(0,1);
                    if(a_header != b_header) return a_name > b_name ? -1: 1;
                    if(a_header != 'B') return a_name > b_name ? 1: -1;
                    if(a_name.indexOf(b_name) == 0) return 1;
                    if(b_name.indexOf(a_name) == 0) return -1;
                    return a_name > b_name ? -1: 1;
                });

                return {nodes,edges};
            },
            fileUpload(opts) {
                this.$refs.file.clearFiles();
                this.initData(opts.raw);
            },
            getColor () {
                let color = '#';
                while(color.length < 7) {
                    color += Math.floor(Math.random()*16).toString(16);
                }
                return color;
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