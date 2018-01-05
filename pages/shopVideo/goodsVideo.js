// about.js
var server = require('../../utils/server');
Page({

  /**
   * 页面的初始数据
   */
  data:{
    shopRight:true,
    curIndex: 0,// 控制active的显示
    toView: 'a',// 绑定滚动视图
    toList: 'a',// 绑定另一个滚动视图
    inputShow:true,
    goods_id:'',
    mp4_url:'',
    goodsDetail:[],
    goodsId:'',
    title:''

  },
  onPullDownRefresh:function(){// 下拉刷新
    console.log(2321)
  },

  
 
//页面执行
onLoad:function(options){
  console.log(options);

  this.data.goods_id = options.goods_id;
  this.getGoodsById(options.goods_id);//获取商品信息
  this.setData({
    mp4_url: options.mp4_url,
  })

},
getGoodsById: function (goodsId) {//获取商品信息

  var that = this

  server.getJSON('/Goods/goodsInfo/id/' + goodsId, function (res) {

    var goodsInfo = res.data.result;
    that.data.goodsDetail=goodsInfo;
    console.log(goodsInfo.goods);

    that.setData({
      goodsDetail: goodsInfo.goods,

    });

  });

},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var that=this;
    return {
      title: that.data.goodsDetail.goods_name,
      path: '../shopVideo/goodsVodeo?goods_id=' + that.data.goods_id,
      success: function (res) {
        wx.showToast({
          title: '转发',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  //视频介绍页跳转到商品详情页
   getGoodsDetail:function(e){

    wx.navigateTo({
      url: "../goods/detail/detail?objectId=" + e.currentTarget.dataset.goods_id
    });
  }
})