var server = require('../../utils/server');
Page({
    data: {
        topCategories: [],
        subCategories: [],
        highlight: ['highlight', '', '', '', '', '', '', '', '', '', '', ''],
        banner: ''
    },
    onLoad: function () {
        this.getTopCategory();
       
    },
    tapTopCategory: function (e) {
        // 拿到objectId，作为访问子类的参数
        var objectId = e.currentTarget.dataset.id;
        var banner_name = e.currentTarget.dataset.banner;
        
        var index = parseInt(e.currentTarget.dataset.index);
        this.setHighlight(index);
        
        this.getCategory(objectId);
        this.getBanner(banner_name);

    },
    
    clickBanner: function (e) {

		var goodsId = e.currentTarget.dataset.goodsId;
		wx.navigateTo({
			url: "../goods/detail/detail?objectId=" + goodsId
		});
	},
    getTopCategory: function (parent) {
        var that = this;
        server.getJSON("/Goods/goodsCategoryList",function(res){
var categorys = res.data.result;
                that.setData({
                    topCategories: categorys
                });
    
                that.getCategory(categorys[0].id);
                that.getBanner(categorys[0].mobile_name);
        });
    },
    getCategory: function (parent) {
        var that = this;


       server.getJSON('/Goods/goodsCategoryList/parent_id/'+parent,function(res){
var categorys = res.data.result;
                that.setData({
                    subCategories: categorys
                });
       });
    },
    setHighlight: function (index) {
        var highlight = [];
        for (var i = 0; i < this.data.topCategories; i++) {
            highlight[i] = '';
        }
        highlight[index] = 'highlight';
        this.setData({
            highlight: highlight
        });
    },
    avatarTap: function (e) {
        // 拿到objectId，作为访问子类的参数
        var objectId = e.currentTarget.dataset.objectId;
        wx.navigateTo({
            url: "../../../../goods/list/list?categoryId=" + objectId
        });
    },
    getBanner: function (banner_name) {


        var that = this;

    server.getJSON('/goods/categoryBanner/banner_name/'+banner_name,function(res){
var banner = res.data.banner;
                that.setData({
                    banner: banner
                });
    });

    }
})
