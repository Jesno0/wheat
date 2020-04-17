'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Queue = require('./queue'),
    Fs = require('fs'),
    BaiduFile = require('../external/baiduFile');

class cls {
    constructor () {}
}

cls.prototype.fileDown = async function (url,save) {
    //let data = Fs.readFileSync('F:/1_back/mine/OneDrive/bible/book/见证/盖恩夫人/与神联合 - 百度文库_files/' +
    //    'u=977875597,3923327529&fm=76',{encoding:'binary'});
    const iconv = require('iconv-lite');
    var fileStr = Fs.readFileSync('F:/1_back/mine/OneDrive/bible/book/见证/盖恩夫人/与神联合 - 百度文库_files/' +
        'u=977875597,3923327529&fm=76', {encoding:'binary'});
    //var buf = new Buffer(fileStr, 'binary');
    var data = iconv.decode(fileStr, 'gbk');
    console.log(data);

    ww55
    let content = await BaiduFile.resource_detail(url);
    let list = [{
        id: save + content[0] + '.txt',
        url: content[1]
    }];
    await Queue.create(list);
    Queue.start(BaiduFile);

};

module.exports = new cls();