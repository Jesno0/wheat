'use strict';
/**
 * Created by Jesn on 2019/11/7.
 *
 */

const Fs = require('fs'),
    Queue = require('./queue'),
    Ut = require('../tool/utils'),
    Fydt = require('../external/fydt');

class cls {
    constructor () {}
}

cls.prototype.async = async function (check_list) {
    let len = check_list.length;
    if(!len) return;

    await Queue.create(check_list.map(item => {
        return {
            id: item[1],
            url: item[0]
        }
    }));
    Queue.start();
};

/**
 * 检测文件是否存在
 * @param resource_info
 * @param save_path
 * @param formats
 * @param reload
 * @returns {Array}
 * [
     [
        'https://www.fydt.org/sites/default/files/book/ebooks/Gdkn_testimony_updated.pdf',
        'F:/1_back/mine/bible/书籍推介/一生一世必有恩惠慈爱与我同在-周慧贤.pdf',
        'Gdkn_testimony_updated.pdf'
    ]
 ]
 */
cls.prototype.check = function (resource_info,save_path,formats,reload) {
    let back = [];

    for(let i=0; i<resource_info.length; i++) {
        let info = resource_info[i];
        for (let j = 1; j < info.length; j++) {
            let res = info[j],
                old_name_full = res[0],
                old_name_index = old_name_full.lastIndexOf('.'),
                ext = old_name_full.slice(old_name_index),
                type = Ut.getType(ext);
            if (formats.indexOf(type) < 0) continue;

            let new_name = info[0],
                auth_index = new_name.lastIndexOf('-'),
                title = Ut.fixFileName((auth_index>-1) ? new_name.slice(0, auth_index) : new_name),
                auth = (auth_index>-1) ? '-'+new_name.slice(auth_index + 1) : '',
                version = '';

            if(type == 'doc') {
                if ((title.indexOf('_mobile') > -1) && (info.length > 3)) continue;
                if ((old_name_full.indexOf('_eng.') > -1) || (old_name_full.indexOf('_e.') > -1)) version = '_eng';
            }
            while(back.find(item => {
                return item[1].indexOf(`${title}${version}${auth}${ext}`) > -1;
            })) version += old_name_full.slice(old_name_index - 1, old_name_index);

            let new_path = `${save_path}/${title}${version}${auth}${ext}`;
            if (reload
                || !Fs.existsSync(new_path)
                || (Fs.statSync(new_path).size <1)
            ) back.push([res[1], new_path, old_name_full]);
        }
    }

    //console.info(`#CHECK: ${back.length} ${save_path}\n`,back);
    return back;
};

/**
 *
 * @param catalogues
 * @returns {Array}
 * [{
    save: '/讲道信息/寻求神的正确途径',
    resources: [
        [ '寻求神的正确途径-李马可牧师',
            [ 'wg01.mp3','https://www.fydt.org/system/files_force/sermon-mp3/wg01.mp3?download=1' ] ]
    ]
}]
 */

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
            case Fydt.types.faq_catalogue:
                if(!type_info.children) return [];
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    for (j = 0; j < infos.length; j++) {
                        info = infos[j];
                        if(!info[0]) continue;
                        let children = await circle(Object.assign({
                            url: info[0],
                            name: info[1]
                        }, type_info.children), save);
                        resources = resources.concat(children[0].resources);
                    }
                }
                return [{save,resources}];
            case Fydt.types.faq_list:
                if(!type_info.children) return [];
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    for (j = 0; j < infos.length; j++) {
                        info = infos[j];
                        if(!info[0]) continue;
                        let children = await circle(Object.assign({
                            url: info[0],
                            name: info[1]
                        }, type_info.children), save);
                        resources = resources.concat(children[0].resources);
                    }
                }
                return [{save,resources}];
            case Fydt.types.faq_detail:
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    resources.push([name,infos]);
                }
                return [{save,resources}];
            case Fydt.types.book_catalogue:
                if(!type_info.children) return [];
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    for (j = 0; j < infos.length; j++) {
                        info = infos[j];
                        if(!info[0]) continue;
                        let children = await circle(Object.assign({
                            url: info[0],
                            name: info[1]
                        }, type_info.children), save);
                        resources = resources.concat(children[0].resources);
                    }
                }
                return [{save,resources}];
            case Fydt.types.book_list:
                for(i=0; i< urls.length; i++) {
                    url = urls[i];
                    infos = await Fydt[type](url);
                    resources = resources.concat(infos);
                }
                return [{save,resources}];
        }
    }
};

module.exports = new cls();