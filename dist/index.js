'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

require('./index.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint-disable no-unreachable,react/prop-types */
// 音频播放

// api

// 引入公共组件


var Audio = function (_React$Component) {
  _inherits(Audio, _React$Component);

  function Audio(props) {
    _classCallCheck(this, Audio);

    var _this = _possibleConstructorReturn(this, (Audio.__proto__ || Object.getPrototypeOf(Audio)).call(this, props));

    _this.handleAudioCanplay = function () {
      // 获取总时间
      var duration = Math.floor(_this.lectureAudio.duration, 0);
      _this.setState({ duration: duration });
    };

    _this.onMouseDown = function (e) {
      if (!e.pageX) {
        return;
      }
      _this.isMouseDown = true;
      _this.pointStart(e);
      _this.jump(e);
    };

    _this.onMouseMove = function (e) {
      if (_this.isMouseDown) {
        _this.pointMove(e);
      }
    };

    _this.onMouseUp = function (e) {
      _this.isMouseDown = false;
      _this.lectureAudio && _this.pointEnd(e);
      // 移除移动监听
      window.removeEventListener('mousemove', _this.onMouseMove, false);
    };

    _this.audioStatusChange = function () {
      _this.setState({ playState: false });
    };

    _this.play = function (e) {
      // 结束或者暂停  按钮状态变化
      _this.lectureAudio.addEventListener('ended', _this.audioStatusChange, false);
      _this.lectureAudio.addEventListener('pause', _this.audioStatusChange, false);

      // 如果当前是播放状态的，点击后暂停
      if (_this.state.playState) {
        _this.lectureAudio.pause();
        _this.setState({ playState: false });
      } else {
        // 播放当前音频前暂停之前正在播放的全部音频
        var audios = document.getElementsByTagName('audio');
        for (var i = 0, len = audios.length; i < len; i++) {
          audios[i].pause();
        }
        _this.setState({ playState: true });
        _this.lectureAudio.play();
      }
      // 阻止合成事件的冒泡
      e.stopPropagation();
    };

    _this.state = {
      currentTime: 0, // 当前播放时间
      duration: 0, // 音频总时长
      left: 0, //  进度条位置
      playState: false // 播放/暂停
    };
    _this.touchendPlay = null; // 音频播放定时器
    _this.toastTimer = null; // toast 定时器
    _this.isMouseDown = false; // 鼠标是否按下
    return _this;
  }

  _createClass(Audio, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      window.removeEventListener('mouseup', this.onMouseUp, false);
      var url = this.props.url;
      // 如果没有音频

      if (!url) return;
      var userAgentInfo = navigator.userAgent;
      var reg = /(phone|pad|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows phone)/i;
      var isPc = !userAgentInfo.match(reg);
      if (!isPc) {
        // 移动端初始化
        this.initListenTouch();
        var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // ios终端
        // // 兼容ios audio预加载问题
        if (isiOS) {
          this.audioAutoLoad(url);
        }
        // 微信切后台暂停音频
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            // 页面被挂起,暂停播放
            _this2.lectureAudio && _this2.lectureAudio.pause();
          } else {
            // 页面呼出
          }
        });
      } else {
        this.audioProgress.onmousedown = function (e) {
          _this2.onMouseDown(e);
          window.addEventListener('mousemove', _this2.onMouseMove, false);
        };
        window.addEventListener('mouseup', this.onMouseUp, false);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.lectureAudio && this.lectureAudio.pause();
      this.reomoveListen();
    }
  }, {
    key: 'audioAutoLoad',
    value: function audioAutoLoad(id) {
      // 解决微信内部无法加载音频的问题
      var audio = document.getElementById(id);
      if ((typeof WeixinJSBridge === 'undefined' ? 'undefined' : _typeof(WeixinJSBridge)) === 'object') {
        window.WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
          audio.load();
        });
      } else {
        audio.load();
      }
    }

    // 播放出发

  }, {
    key: 'handleTimeUpdate',
    value: function handleTimeUpdate() {
      var width = this.audioProgress.offsetWidth - this.audioPoint.offsetWidth;
      this.setState(function (preState, props) {
        var precentleft = this.lectureAudio.currentTime / this.lectureAudio.duration;
        return {
          currentTime: this.lectureAudio.currentTime,
          left: width * precentleft
        };
      });
    }
  }, {
    key: 'initListenTouch',


    // 初始化监听
    value: function initListenTouch() {
      var _this3 = this;

      this.audioProgress.addEventListener('touchstart', function (e) {
        _this3.pointStart(e);
      }, false);
      this.audioProgress.addEventListener('touchmove', function (e) {
        _this3.pointMove(e);
      }, false);
      this.audioProgress.addEventListener('touchend', function (e) {
        _this3.pointEnd(e);
      }, false);

      // this.audioProgress.addEventListener('click', (e) => {
      //   this.jump(e)
      // })
    }
  }, {
    key: 'reomoveListen',
    value: function reomoveListen() {
      var _this4 = this;

      this.audioProgress.removeEventListener('touchstart', function (e) {
        _this4.pointStart(e);
      }, false);
      this.audioProgress.removeEventListener('touchmove', function (e) {
        _this4.pointMove(e);
      }, false);
      this.audioProgress.removeEventListener('touchend', function (e) {
        _this4.pointEnd(e);
      }, false);

      this.lectureAudio.removeEventListener('pause', this.audioStatusChange, false);
      document.removeEventListener('visibilitychange', function () {});
      this.lectureAudio.removeEventListener('ended', this.audioStatusChange, false);
    }

    // pc端拖动进度条事件

  }, {
    key: 'jump',
    value: function jump(e) {
      var _this5 = this;

      var width = e.target.offsetWidth;
      var x = e.offsetX;
      var currentTime = x / width * this.state.duration;

      this.setState({
        currentTime: currentTime,
        left: x
      }, function () {
        _this5.lectureAudio.currentTime = _this5.state.currentTime;
      });
    }

    // 开始滑动

  }, {
    key: 'pointStart',
    value: function pointStart(e) {
      e.preventDefault();
      var touch = e.touches ? e.touches[0] : e;
      // 开始滑动时移除监听事件，避免改变播放按钮状态
      this.lectureAudio.removeEventListener('pause', this.audioStatusChange);
      this.lectureAudio.pause();
      // 在移动触点的时将音频暂停
      this.setState({
        startX: touch.pageX // 进度触点在页面中的x坐标
      });
    }

    // 滑动时

  }, {
    key: 'pointMove',
    value: function pointMove(e) {
      var _this6 = this;

      e.preventDefault();
      // 阻止合成事件的冒泡
      e.stopPropagation();
      if (this.state.duration) {
        var touch = e.touches ? e.touches[0] : e;
        var x = touch.pageX - this.state.startX; // 滑动的距离
        var maxMove = this.audioProgress.clientWidth; // 最大的移动距离不可超过进度条宽度
        var offsetWindowLeft = this.audioProgress.getBoundingClientRect().left; // 进度条距离视窗左侧的长度
        var moveX = this.lectureAudio.duration / this.audioProgress.clientWidth;
        // moveX，它代表着进度条宽度与音频总时长的关系，可以通过获取触点移动的距离从而计算出此时对应的currentTime
        // 正移动、负移动以及两端的极限移动。
        if (x >= 0) {
          // 一拖到底
          if (x + this.state.startX - offsetWindowLeft >= maxMove) {
            this.setState({
              currentTime: this.lectureAudio.duration
              // left: offsetWindowLeft + this.audioProgress.clientWidth
            }, function () {
              // 改变audio真正的播放时间
              _this6.lectureAudio.currentTime = _this6.state.currentTime;
              _this6.setState({ playState: false });
            });
            // 正常前进
          } else {
            this.setState({
              currentTime: (x + this.state.startX - offsetWindowLeft) * moveX
            }, function () {
              _this6.lectureAudio.currentTime = _this6.state.currentTime;
            });
          }
        } else {
          // 反向拖动
          if (-x <= this.state.startX - offsetWindowLeft) {
            // 反向托到底
            this.setState({
              currentTime: (this.state.startX + x - offsetWindowLeft) * moveX
            }, function () {
              _this6.lectureAudio.currentTime = _this6.state.currentTime;
            });
          } else {
            this.setState({
              currentTime: 0
            }, function () {
              _this6.lectureAudio.currentTime = _this6.state.currentTime;
            });
          }
        }
      }
    }

    // 滑动停止

  }, {
    key: 'pointEnd',
    value: function pointEnd(e) {
      var _this7 = this;

      e.preventDefault();
      if (this.state.currentTime < this.state.duration) {
        this.touchendPlay = setTimeout(function () {
          if (_this7.state.playState) {
            _this7.lectureAudio.play();
            // 结束滑动时添加监听事件
            _this7.lectureAudio.addEventListener('pause', _this7.audioStatusChange, false);
          }
          clearTimeout(_this7.touchendPlay);
        }, 300);
      }
      // 关于300ms的setTimeout，一是为了体验的良好，可以试试不要300ms的延迟，会发现收听体验不好，音频的播放十分仓促。
      // 另外还有一点是，audio的pause与play间隔过短会出现报错，导致audio无法准确的执行相应的动作。
    }

    // pc-鼠标按下


    // pc-鼠标滑动


    // pc-鼠标松开

  }, {
    key: 'renderPlayTime',


    // 渲染秒为分钟
    value: function renderPlayTime(time) {
      var minute = time / 60;
      var minutes = parseInt(minute);
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      // 秒
      var second = time % 60;
      var seconds = Math.ceil(second);
      if (seconds < 10) {
        seconds = '0' + seconds;
      }

      return minutes + ':' + seconds;
    }

    // 监听音频播放状态时，改变播放按钮状态


    // 播放/暂停

  }, {
    key: 'render',
    value: function render() {
      var _this8 = this;

      var url = this.props.url;
      // 如果没有音频

      if (!url) return null;
      return _react2.default.createElement(
        'div',
        { className: 'container' },
        _react2.default.createElement('audio', {
          preload: 'auto',
          src: url,
          id: url
          // autoPlay
          , ref: function ref(audio) {
            _this8.lectureAudio = audio;
          },
          style: { width: '1px', height: '1px', visibility: 'hidden' },
          onCanPlay: function onCanPlay() {
            return _this8.handleAudioCanplay();
          },
          onTimeUpdate: function onTimeUpdate() {
            return _this8.handleTimeUpdate();
          }
        }),
        _react2.default.createElement(
          'div',
          { className: 'audioBox' },
          _react2.default.createElement(
            'div',
            { className: 'audioControl', onClick: this.play },
            this.state.playState ? _react2.default.createElement(
              'div',
              { className: 'doubleLine' },
              _react2.default.createElement('span', { className: 'shortLine' }),
              _react2.default.createElement('span', { className: 'shortLine' })
            ) : _react2.default.createElement('div', { className: 'triangle' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'audioProgress', ref: function ref(r) {
                _this8.audioProgress = r;
              } },
            _react2.default.createElement(
              'div',
              { className: 'audioProgressBar',
                ref: function ref(bar) {
                  _this8.audioProgress = bar;
                } },
              _react2.default.createElement('div', {
                className: 'audioProgressGone',
                style: { width: this.state.left + 'px' }
              })
            ),
            _react2.default.createElement(
              'div',
              { className: 'audioProgressPointArea',
                ref: function ref(point) {
                  _this8.audioPoint = point;
                },
                style: { left: this.state.left + 'px' }
              },
              _react2.default.createElement('div', { className: 'audioProgressPoint' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'audioTimer' },
            this.renderPlayTime(this.state.duration - this.state.currentTime)
          )
        )
      );
    }
  }]);

  return Audio;
}(_react2.default.Component);

Audio.propTypes = {
  /**
   * 音频路径
   */
  url: _propTypes2.default.string.isRequired
};
Audio.defaultProps = {
  url: 'http://img.tukuppt.com/newpreview_music/09/01/77/5c8a0eb3205ae51471.mp3'
};
exports.default = Audio;