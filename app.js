
var server = require('./utils/server');
var md5 = require('./utils/md5.js');
// 授权登录 
App({
	onLaunch: function () {
		// auto login via SDK
		var that = this;
		//AV.User.loginWithWeapp();


		// 设备信息
		wx.getSystemInfo({
			success: function (res) {
				that.screenWidth = res.windowWidth;
				that.pixelRatio = res.pixelRatio;
			}
		});
	},

	getOpenId: function (cb) {
		wx.login({
			success: function (res) {
				if (res.code) {
          server.getJSON("/User/getOpenid", { url:'https://api.weixin.qq.com/sns/jscode2session?appid=wx8ce17f0ab071087c&secret=56912c849bdaeb3488855d72d458d9c3&js_code=' + res.code + '&grant_type=authorization_code&code=' + res.code },function(res){
// 获取openId
							var openId = res.data.openid;
							// TODO 缓存 openId
							var app = getApp();
							var that = app;
							that.globalData.openid = openId;

							//验证是否关联openid

							typeof cb == "function" && cb()
					});
					//发起网络请求
				}}});


	},

	register:function(cb){
     var app = this;
       this.getUserInfo(function () {
         var openId = app.globalData.openid;
            var userInfo = app.globalData.userInfo;
            var country = 1;
            var city = 2;
            var gender = 3;
            var nick_name =  4;
            var province = 5;
            var avatarUrl =6;


            server.getJSON('/User/register?open_id=' + openId + "&country=" + country + "&gender=" + gender + "&nick_name=" + nick_name + "&province=" + province + "&city=" + city + "&head_pic=" + avatarUrl,function(res){
app.globalData.userInfo = res.data.res
                
                typeof cb == "function" && cb()
						});

       })
  },
getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.uInfo = res.userInfo
             
              typeof cb == "function" && cb(that.globalData.uInfo)
            }
          })
        }
      })
    }
  },

	globalData: {
		'openid': null,
		'userInfo':null,
		'login':false,
    'city':39,
    'uInfo':null,
    'address':null
	}
})
