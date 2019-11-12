'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Request = require('request'),
    Fs = require('fs'),
    Frame = require('koa2frame'),
    Err = Frame.error,
    Ut = Frame.utils,
    Fydt = require('../external/fydt');

class cls {
    constructor () {
        this.catalogues = ["shujuanchakao","zhuantixilie","jiangdaoxinxi","shengjingyishenlun","shengmingzaisi"];
        this.catalogues_name = ["书卷考查","专题系列","讲道信息","圣经一神论","生命再思"];
        //todo:通过网页获取
    }
}

cls.prototype.update = async function (check_list) {
    //check_list = check_list.slice(0,2);
    let len = check_list.length;
    if(!len) return;

    while (check_list.length) {
        let res = check_list.shift(),
            new_name = res[1];

        await new Promise((resolve,reject) => {
            console.log(res[1]);
            Request(res[0]).pipe(Fs.createWriteStream(new_name))
                .on('error', function (err) {return reject();})
                .on('close', function (err) {
                    if (err) return reject();
                    console.info(`#DOWN[${len-check_list.length}]: ${Fs.statSync(new_name).size}`);
                    resolve();
                });
        }).catch(err => {
            Err.log(Err.error_log_type.http,res[0],res[1],err);
            return Promise.resolve();
            //File.unlinkSync(new_name);
        });
    }
};

cls.prototype.check = async function (url,save_path,formats,reload) {
    let back = [],list = await Fydt.getResourcePage(url);

    for(let i=1; i<list.length; i++) {
        let info = list[i];
        for (let j = 1; j < info.length; j++) {
            let res = info[j],
                old_name_full = res[0],
                old_name_index = old_name_full.lastIndexOf('.'),
                ext = old_name_full.slice(old_name_index),
                type = this.getType(ext);
            if (formats.indexOf(type) < 0) continue;

            let new_name = info[0],
                title = new_name.slice(0, new_name.lastIndexOf('-')),
                auth = new_name.slice(new_name.lastIndexOf('-') + 1),
                version = '';

            switch (type) {
                case 'doc':
                    if ((title.indexOf('_mobile') > -1) && (info.length > 3)) continue;
                    if ((old_name_full.indexOf('_eng.') > -1) || (old_name_full.indexOf('_e.') > -1)) version = '_eng';
                    break;
                case 'audio':
                    let lst_letter = old_name_full.slice(old_name_index - 1, old_name_index),
                        sec_lst_code = old_name_full.charCodeAt(old_name_index - 2),
                        lst_code = old_name_full.charCodeAt(old_name_index - 1);
                    if ((lst_code > 96) && (lst_code < 123) && (sec_lst_code < 97 || sec_lst_code > 122)) title += lst_letter;
                    break;
            }

            if(!Fs.existsSync(save_path)) Fs.mkdirSync(save_path);
            let new_path = `${save_path}/${title}${version}-${auth}${ext}`;
            if (reload || !Fs.existsSync(new_path)) back.push([res[1], new_path, old_name_full]);
        }
    }

    //console.info(`#CHECK: ${back.length} ${save_path}\n`,back);
    return back;
};

cls.prototype.getPaths = async function (catalogues) {
    return Ut.noRepeat(await Promise.all(catalogues.map(async cat => {
        let index = this.catalogues.indexOf(cat);
        if(index < 0) return;

        let url = `/cat/${cat}`,
            save = `/${this.catalogues_name[this.catalogues.indexOf(cat)]}`;
        if(index < 3) {
            (await Fydt.getSecondCatalogue(`/cat/${cat}`)).map(info => {
                url += `/${info[0]}`;
                save += `/${info[1]}`;
            });
        }
        return [url,save];
    })));
};

cls.prototype.getType = function (ext) {
    if(ext.slice(0,1) == '.') ext = ext.slice(1);
    switch (ext) {
        case 'mp3':
        case 'wav':
        case 'avi':
            return 'audio';
        default:
            return 'doc';
    }
};

module.exports = new cls();