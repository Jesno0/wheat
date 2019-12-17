'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Request = require('request'),
    Fs = require('fs'),
    Frame = require('koa2frame'),
    Err = Frame.error,
    Fydt = require('../external/fydt');

class cls {
    constructor () {
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

cls.prototype.check = function (resource_info,save_path,formats,reload) {
    let back = [];

    for(let i=0; i<resource_info.length; i++) {
        let info = resource_info[i];
        for (let j = 1; j < info.length; j++) {
            let res = info[j],
                old_name_full = res[0],
                old_name_index = old_name_full.lastIndexOf('.'),
                ext = old_name_full.slice(old_name_index),
                type = this.getType(ext);
            if (formats.indexOf(type) < 0) continue;

            let new_name = info[0],
                auth_index = new_name.lastIndexOf('-'),
                title = (auth_index>-1) ? new_name.slice(0, auth_index) : new_name,
                auth = (auth_index>-1) ? '-'+new_name.slice(auth_index + 1) : '',
                version = '';

            [':','\\\\','\/','\\?','\\*','\\"','<','>','\\|'].map(reg => {
                title = title.replace(new RegExp(reg,'g'),'_');
            });

            switch (type) {
                case 'doc':
                    if ((title.indexOf('_mobile') > -1) && (info.length > 3)) continue;
                    if ((old_name_full.indexOf('_eng.') > -1) || (old_name_full.indexOf('_e.') > -1)) version = '_eng';
                    break;
                case 'audio':
                    let lst_letter = old_name_full.slice(old_name_index - 1, old_name_index),
                        sec_lst_code = old_name_full.charCodeAt(old_name_index - 2),
                        lst_code = old_name_full.charCodeAt(old_name_index - 1);
                    if((lst_code > 96)
                        && (lst_code < 123)
                        && (sec_lst_code <97 || sec_lst_code> 122)
                        && back.find(item => {return item[1].indexOf(title+'-') > -1})
                    ) title += lst_letter;
                    break;
            }

            if(!Fs.existsSync(save_path)) Fs.mkdirSync(save_path);
            let new_path = `${save_path}/${title}${version}${auth}${ext}`;
            if (reload || !Fs.existsSync(new_path)) back.push([res[1], new_path, old_name_full]);
        }
    }

    //console.info(`#CHECK: ${back.length} ${save_path}\n`,back);
    return back;
};

cls.prototype.getResourceList = async function (catalogues) {
    let i,name,cat,back = [];
    for(i=0; i< catalogues.length; i++) {
        name = catalogues[i];
        cat = Fydt.catalogues[name];
        let type_info = Object.assign({name}, cat);
        if (type_info) back = back.concat(await circle(type_info));
    }
    return back;

    async function circle (type_info,save) {
        let urls = type_info.url;
        if(!urls) return;
        if(urls.constructor != Array) urls = [urls];

        let name = type_info.name;
        save = save || '';
        if(name) save += `/${name}`;

        let type = type_info.type,
            resources = [],
            i, j, url, infos, info;

        switch (type) {
            case Fydt.types.catalogue:
                if(!type_info.children) break;
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    for (j = 0; j < infos.length; j++) {
                        info = infos[j];
                        let children = await circle(Object.assign({
                            url: info[0],
                            name: info[1]
                        }, type_info.children), save);
                        resources = resources.concat(children);
                    }
                }
                return resources;
            case Fydt.types.resource_list:
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    resources = resources.concat(infos);
                }
                return [{save,resources}];
            case Fydt.types.music_catalogue:
                if(!type_info.children) return [];
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    for (j = 0; j < infos.length; j++) {
                        info = infos[j];
                        let children = await circle(Object.assign({
                            url: info[0],
                            name: info[1]
                        }, type_info.children), save);
                        resources = resources.concat(children[0].resources);
                    }
                }
                return [{save,resources}];
            case Fydt.types.resource_detail:
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    resources.push([name].concat(infos));
                }
                return [{save,resources}];
        }
    }
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