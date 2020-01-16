'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Frame = require('koa2frame'),
    Err = Frame.error,
    Request = require('request'),
    Path = require('path'),
    Fs = require('fs'),
    Ut = Frame.utils,
    Base = Frame.external;

class cls extends Base {
    constructor () {
        super('fydt');

        this.types = {
            catalogue: 'catalogue',
            resource_list: 'resource_list',
            music_catalogue: 'music_catalogue',
            resource_detail: 'resource_detail',
            faq_catalogue: 'faq_catalogue',
            faq_list: 'faq_list',
            faq_detail: 'faq_detail',
            book_catalogue: 'book_catalogue',
            book_list: 'book_list'
        };

        this.catalogues = {
            "专题系列": {
                type: this.types.catalogue,
                url: '/cat/zhuantixilie',
                children: {
                    type: this.types.resource_list
                }
            },"讲道信息": {
                type: this.types.catalogue,
                url: '/cat/jiangdaoxinxi',
                children: {
                    type: this.types.resource_list
                }
            },"书卷考查": {
                type: this.types.catalogue,
                url: '/cat/shujuanchakao',
                children: {
                    type: this.types.resource_list
                }
            },"圣经一神论": {
                type: this.types.resource_list,
                url: '/cat/shengjingyishenlun'
            },"奇妙恩典": {
                type: this.types.resource_list,
                url: '/cat/qimiaoendian0'
            },"生命再思": {
                type: this.types.resource_list,
                url: '/cat/shengmingzaisi'
            },"专题解答": {
                type: this.types.faq_catalogue,
                url: '/faq',
                children: {
                    type: this.types.faq_list,
                    children: {
                        type: this.types.faq_detail
                    }
                }
            },"书籍推介": {
                type: this.types.book_catalogue,
                url: '/shu',
                children: {
                    type: this.types.book_list
                }
            },"诗歌": {
                type: this.types.music_catalogue,
                url: [],
                children: {
                    type: this.types.resource_detail
                }
            }
        };

        for(let i=65;i<91;i++) {//65,91
            this.catalogues.诗歌.url.push(`/songs/pinyin/${String.fromCharCode(i)}`)
        }
    }

    async getHtml (url) {
        let file_path = Path.resolve(__dirname, `../view/fydt/origin/${url.replace(/\//g, '_')}.html`);
        if (Fs.existsSync(file_path)) return Fs.readFileSync(file_path,'utf-8');
        let html = await super.get(url, null, 'html');
        Fs.writeFileSync(file_path, html);
        return html;
    }
}

cls.prototype.catalogue = async function (url) {
    let html = await this.getHtml(url),back = [];

    if(html.indexOf('<div') > -1) html = html.split('<div class="item-list">')[1].split('</div>')[0];
    html.replace('<ul>','').replace('</ul>','')
        .replace(/\<li.*href/g,'').replace(/\<\/a>\<\/li>\n/g,'')
        .split('="')
        .map(tr => {
            if(!tr) return;
            back.push(tr.split('">'));
        });

    return back;

    //[
    //  [ '/cat/chuangshiji', '创世记' ],
    //  [ '/cat/liewangjishang', '列王纪上' ]
    //]
};

cls.prototype.resource_list = async function (url) {
    let html = await this.getHtml(url),infos = [];

    if(html.indexOf('<tbody>') > -1) html = html.slice(html.indexOf('<tbody>'),html.indexOf('</tbody>'));
    html.slice(html.indexOf('<tr'),html.lastIndexOf('</tr>'))
        .replace(/\<tr.*\>/g,'').split('</tr>')
        .map(tr => {
            if(!tr) return;
            let trr = tr.split('</td>');
            trr.shift();
            trr.pop();
            let name = trr[0].split('</a>')[0].split('>').slice(-1)[0].replace('?','？').replace(/(^\s*)|(\s*$)/g, ''),
                is_auth = trr[1].indexOf('author') > -1,
                auth = is_auth ? `-${trr[1].replace(/ /g, '').split('\n').slice(-1)}` : '';
            infos.push([name+auth]);
            trr.slice(is_auth?2:1).map(res => {
                let href_arr = res.split('href="');
                if(href_arr.length < 2) return;
                href_arr.map((item,i) => {
                    if(i == 0) return;
                    let url = item.split('"')[0],
                        res_name = url.split('/').slice(-1)[0].split('?')[0];
                    infos[infos.length-1].push([res_name, url]);
                });
            });
        });
    return infos;

    //[
    //    [ '敌基督：新约惟一一个自称为神的人-张熙和牧师',
    //        [ 'mono_01.pdf', 'https://fuyindiantai.org/system/files_force/sermon-doc/mono_01.pdf?download=1' ]
    //    ],
    //    [ '耶稣如何从“主”变成了“神”-张熙和牧师',
    //        [ 'mono_02.pdf', 'https://fuyindiantai.org/system/files_force/sermon-doc/mono_02.pdf?download=1' ]
    //    ]
    //]
};

