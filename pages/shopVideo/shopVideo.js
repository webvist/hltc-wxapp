// about.js
var server = require('../../utils/server');
var categoryId
var keywords
var cPage = 0;
var gsort = "shop_price";
var asc = "desc";
var store_id;
var webim = require('../../utils/im/webim.js');
var webimhandler = require('../../utils/im/webim_handler.js');
var tls = require('../../utils/im/tls.js');
var app = getApp()

var Config = {
  sdkappid: 1400059002
  , accountType: 21105
  , accountMode: 0 //帐号模式，0-表示独立模式，1-表示托管模式
};

tls.init({
  sdkappid: Config.sdkappid
})
Page({

  /**
   * 页面的初始数据
   */
  data:{
    shopRight:true,
    store_name:'',
    curIndex: 0,// 控制active的显示
    toView: 'a',// 绑定滚动视图
    toList: 'a',// 绑定另一个滚动视图
    inputShow:true,
    videoLive:'',
    inke_uid:'',
    store:[],
    menu: ["highlight", "", "", ""],
    goods_image:'',
    sort: [['shop_price-desc', 'shop_price-asc'], ['sales_sum-desc', 'sales_sum-asc'], ['is_new-desc', 'is_new-asc'], 'comment_count-asc'],
    goods: [],
    goodsDetail:[],
    goodsList:[],
    empty: false,
    textStates: ["view-btns-text-normal", "view-btns-text-select"],
    price:'',
    goods_num:1,
    image:''
  },
  onPullDownRefresh:function(){// 下拉刷新
    console.log(2321)
  },

  
  closeInput:function(){// 关闭输入框
    this.setData({
      inputShow:false
    })
  },
  showInput:function(){// 显示输入框
    this.setData({
      inputShow: true
    })
  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '新款棉服 + 免抽单',
      path: '/page/shopVideo/shopVideo',
      success: function (res) {
       
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  onLoad: function (options) {

    var that=this;

    var categoryId ='';
    var store_id = options.id;
    var keywords = '';
    // 生成Category对象
    //var category = AV.Object.createWithoutData('Category', categoryId);
    //this.category = category;
    
    this.data.inke_uid=options.inke_uid;
    this.getGoods(categoryId, 0, this.data.sort[0][0],store_id);
    this.getStore(store_id,this.data.inke_uid);
    that.login(function () {
      that.initIM(app.globalData.userInfo);
    });
  },
  getStore:function(store_id,inke_uid){
    var that=this;
    server.getJSON('/Store/getInkeLive',{store_id:store_id,inke_uid:inke_uid},function(res){
      
      
        that.setData({
          store:res.data,
        })
    })
  },
  getGoods: function (category, pageIndex, sort,store_id) {
    var that = this;
    var sortArray = sort.split('-');
    gsort = sortArray[0];
    asc = sortArray[1];


    server.getJSON('/Store/storeGoods', { store_id: store_id, p: pageIndex, sort: sortArray[0], sort_asc: sortArray[1] }, function (res) {

      // success
     
      var newgoods = res.data.result.goods_list

      var ms = that.data.goods
     
      for (var i in newgoods) {
        ms.push(newgoods[i]);
      }

      if (ms.length == 0) {
        that.setData({
          empty: true
        });
      }
      else
        that.setData({
          empty: false
        });
      wx.stopPullDownRefresh();

      that.setData({
        goodsList: ms
      });


    });

  },
  switchBar: function (e) {// 点击衣服
    
    this.getGoodsById(e.currentTarget.dataset.id);
    this.setData({
      shopRight: false
    })
  },
  closeShopRight: function () { // 关闭产品介绍
    this.setData({
      shopRight: true
    })
  },
  getGoodsById: function (goodsId) {//获取商品信息

    var that = this

    server.getJSON('/Goods/goodsInfo/id/' + goodsId, function (res) {
      
      var goodsInfo = res.data.result;
     
     
      that.setData({
        goods: goodsInfo,
        price:goodsInfo.goods.shop_price,
      });
     
    });

  },
  //点击图片，判断是否有视频介绍 跳转
  getGoodsDetail:function(e){
    
    server.getJSON('/Goods/getGoodsVideo/goods_id/' + e.currentTarget.dataset.goods_id, function (res) {
          if(res.data.status==1){
            wx.navigateTo({
              url: '../shopVideo/goodsVideo?goods_id=' + res.data.data.goods_id + '&mp4_url=' + res.data.data.mp4_url,
              success: function (res) {
                // success
              },
            
            })
          }else{
            wx.navigateTo({
              url: "../goods/detail/detail?objectId=" + e.currentTarget.dataset.goods_id
            });
          }
    })
  },
  //切换商品规格
  propClick: function (e) {
    var pos = e.currentTarget.dataset.pos;
    var index = e.currentTarget.dataset.index;
    var goods = this.data.goods
    for (var i = 0; i < goods.goods.goods_spec_list[index].length; i++) {

      if (i == pos)
        goods.goods.goods_spec_list[index][pos].isClick = 1;
      else
        goods.goods.goods_spec_list[index][i].isClick = 0;
    }

    this.setData({ goods: goods });
    this.checkPrice();
  },
  //根据规格更改价格
  checkPrice: function () {
    var goods = this.data.goods;
    
    var spec = ""
    this.setData({ price: goods.goods.shop_price });
    if (goods.goods.goods_spec_list != null)
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {
        
        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }

    var specs = spec.split("_");
    if (spec != null)
      for (var i = 0; i < specs.length; i++) {
        specs[i] = parseInt(specs[i])
      }
    specs.sort(function (a, b) { return a - b });
    spec = ""
    for (var i = 0; i < specs.length; i++) {
      if (spec == "")
        spec = specs[i]
      else
        spec = spec + "_" + specs[i]
    }
   
    if (goods['spec_goods_price'] != null)
      var price = goods['spec_goods_price'][spec].price;
    else
      var price = goods.goods.shop_price;
    
    this.setData({ price: price });
  },
  goCart:function(){
    wx.switchTab({
      url: "../cart/cart",
    });
  },
  // 数量加减
  bindMinus: function (e) {

    var num = this.data.goods_num;
    if (num > 1) {
      num--;
    }

    this.setData({ goods_num: num });
  },
  bindManual: function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var num = e.detail.value;
    this.setData({ goods_num: num });
  },
  bindPlus: function (e) {
    var num = this.data.goods_num;

    num++;

    this.setData({ goods_num: num });
  },
  //加入购物车
  addCart: function () {

    var goods = this.data.goods;
    var spec = ""
    if (goods.goods.goods_spec_list != null)
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {

        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }




    var app = getApp()
    var that = this;
    var goods_id = that.data.goods.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.goods_num;
    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id



    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id, city: that.data.goods.goods.city }, function (res) {
      if (res.data.status == 1)
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 1000
        });
      else
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 1000
        });
    });


  },
  //购买
  bug: function () {
    var goods = this.data.goods;
    var spec = ""
    if (goods.goods.goods_spec_list != null)
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {

        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].lick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }


    var app = getApp()
    var that = this;
    var goods_id = that.data.goods.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.goods_num;

    var user_id = "0"
    if (app.globalData.login)
      user_id = app.globalData.userInfo.user_id



    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id }, function (res) {

      if (res.data.status == 1) {
        wx.showToast({
          title: '已加入购物车',
          icon: 'success',
          duration: 2000
        });
        wx.switchTab({
          url: '../../cart/cart'
        });
      }
      else
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 2000
        });


    });

    return;

  },
  //im

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  clearInput: function () {
    var msgContent;
    this.setData({
      msgContent: ""
    })
  },

  bindConfirm: function (e) {
    var that = this;
    var content = that.inputValue;
    if (!content.replace(/^\s*|\s*$/g, '')) return;
    webimhandler.onSendMsg(content, function () {
      that.clearInput();
      that.inputValue='';
    })
  },
  bindInputBlur: function (e) {

    this.inputValue = e.detail.value
  },
  bindTap: function () {
    webimhandler.sendGroupLoveMsg();
  },

  login: function (cb) {
    var that = this;
    tls.anologin(function (data) {
      that.setData({
        Identifier: data.Identifier,
        UserSig: data.UserSig
      })
      cb();
    }, app.globalData.openid);
  },


  receiveMsgs: function (data) {
    var msgs = this.data.msgs || [];
    msgs.push(data);
    //最多展示10条信息
    if (msgs.length > 10) {
      msgs.splice(0, msgs.length - 10)
    }

    this.setData({
      msgs: msgs
    })
  },

  initIM: function (userInfo) {
    var that = this;

    var avChatRoomId = '@TGS#a2Y7MJAFP';
    webimhandler.init({
      accountMode: Config.accountMode
      , accountType: Config.accountType
      , sdkAppID: Config.sdkappid
      , avChatRoomId: avChatRoomId //默认房间群ID，群类型必须是直播聊天室（AVChatRoom），这个为官方测试ID(托管模式)
      , selType: webim.SESSION_TYPE.GROUP
      , selToID: avChatRoomId
      , selSess: null //当前聊天会话
    });
    //当前用户身份
    var loginInfo = {
      'sdkAppID': Config.sdkappid, //用户所属应用id,必填
      'appIDAt3rd': Config.sdkappid, //用户所属应用id，必填
      'accountType': Config.accountType, //用户所属应用帐号类型，必填
      'identifier': that.data.Identifier, //当前用户ID,必须是否字符串类型，选填
      'identifierNick':app.globalData.uInfo.nickName, //当前用户昵称，选填
      'userSig': that.data.UserSig, //当前用户身份凭证，必须是字符串类型，选填
    };

    //监听（多终端同步）群系统消息方法，方法都定义在demo_group_notice.js文件中
    var onGroupSystemNotifys = {
      "5": webimhandler.onDestoryGroupNotify, //群被解散(全员接收)
      "11": webimhandler.onRevokeGroupNotify, //群已被回收(全员接收)
      "255": webimhandler.onCustomGroupNotify//用户自定义通知(默认全员接收)
    };

    //监听连接状态回调变化事件
    var onConnNotify = function (resp) {
      switch (resp.ErrorCode) {
        case webim.CONNECTION_STATUS.ON:
          //webim.Log.warn('连接状态正常...');
          break;
        case webim.CONNECTION_STATUS.OFF:
          webim.Log.warn('连接已断开，无法收到新消息，请检查下你的网络是否正常');
          break;
        default:
          webim.Log.error('未知连接状态,status=' + resp.ErrorCode);
          break;
      }
    };


    //监听事件
    var listeners = {
      "onConnNotify": webimhandler.onConnNotify, //选填
      "onBigGroupMsgNotify": function (msg) {
        console.log(msg);
        webimhandler.onBigGroupMsgNotify(msg, function (msgs) {
          console.log(msgs);
          that.receiveMsgs(msgs);
        })
      }, //监听新消息(大群)事件，必填
      "onMsgNotify": webimhandler.onMsgNotify,//监听新消息(私聊(包括普通消息和全员推送消息)，普通群(非直播聊天室)消息)事件，必填
      "onGroupSystemNotifys": webimhandler.onGroupSystemNotifys, //监听（多终端同步）群系统消息事件，必填
      "onGroupInfoChangeNotify": webimhandler.onGroupInfoChangeNotify//监听群资料变化事件，选填
    };

    //其他对象，选填
    var options = {
      'isAccessFormalEnv': true,//是否访问正式环境，默认访问正式，选填
      'isLogOn': true//是否开启控制台打印日志,默认开启，选填
    };

    if (Config.accountMode == 1) {//托管模式
      webimhandler.sdkLogin(loginInfo, listeners, options, avChatRoomId);
    } else {//独立模式
      //sdk登录
      webimhandler.sdkLogin(loginInfo, listeners, options, avChatRoomId);
    }
  },
})