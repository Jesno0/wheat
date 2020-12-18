'use strict';
/**
 * Created by Jesn on 2020/8/20.
 *
 */

const Fs = require('fs'),
    Ut = require('../tool/utils'),
    Queue = require('./queue');

class cls {
    constructor () {}
}

cls.prototype.async = async function (dir,save,reload,is_dir,formats) {
    const list = await this.check(dir,save,reload,is_dir,formats);
    if(!list.length) return;

    await Queue.create(list);
    Queue.start();
}

cls.prototype.check = async function (dir,save,reload=false,is_dir,formats) {
    const back = [];
    circle(dir,save);
    return back;

    function circle(_dir,_save) {
        if(_dir.slice(-1) == "/") _dir = _dir.slice(0,-1);
        if(_save.slice(-1) == "/") _save = _save.slice(0,-1);

        const files = Fs.readdirSync(_dir).sort();
        files.map(file_name => {
            const _origin = `${_dir}/${file_name}`
            const _target = `${_save}/${file_name}`;

            if(Fs.lstatSync(_origin).isDirectory()) {
                circle(_origin, is_dir?_target:_save);
            }else {
                const is_exists = Fs.existsSync(_target);
                const ext = _origin.slice(_origin.lastIndexOf('.')+1);
                const type = Ut.getType(ext);
                if((reload || !is_exists) && (!formats || formats.includes(type))) {
                    back.push({
                        id: _target,
                        url: _origin
                    });
                }
            }
        });
    }
};

cls.prototype.dirList = function (url,sort_by='name',sort_type='asc') {
    const back = [];
    circle(url);
    return back;

    function circle(_dir) {
        if(_dir.slice(-1) == "/") _dir = _dir.slice(0,-1);
        const files = Fs.readdirSync(_dir).sort();

        if(sort_by != 'name') {
            files.sort( (a,b) => { 
                const a_stats = Fs.statSync(`${_dir}/${a}`);
                const b_stats = Fs.statSync(`${_dir}/${b}`);
                if(sort_type == 'desc') return a_stats[sort_by] > b_stats[sort_by] ? -1 : 1;
                else return a_stats[sort_by] > b_stats[sort_by] ? 1 : -1;
            });
        }

        files.map(file_name => {
            const target = `${_dir}/${file_name}`;
            if(Fs.lstatSync(target).isDirectory()) {
                circle(target);
            }else {
                back.push(target.replace(`${url}/`,''));
            }
        });
    }
};

cls.prototype.writeCatalogue = function (arr) {
    return arr.map((item,i) => {
        return `${i}:${item}`;
    }).join('\n');
};

module.exports = new cls();