cls.prototype.music_catalogue = async function (url) {
    let html = await this.getHtml(url);
    if(html.indexOf('<tbody>') > -1) html = html.slice(html.indexOf('<tbody>'),html.indexOf('</tbody>'));
    return Ut.noRepeat(html.slice(html.indexOf('<tr'),html.lastIndexOf('</tr>'))
        .replace(/\<tr.*\>/g,'').split('</tr>')
        .map(tr => {
            if (tr) return tr.split('</td>')[0]
                .split('href="')[1]
                .replace('</a>','')
                .trim()
                .split('">');
        }));

    //[
    //    [ '/content/xizaiquannengzhedeyinxia', '安息在全能者的荫下' ]
    //    [ '/content/aidetuanju', '爱的团聚' ]
    //]
};

cls.prototype.resource_detail = async function (url) {
    let html = await this.getHtml(url).catch(() => {});
    return html ? html.split('class="file"').slice(1).map(tr => {
        let url = tr.split('href="')[1].split('"')[0];
        return [Path.basename(url).split('?')[0],url]
    }) : [];

    //[
    //    [ 'S03_010.mp3',
    //        'https://fuyindiantai.org/system/files_force/ge-mp3/S03_010.mp3?download=1' ],
    //    [ 'S03_010_0.pdf',
    //        'https://fuyindiantai.org/system/files_force/ge-score/S03_010_0.pdf?download=1' ],
    //    [ 'S03_010.doc',
    //        'https://fuyindiantai.org/system/files_force/ge-lyrics/S03_010.doc?download=1' ]
    //]
};

cls.prototype.book_catalogue = async function (url) {
    let html = await this.getHtml(url).catch(() => {});
    if(!html) return [];

    let arr = html.split('views-fluid-grid-list')[1].split('tbody')[0].split('</li>');
    arr.pop();
    let blank_list = arr.map(item => {
        return [null,item.split('<h6')[1].split('</a>')[0].split('<a')[1].split('>')[1]];
    });

    arr = html.split('<tbody>')[1].split('</tbody>')[0].split('</tr>');
    arr.pop();
    let catalogue_list = arr.map(item => {
        return item.split('</a>')[0].split('href="')[1].split('">');
    });

    return catalogue_list.concat(blank_list);

    //[
    //    [ '/content/duyidewanquanren', '独一的完全人' ],
    //    [ null, '回转变成小孩子' ]
    //]
};

cls.prototype.book_list = async function (url) {
    let html = await this.getHtml(url).catch(() => {});
    if(!html || html.indexOf('tbody') < 0) return [];

    let auth = html.split('field-item even">')[1].split('<')[0];
    let arr = html.split('tbody')[1].split('</tr>');
    arr.pop();
    return arr.map(item => {
        let str = item.split('href="')[1],
            path = str.split('"')[0],
            name = str.split('>')[1].split('<')[0],
            title = str.split('<td')[1].split('>')[1].split('</td')[0];

        return [
            `${title}-${auth}`,[name,path]
        ]
    });

    //[
    //    [ '独一的完全人(英文第二版更新版) - 适用于一般较大电脑荧幕',
    //        [ 'TOPM_2.2_LgPt.pdf',
    //            'https://www.fydt.org/sites/default/files/book/ebooks/TOPM_2.2_LgPt_1.pdf' ]
    //    ],
    //    ['独一的完全人(简体版)',
    //        [ 'TOPM_sc_v2.pdf',
    //            'https://www.fydt.org/sites/default/files/book/ebooks/TOPM_sc_v2_1.pdf' ]
    //    ],
    //    ['独一的完全人(繁体版)',
    //        [ 'TOPM_tc_v2.pdf',
    //            'https://www.fydt.org/sites/default/files/book/ebooks/TOPM_tc_v2_0.pdf' ]
    //    ]
    //]
};

