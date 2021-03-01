'use strict';
/**
 * Created by Jesn on 2020/3/2.
 *
 */

const Base = require('./base');

class cls extends Base {
    constructor() {
        super('ximalaya');
    }

    async getHtml (url) {
        url = url.replace(this.server,'');
        return super.request('get', url, null, 'html');
    }
}

cls.prototype.resource_list = async function (url) {
    //https://www.ximalaya.com/ertong/17583640（原网页）
    //https://www.ximalaya.com/revision/album?albumId=17583640（故事资讯）
    //https://www.ximalaya.com/revision/album/v1/getTracksList?albumId=17583640&pageNum=1&pageSize=1000（资源列表）

    const back = [];

    if(url.slice(-1) == '/') url = url.slice(0,-1);
    const page_id = url.slice(url.lastIndexOf('/')+1);
    const info = await this.get(`/revision/album?albumId=${page_id}`).catch(err => {
        if(err.ret == 200 || err.ok == 200) return err.data;
    });
    if(!info) return back;

    const is_paid = info && info.mainInfo && info.mainInfo.isPaid;
    if(is_paid) return Promise.reject({ok:-1,msg:"此为付费内容，不能下载。"});

    let total = info.tracksInfo && info.tracksInfo.trackTotalCount || 0;
    let i = 1;
    while(total > 0) {
        const data = await this.get(`/revision/album/v1/getTracksList?albumId=${page_id}&pageNum=${i}&pageSize=100`).catch(err => {
            if(err.ret == 200 || err.ok == 200) return err.data;
        });
        back.push( ...data.tracks.map(item => {
            return [
                `${info.mainInfo.albumTitle}_${item.title}`,
                item.trackId
            ]
        }));
        total = total-100;
        i++;
    }

    return back;
};

cls.prototype.resource_detail = async function (trackId) {
    //https://www.ximalaya.com/revision/play/v1/audio?id=174342931&ptype=1
    
    const data = await this.get(`/revision/play/v1/audio?ptype=1&id=${trackId}`).catch(err => {
        if(err.ret == 200 || err.ok == 200) return err.data;
    });
    return data.src;
};

module.exports = new cls();