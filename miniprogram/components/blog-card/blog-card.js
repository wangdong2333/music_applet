// components/blog-card/blog-card.js
import formatTime from '../../utils/formatTime.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blog:Object
  },
  
  observers: {
    ['blog.createTime'](val) {
      if (val) {
        // console.log(val)
        this.setData({
          _createTime: formatTime(new Date(val))
        })
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    _createTime: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onPreviewImage(event){
      //自定义的imgs和imgsrc
      const ds = event.target.dataset
      wx.previewImage({//wx.previewImage预览图片小程序自带的API
        urls: ds.imgs,
        current: ds.imgsrc,
      })
    } 
  }
})
