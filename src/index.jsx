/* eslint-disable no-unreachable,react/prop-types */
// 音频播放
import React from 'react'
import PropTypes from 'prop-types'
// api

// 引入公共组件
import './index.css'

class Audio extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentTime: 0, // 当前播放时间
      duration: 0, // 音频总时长
      left: 0, //  进度条位置
      playState: false // 播放/暂停
    }
    this.touchendPlay = null // 音频播放定时器
    this.toastTimer = null // toast 定时器
    this.isMouseDown = false // 鼠标是否按下
  }

  componentDidMount () {
    window.removeEventListener('mouseup', this.onMouseUp, false)
    const { url } = this.props
    // 如果没有音频
    if (!url) return
    const userAgentInfo = navigator.userAgent
    const reg = /(phone|pad|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows phone)/i
    const isPc = !userAgentInfo.match(reg)
    if (!isPc) { // 移动端初始化
      this.initListenTouch()
      var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) // ios终端
      // // 兼容ios audio预加载问题
      if (isiOS) {
        this.audioAutoLoad(url)
      }
       // 微信切后台暂停音频
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
        // 页面被挂起,暂停播放
          this.lectureAudio && this.lectureAudio.pause()
        } else {
        // 页面呼出
        }
      })
    } else {
      this.audioProgress.onmousedown = (e) => {
        this.onMouseDown(e)
        window.addEventListener('mousemove', this.onMouseMove, false)
      }
      window.addEventListener('mouseup', this.onMouseUp, false)
    }
  }

  componentWillUnmount () {
    this.lectureAudio && this.lectureAudio.pause()
    this.reomoveListen()
  }

  audioAutoLoad (id) { // 解决微信内部无法加载音频的问题
    var audio = document.getElementById(id)
    if (typeof WeixinJSBridge === 'object') {
      window.WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
        audio.load()
      })
    } else {
      audio.load()
    }
  }

  // 播放出发
  handleTimeUpdate () {
    const width = this.audioProgress.offsetWidth - this.audioPoint.offsetWidth
    this.setState(function (preState, props) {
      const precentleft = (this.lectureAudio.currentTime / this.lectureAudio.duration)
      return {
        currentTime: this.lectureAudio.currentTime,
        left: width * precentleft
      }
    })
  }

  handleAudioCanplay = () => {
    // 获取总时间
    const duration = Math.floor(this.lectureAudio.duration, 0)
    this.setState({ duration })
  }

  // 初始化监听
  initListenTouch () {
    this.audioProgress.addEventListener('touchstart', (e) => {
      this.pointStart(e)
    }, false)
    this.audioProgress.addEventListener('touchmove', (e) => {
      this.pointMove(e)
    }, false)
    this.audioProgress.addEventListener('touchend', (e) => {
      this.pointEnd(e)
    }, false)

    // this.audioProgress.addEventListener('click', (e) => {
    //   this.jump(e)
    // })
  }

  reomoveListen () {
    this.audioProgress.removeEventListener('touchstart', (e) => {
        this.pointStart(e)
    }, false)
    this.audioProgress.removeEventListener('touchmove', (e) => {
        this.pointMove(e)
    }, false)
    this.audioProgress.removeEventListener('touchend', (e) => {
        this.pointEnd(e)
    }, false)

    this.lectureAudio.removeEventListener('pause', this.audioStatusChange, false)
    document.removeEventListener('visibilitychange', () => { })
    this.lectureAudio.removeEventListener('ended', this.audioStatusChange, false)
  }

  // pc端拖动进度条事件
  jump (e) {
    const width = e.target.offsetWidth
    const x = e.offsetX
    const currentTime = x / width * this.state.duration

    this.setState({
      currentTime,
      left: x
    }, () => {
      this.lectureAudio.currentTime = this.state.currentTime
    })
  }

  // 开始滑动
  pointStart (e) {
    e.preventDefault()
    const touch = e.touches ? e.touches[0] : e
    // 开始滑动时移除监听事件，避免改变播放按钮状态
    this.lectureAudio.removeEventListener('pause', this.audioStatusChange)
    this.lectureAudio.pause()
    // 在移动触点的时将音频暂停
    this.setState({
      startX: touch.pageX // 进度触点在页面中的x坐标
    })
  }

  // 滑动时
  pointMove (e) {
    e.preventDefault()
    // 阻止合成事件的冒泡
    e.stopPropagation()
    if (this.state.duration) {
      const touch = e.touches ? e.touches[0] : e
      const x = touch.pageX - this.state.startX // 滑动的距离
      const maxMove = this.audioProgress.clientWidth// 最大的移动距离不可超过进度条宽度
      const offsetWindowLeft = this.audioProgress.getBoundingClientRect().left // 进度条距离视窗左侧的长度
      const moveX = this.lectureAudio.duration / this.audioProgress.clientWidth
      // moveX，它代表着进度条宽度与音频总时长的关系，可以通过获取触点移动的距离从而计算出此时对应的currentTime
      // 正移动、负移动以及两端的极限移动。
      if (x >= 0) {
        // 一拖到底
        if (x + this.state.startX - offsetWindowLeft >= maxMove) {
          this.setState({
            currentTime: this.lectureAudio.duration
            // left: offsetWindowLeft + this.audioProgress.clientWidth
          }, () => {
            // 改变audio真正的播放时间
            this.lectureAudio.currentTime = this.state.currentTime
            this.setState({ playState: false })
          })
          // 正常前进
        } else {
          this.setState({
            currentTime: (x + this.state.startX - offsetWindowLeft) * moveX
          }, () => {
            this.lectureAudio.currentTime = this.state.currentTime
          })
        }
      } else {
        // 反向拖动
        if (-x <= this.state.startX - offsetWindowLeft) {
          // 反向托到底
          this.setState({
            currentTime: (this.state.startX + x - offsetWindowLeft) * moveX
          }, () => {
            this.lectureAudio.currentTime = this.state.currentTime
          })
        } else {
          this.setState({
            currentTime: 0
          }, () => {
            this.lectureAudio.currentTime = this.state.currentTime
          })
        }
      }
    }
  }

  // 滑动停止
  pointEnd (e) {
    e.preventDefault()
    if (this.state.currentTime < this.state.duration) {
      this.touchendPlay = setTimeout(() => {
        if (this.state.playState) {
          this.lectureAudio.play()
          // 结束滑动时添加监听事件
          this.lectureAudio.addEventListener('pause', this.audioStatusChange, false)
        }
        clearTimeout(this.touchendPlay)
      }, 300)
    }
    // 关于300ms的setTimeout，一是为了体验的良好，可以试试不要300ms的延迟，会发现收听体验不好，音频的播放十分仓促。
    // 另外还有一点是，audio的pause与play间隔过短会出现报错，导致audio无法准确的执行相应的动作。
  }

  // pc-鼠标按下
  onMouseDown = (e) => {
    if (!e.pageX) {
      return
    }
    this.isMouseDown = true
    this.pointStart(e)
    this.jump(e)
  }

  // pc-鼠标滑动
  onMouseMove = (e) => {
    if (this.isMouseDown) {
      this.pointMove(e)
    }
  }

  // pc-鼠标松开
  onMouseUp = (e) => {
    this.isMouseDown = false
    this.lectureAudio && this.pointEnd(e)
    // 移除移动监听
    window.removeEventListener('mousemove', this.onMouseMove, false)
  }

  // 渲染秒为分钟
  renderPlayTime (time) {
    var minute = time / 60
    var minutes = parseInt(minute)
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    // 秒
    var second = time % 60
    var seconds = Math.ceil(second)
    if (seconds < 10) {
      seconds = '0' + seconds
    }

    return `${minutes}:${seconds}`
  }

  // 监听音频播放状态时，改变播放按钮状态
  audioStatusChange = () => {
    this.setState({ playState: false })
  }

  // 播放/暂停
  play = (e) => {
    // 结束或者暂停  按钮状态变化
    this.lectureAudio.addEventListener('ended', this.audioStatusChange, false)
    this.lectureAudio.addEventListener('pause', this.audioStatusChange, false)

    // 如果当前是播放状态的，点击后暂停
    if (this.state.playState) {
      this.lectureAudio.pause()
      this.setState({ playState: false })
    } else {
      // 播放当前音频前暂停之前正在播放的全部音频
      const audios = document.getElementsByTagName('audio')
      for (let i = 0, len = audios.length; i < len; i++) {
        audios[i].pause()
      }
      this.setState({ playState: true })
      this.lectureAudio.play()
    }
    // 阻止合成事件的冒泡
    e.stopPropagation()
  }

  render () {
    const { url } = this.props
    // 如果没有音频
    if (!url) return null
    return (
      <div className='container'>
        <audio
          preload="auto"
          src={url}
          id={url}
          // autoPlay
          ref={(audio) => {
            this.lectureAudio = audio
          }}
          style={{ width: '1px', height: '1px', visibility: 'hidden' }}
          onCanPlay={() => this.handleAudioCanplay()}
          onTimeUpdate={() => this.handleTimeUpdate()}
        >
        </audio>
        <div className='audioBox'>
          {/* 播放 */}
          <div className='audioControl' onClick={this.play}>
            {
              this.state.playState
                ? <div className='doubleLine'>
                  <span className='shortLine'></span>
                  <span className='shortLine'></span>
                </div>
                : <div className='triangle'></div>
            }
          </div>
          {/* 进度条 */}
          <div className='audioProgress' ref={(r) => {
            this.audioProgress = r
          }}>
            {/* 进度条横线 */}
            <div className='audioProgressBar'
              ref={(bar) => {
                this.audioProgress = bar
              }}>
              <div
                className='audioProgressGone'
                style={{ width: this.state.left + 'px' }}
              >
              </div>
            </div>
            {/* 小点 */}
            <div className='audioProgressPointArea'
              ref={(point) => {
                this.audioPoint = point
              }}
              style={{ left: this.state.left + 'px' }}
            >
              <div className='audioProgressPoint'>
              </div>
            </div>
          </div>

          {/* 计时器 */}
          <div className='audioTimer'>
            {this.renderPlayTime(this.state.duration - this.state.currentTime)}
          </div>
        </div>
      </div>
    )
  }
}

Audio.propTypes = {
  /**
   * 音频路径
   */
  url: PropTypes.string.isRequired,
}
Audio.defaultProps = {
  url: 'http://img.tukuppt.com/newpreview_music/09/01/77/5c8a0eb3205ae51471.mp3',
}
export default Audio
