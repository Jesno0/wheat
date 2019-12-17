'use strict';

const Request = require('request');
const Fs = require('fs');

const host = 'https://fuyindiantai.org/';
const catalogues = [['cat/shujuanchakao','书卷考查'],['cat/zhuantixilie','专题系列'],['cat/jiangdaoxinxi','讲道信息']];//奇妙恩典、专题解答、书籍推介
const no_second_catalogues = [['cat/shengjingyishenlun','圣经一神论'],['cat/shengmingzaisi','生命再思'],['cat/qimiaoendian0','奇妙恩典']];
for(let i=97;i<123;i++)(
    no_second_catalogues.push([`songs/pinyin/${String.fromCharCode(i).toUpperCase()}`,'诗歌'])
)
//const save_host = 'F:/1_back/mine/OneDrive/bible/preach/self/';
const save_host = 'F:/1_back/mine/bible/preach/';

let type = check;//down,rename,check
const is_mp3 = 2;//0:不检测；1：检测；2：当没有其他资源时才检测
const catalogues_index = 0;//其中一个目录。0为全部。
const second_catalogue = '';//二级目录id（名字）
const is_circle = false;
const is_size = false;
const is_restart = false;

exports.start = async function () {
    let cats = catalogues;
    if(catalogues_index) cats = catalogues.slice(catalogues_index -1,catalogues_index);
    else await go(no_second_catalogues,save_host);

    for(let i=0; i<cats.length; i++) {
        let sec_cat = getSecondCatalogue(await request(host + cats[i][0]));
        await go(sec_cat,`${save_host}${cats[i][1]}/`);
    }
};
exports.start();

async function go(sec_cat,save_root) {
    if(second_catalogue) {
        let target = sec_cat.find(item => {return item[1] == second_catalogue});
        if(!target) return;
        sec_cat = [target];
    }

    for(let i=0; i< sec_cat.length; i++) {
        if(!sec_cat[i]) continue;
        let infos = formatResourcePage(await request(host + sec_cat[i][0])),
            save_path = `${save_root}${sec_cat[i][1]}/`;
        if(!Fs.existsSync(save_path)) Fs.mkdirSync(save_path);
        await type(infos,save_path);
    }
}

function getSecondCatalogue(html) {
    let infos = [];
    if(html.indexOf('<div') > -1) html = html.split('<div class="item-list">')[1].split('</div>')[0];
    html.replace('<ul>','').replace('</ul>','')
        .replace(/\<li.*href/g,'').replace(/\<\/a>\<\/li>\n/g,'')
        .split('="/cat/')
        .map(tr => {
            if(!tr) return;
            infos.push(tr.split('">'));
        });

    return infos;
}

function formatResourcePage(html) {
    let infos = [];
    if(html.indexOf('<tbody>') > -1) html = html.slice(html.indexOf('<tbody>'),html.indexOf('</tbody>'));
    html.slice(html.indexOf('<tr'),html.lastIndexOf('</tr>'))
        .replace(/\<tr.*\>/g,'').split('</tr>')
        //.slice(44,46)
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
    console.log(infos);
    return infos;
}

function rename(infos,save_path) {
    let paths = check(infos,save_path),len = paths.length;
    if(!len) return;

    while (paths.length) {
        let res = paths.shift(),
            old_path = save_path + res[2],
            new_path = res[1];

        if(Fs.existsSync(old_path)) {
            Fs.renameSync(old_path, new_path);
            console.info(`#RENAME: ${old_path} TO ${new_path}`);
        }
    }
}

async function down(infos,save_path) {
    //infos = infos.slice(0,1);
    let paths = check(infos,save_path),len = paths.length;
    if(!len) return;

    while (paths.length) {
        let res = paths.shift(),
            new_name = res[1];

        await new Promise((resolve,reject) => {
            Request(res[0]).pipe(Fs.createWriteStream(new_name))
                .on('error', function (err) {return reject();})
                .on('close', function (err) {
                    if (err) return reject();
                    console.info(`#DOWN[${len-paths.length}]: ${Fs.statSync(new_name).size}`);
                    resolve();
                });
        }).catch(err => {
            console.trace(res[0]);
            return Promise.resolve();
            //File.unlinkSync(new_name);
        });
    }

    if(is_circle) await down(infos,save_path);
}

function check(infos,save_path) {
    let back = [],info,res;
    for(let i=0; i<infos.length; i++) {
        info = infos[i];
        for(let j=1; j<info.length; j++) {
            res = info[j];

            let old_name_full = res[0],
                old_name_index = old_name_full.lastIndexOf('.'),
                ext = old_name_full.slice(old_name_index),
                new_name = info[0],
                title = new_name.slice(0,new_name.lastIndexOf('-')),
                auth = new_name.slice(new_name.lastIndexOf('-')+1),
                version = '';

            [':','\\\\','\/','\\?','\\*','\\"','<','>','\\|'].map(reg => {
                title = title.replace(new RegExp(reg,'g'),'_');
            });

            if((old_name_full.indexOf('_mobile') > -1) && (info.length > 3)) continue;
            if((old_name_full.indexOf('_eng.') > -1) || (old_name_full.indexOf('_e.') > -1)) version = '_eng';
            if(ext == '.mp3') {
                if(!is_mp3) continue;
                if(is_mp3 == 2 && info.length > 2) continue;
                let lst_letter = old_name_full.slice(old_name_index-1,old_name_index),
                    sec_lst_code = old_name_full.charCodeAt(old_name_index-2),
                    lst_code = old_name_full.charCodeAt(old_name_index-1);

                if((lst_code > 96)
                    && (lst_code < 123)
                    && (sec_lst_code <97 || sec_lst_code> 122)
                    && back.find(item => {return item[1].indexOf(title+'-') > -1})
                ) title += lst_letter;
            }

            let new_path = `${save_path}${title}${version}-${auth}${ext}`;
            if(is_restart
                || (!Fs.existsSync(new_path))
                || (Fs.statSync(new_path).size <1)
                || (is_size && (
                    ((ext != '.mp3') && (Fs.statSync(new_path).size<29000))
                    || ((ext == '.mp3') && (Fs.statSync(new_path).size<6000000)
                )))
            ) back.push([res[1],new_path,old_name_full]);
        }
    }

    console.info(`#CHECK: ${back.length} ${save_path}\n`,back);
    return back;
}

async function request(url,method,headers,body) {
    let option = {
        url,
        headers,
        method: method || 'get',
        form: (body && body.constructor == Object) ? body : null,
        body: (body && body.constructor == String) ? body : null
    };

    return await new Promise((resolve, reject) => {
        Request(option, function (err, res, msg) {
            if(err) {
                console.trace(err);
                reject(err);
            }
            return resolve(msg);
        });
    });
}