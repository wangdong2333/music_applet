// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId:String,
    blog:Object
  },
  //在组件中引入父组件传入的字体图标，目的是可以在组件中展示
  externalClasses: ['iconfont', 'icon-pinglun', 'icon-fenxiang'],


  /**
   * 组件的初始数据
   */
  data: {
    loginShow: false,// 登录组件是否显示
    modalShow: false,
    content:'',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment(){
      //判断是否授权
      wx.getSetting({
        success :(res) =>{
          if (res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success :(res) =>{
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow: true,
                })
              }
            })
          }else{
            this.setData({
              loginShow: true,
            })
          }
        }
      })
    },

    onLoginsuccess(event) {
      userInfo = event.detail
      // 授权框消失，评论框显示
      this.setData({
        loginShow: false,
      }, () => {
        this.setData({
          modalShow: true,
        })
      })
    },

    onLoginfail() {
      wx.showModal({
        title: '授权用户才能进行评价',
        content: '',
      })
    },
    onInput(event){
      this.setData({
        content: event.detail.value
      })
    },
    onSend(){
      let content = this.data.content
      if (content.trim() == '') {
        wx.showModal({
          title: '评论内容不能为空',
          content: '',
        })
        return
      }
      wx.showLoading({
        title: '评论中',
        mask: true,
      })
      db.collection('blog-comment').add({
        data:{
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then((res) =>{
        wx.hideLoading();
        wx.showToast({
          title: "评论成功"
        })
        this.setData({
          modalShow: false,
          content: '',
        })
        //刷新评论页面
        this.triggerEvent('refreshCommentList')
      })
    },

  }
})