cls.prototype.downResource = async function (url,save) {
    if(url.indexOf(this.server) != 0) url = this.server+url;

    if(this.is_log) console.log(`【PIPE】: ${save} ${url}`);
    return new Promise((resolve,reject) => {
        Request(url)
            //.on('data', thuck => {if(this.is_log) console.log('req data',thuck)})
            //.on('close', err => {console.log('req close')})
            .on('error', err => {return reject(err);})
            .pipe(Fs.createWriteStream(save)
                .on('error', err => {return reject(err);})
                .on('close', err => {
                    if (err) return reject(err);
                    if(this.is_log && Fs.existsSync(save)) console.log(`【EXTERNAL BACK】: ${save} ${Fs.statSync(save).size}`);
                    return resolve();
                }));
    }).catch(err => {
        Err.log(Err.error_log_type.http,url,save,err);
        if(Fs.existsSync(save)) Fs.unlinkSync(save);
        return Promise.reject(err);
    });
};

cls.prototype.faq_catalogue = async function (url) {
    let html = await this.getHtml(url).catch(() => {});
    if(!html) return [];

    let arr = html.split('item-list')[1].split('</ul>')[0].split('<li class="">');
    arr.shift();
    return arr.map(item => {
        return item.split('href="')[1].split('</a>')[0].split('">');
    });

    //[
    //    [ '/faq/yibanshenghuo', '一般生活' ],
    //    [ '/faq/gongzuo', '工作' ]
    //]
};

cls.prototype.faq_list = async function (url) {
    let html = await this.getHtml(url).catch(() => {});
    if(!html) return [];

    let arr = html.split('class="node-title"');
    arr.shift();
    return arr.map(item => {
        return item.split('href="')[1].split('</a>')[0].split('">');
    });

    //[
    //    [ '/laixin/xinlixiangxinkoulichengrenshengmingquemeiyougaibia',
    //        '心里相信口里承认生命却没有改变能得救吗？/吃好点穿好点还是苦点好？' ],
    //    [ '/laixin/danxinshouxihousadangongjizijisuoaidejiarenjidutus',
    //    '担心受洗后撒但攻击自己所爱的家人/基督徒是否可以买保险？' ]
    //]
};

cls.prototype.faq_detail = async function (url) {
    let html = await this.getHtml(url).catch(() => {});
    if(!html) return [];

    let title = html.split('page-title">')[1].split('<')[0];
    return [
        `${title}.txt`,
        `${title}\n\n问:\n`
            + html.split('class="pane-content"').slice(1,3).map(item => {
                let str = item.split('</span>')[0];
                return str.slice(str.lastIndexOf('>')+1);
            }).join('\n\n答:\n')
    ];

    //[
    //    '（太15：11），“入口的不能污秽人”，是否表示可以随便乱吃东西？ .txt',
    //    '（太15：11），“入口的不能污秽人”，是否表示可以随便乱吃东西？ \n\n问:\n主耶稣说：“入口的不能污秽人，出口的才能污秽人”，于是有个弟兄把大小便倒在身上，说这个不能污秽他，他又乱吃东西，把地上的痰检来吃了，最后痛苦的死了，有个弟兄说他是邪灵附体，有什么证据呢？就因为他做事与常人不和就是邪灵附体吗？\n\n答:\n那弟兄乱吃东西，还用圣经来支持自己的做法，他这样做只是滥用圣经，歪曲圣经的意思，最后只好自己受害。至于是什么原因导致他这样做，我们就不得而知了。有可能他精神出了问题，导致他行为失常……'
    //]
};

module.exports = new cls();