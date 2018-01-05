var encrypt = require('encrypt.js');

var sdkappid = "1400059002";
function anologin(cb,openid){
      wx.request({
            url: 'https://tls.qcloud.com/anologin', //仅为示例，并非真实的接口地址
            data: {
                "passwd": encrypt.getRSAH1(),
                "url": 'https://tls.qcloud.com/demo.html',
                "sdkappid": sdkappid
            },
            method: 'GET',
            header: {
                // 'content-type': 'application/json'
            },
            success: function(res) {
                var matches = res.data.match(/tlsAnoLogin\((.*?)\)/);
                var params = JSON.parse(matches[1]);
                login({
                    TmpSig : params.TmpSig,
                    Identifier: openid,
                    success : cb
                })
            }
        });
}



function login(opts){
    wx.request({
        url: 'https://www.ctsm888.com/index.php/WXAPI/Cloud/getSign', //仅为示例，并非真实的接口地址
        data: {
            "tmpsig": opts.TmpSig,
            "identifier": opts.Identifier,
            "sdkappid": sdkappid
        },
        method: 'GET',
        header: {
            // 'content-type': 'application/json'
        },
        success: function(res) {
            var matches = res.data.match(/tlsGetUserSig\((.*?)\)/);
            var UserSig = res.data;
            opts.success && opts.success({
                Identifier : opts.Identifier,
                UserSig : UserSig
            });
        },
        fail : function(errMsg){
            opts.error && opts.error(errMsg);
        }
    });
}

module.exports = {
    init : function(opts){
        sdkappid = opts.sdkappid;
    },
    anologin : anologin,
    login : login
};