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
            fqa_list: 'fqa_list',
            fqa_second_list: 'fqa_second_list',
            fqa_detail: 'fqa_detail',
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
                type: this.types.fqa_list,
                url: '/faq',
                children: {
                    type: this.types.fqa_second_list,
                    children: {
                        type: this.types.fqa_detail
                    }
                }
            },"书籍推介": {
                type: this.types.book_list,
                url: '/shu'
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
            infos.push([
                trr[0].split('</a>')[0].split('>').slice(-1)[0].replace('?','？').replace(/(^\s*)|(\s*$)/g, '')
                + `-${trr[1].replace(/ /g, '').split('\n').slice(-1)}`
            ]);
            trr.slice(2).map(res => {
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

cls.prototype.downResource = function (url,save) {
    if(url.indexOf(this.server) != 0) url = this.server+url;

    if(this.is_log) console.log(`【PIPE】: ${save} ${url}`);
    return new Promise((resolve,reject) => {
        Request(url)
            .on('data', thuck => {if(this.is_log) console.log('req data',thuck)})
            .on('close', err => {console.log('req close')})
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

module.exports = new cls();