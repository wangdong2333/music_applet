// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false,
    },
    lyric: String,
  },

  observers: {
    lyric(lrc) {
      //针对无歌词的纯音乐  暂无歌词是父元素定义好了传过来的
      if (lrc == '暂无歌词') {
        this.setData({
          lrcList: [{
            lrc,
            time: 0,
          }],
          nowLyricIndex: -1
        })
      } else {
        this._parseLyric(lrc)
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList:[],
    nowLyricIndex: 0, // 当前选中的歌词的索引
    scrollTop: 0, // 滚动条滚动的高度
  },

  lifetimes: {
    ready() {
      // 所有的手机在小程序里面规定宽度都为750rpx
      // wx.getSystemInfo获取当前手机的一些信息
      wx.getSystemInfo({
        success(res) {
          // console.log(res)
          //res.screenWidth / 750求出1rpx的大小 64是一句歌词的高度（wxss里面写死的）
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //接收从父元素传来的currentTime（update是父元素那边定义的）
    update(currentTime) {
      // console.log(currentTime)
      let lrcList = this.data.lrcList
      if (lrcList.length == 0) {
        return
      }
      if (currentTime > lrcList[lrcList.length - 1].time) {
        if (this.data.nowLyricIndex != -1) {
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      //循环使歌词高亮显示
      for (let i = 0, len = lrcList.length; i < len; i++) {
        if (currentTime <= lrcList[i].time) {
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    },
    // 解析歌词数据
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')//返回一个数组
      // console.log(line)
      let _lrcList = []
      line.forEach((elem) => {
        // console.log(elem)//[00:00.000] 作曲 : 钱雷
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        // console.log(time)//["[00:00.000]"]
        if (time != null) {
          let lrc = elem.split(time)[1]
          // console.log(lrc)// 作曲 : 钱雷
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          // console.log(timeReg)
          // 把时间转换为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds,
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})