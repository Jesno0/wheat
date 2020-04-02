'use strict';
/**
 * Created by Jesn on 2020/4/1.
 *
 */

const crypto = require('crypto'),
    Frame = require('koa2frame'),
    Err = Frame.error,
    Base = require('./base');

class cls extends Base {
    constructor () {
        super('aishen');

        this.types = {
            resource_list: 'resource_list',
            resource_id: 'resource_id'
        };

        this.catalogues = {
            "神学书籍": {
                type: this.types.resource_list,
                url: '1000',
                children: {
                    type: this.types.resource_id
                }
            },"灵修书籍": {
                type: this.types.resource_list,
                url: '2000',
                children: {
                    type: this.types.resource_id
                }
            },"信仰随笔": {
                type: this.types.resource_list,
                url: '3000',
                children: {
                    type: this.types.resource_id
                }
            },"讲道讲章": {
                type: this.types.resource_list,
                url: '4000',
                children: {
                    type: this.types.resource_id
                }
            },"热门书籍": {
                type: this.types.resource_list,
                url: '5000',
                children: {
                    type: this.types.resource_id
                }
            }
        };
    }

    async request(method,api,info,back_format,err_msg) {
        let back = await super.request(method, api, info, back_format, err_msg, ['1', 200]);
        if(!back) return Promise.reject(Err.get(Err.parameter_error,{method,api,info}));
        return back;
    }
}

cls.prototype.resource_list = async function (par_id,cls_id) {
    let back = [],
        page_num = 0,
        page_count = 1;

    while(page_num < page_count) {
        let data = await this.request('post','/CsAjax.do',{
            headers: {
                //Host: 'www.aishen360.com',
                //'Content-Type': 'application/x-www-form-urlencoded',
                //Cookie: '_gads=ID=906c4e15554ae12f:T=1585615024:S=ALNI_Mab3Rv5JKAnODYbKcMmRNbb4BpE6Q; _ga=GA1.2.154594386.1585615027; _gid=GA1.2.1461507691.1585615028; isEnabledCookie=true; JSESSIONID=abcSM7nQLWxVYgndHOVex; Hm_lvt_ada9039d77ee056bd43572b93c9b8b08=1585615028,1585642087; COOKIE_IS_ENABLED_COOKIE=abcSM7nQLWxVYgndHOVex; Hm_lpvt_ada9039d77ee056bd43572b93c9b8b08=1585699960; __atuvc=74%7C14; __atuvs=5e83d90e0a1544a700b'
                Cookie:'JSESSIONID=abcSM7nQLWxVYgndHOVex; COOKIE_IS_ENABLED_COOKIE=abcSM7nQLWxVYgndHOVex; '
            },
            query: {
                method: 'getBookListCommon'
            },
            body: {
                par_id,
                cls_id,
                page_num
            }
        }).catch(result => {
            if(result.ok == '1') return result.data;
            return Promise.reject(result);
        });

        if(!data.records) console.log(data,par_id,page_num);
        back = back.concat(data.records
            .filter(function(item) {
                return item.state == 'Completed'
            }).map(item => {
                return {
                    name: item.bName,
                    auth: item.aName,
                    url: item.bUrl,
                    cat: item.cat
                }
            }));
        if(page_num == 0) page_count = data.pageNum;
        page_num ++;
    }

    return back;
};

cls.prototype.resource_id = async function (url) {
    let html = await this.get(`/download/${url}.html`, null, 'html');
    return html.split('/file/').slice(1,3).map(item => {
        let arr = item.slice(0,item.indexOf('"')).split('-');
        return {
            uid: arr[0],
            fid: arr[1]
        }
    })
};

module.exports = new cls();