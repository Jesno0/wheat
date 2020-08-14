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
    //https://www.ximalaya.com/ertong/17583640
    //https://www.ximalaya.com/revision/album?albumId=17583640

    const page_id = url.slice(url.lastIndexOf('/')+1);
    const data = await this.get(`/revision/album?albumId=${page_id}`).catch(err => {
        if(err.ret == 200 || err.ok == 200) return err.data;
    });
    return data.tracksInfo.tracks.map(item => {
        return [
            `${data.mainInfo.albumTitle}_${item.title}`,
            // `${this.server}/revision/play/v1/audio?ptype=1id=${item.trackId}`
            item.trackId
        ]
    });
};

cls.prototype.resource_detail = async function (trackId) {
    //https://www.ximalaya.com/revision/play/v1/audio?id=174342931&ptype=1
    
    const data = await this.get(`/revision/play/v1/audio?ptype=1&id=${trackId}`).catch(err => {
        if(err.ret == 200 || err.ok == 200) return err.data;
    });;
    return data.src;
};

module.exports = new cls();