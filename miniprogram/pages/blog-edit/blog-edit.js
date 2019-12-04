// 输入文字最大的个数
const MAX_WORDS_NUM = 140
// 最大上传图片数量
const MAX_IMG_NUM = 9
const db = wx.cloud.database()
// 输入的文字内容
let content = ''
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wordsNum: 0,
    footerBottom: 0,
    images: [],
    selectPhoto: true
  },
  //点击分享新鲜事时设置实时显示字数
  onInput(event) {
    // console.log(event.detail.value);
    let wordsNum = event.detail.value.length;
    if (wordsNum >= MAX_WORDS_NUM) {
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = event.detail.value
  },
  //获取焦点时
  onFocus(event) {
    // 模拟器下获取的键盘高度（event.detail.height）为0
    console.log(event)
    this.setData({
      footerBottom: event.detail.height,
    })
  },
  //失去焦点时
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },
  //点击加号选择图片
  onChooseImage() {
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max, //能选多少张图片
      sizeType: ['original', 'compressed'], //选择图片的类型  原始，压缩
      sourceType: ['album', 'camera'], //选择图片的方式 相册，拍照
      success: (res) => {
        // console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        // 还能再选几张图片 如果max为0了就不让选了
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      },
    })
  },
  //点击x删除照片
  onDelImage(event) {
    // console.log(event)
    //在前面自定义了data-index 用event.target.dataset.index可以取到
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    //如果从九张图片删除到8张那么就要让选择图片的界面显示
    if (this.data.images.length == MAX_IMG_NUM - 1) {
      this.setData({
        selectPhoto: true,
      })
    }
  },
  //点击图片时预览图片
  onPreviewImage(event) {
    wx.previewImage({
      urls: this.data.images,
      //在wxml自定义了data-imgsrc用event.target.dataset.imgsrc可以取到
      current: event.target.dataset.imgsrc
    })
  },
  //发布功能
  send() {
    //文字必须要写  .trim() 方法可以去除两边的空格
    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }

    wx.showLoading({
      title: '发布中',
      mask: true,//产生蒙板把底下的内容遮罩住，发布的时候用户就不能在做更改操作了
    })

    // 1、图片 -> 云存储 得到fileID 
    //上传图片  因为wx.cloud.uploadFile每次只能上传一张 所以要循环
    
    let promiseArr = [] //每个promise对象的数组
    let fileIds = [] //每个fildId的数组
    // 图片上传
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise((resolve, reject) => {
        let item = this.data.images[i]
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix,
          filePath: item,
          success: (res) => {
            console.log(res.fileID)
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: (err) => {
            console.error(err)
            reject()
          }
        })
      })
      promiseArr.push(p)
    }

    // 存入到云数据库
    Promise.all(promiseArr).then((res) => {
      db.collection('blog').add ({
        data: {
          ...userInfo,//用户信息
          content,//内容
          img: fileIds,
          createTime: db.serverDate(), // 服务端的时间
        }
      }).then((res) => {
        wx.hideLoading()
        wx.showToast({
          title: '发布成功',
        })
        // 返回blog页面，并且刷新
        wx.navigateBack()
        //在子界面中调用父界面的方法
        const pages = getCurrentPages()
        // console.log(pages)
        // 取到上一个页面
        const prevPage = pages[pages.length - 2]
        //调用去到界面的方法
        prevPage.onPullDownRefresh()
      })
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '发布失败',
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    userInfo = options
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})