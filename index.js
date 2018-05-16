import React from 'react'
import PropTypes from 'prop-types'
import { View, Dimensions } from 'react-native'

class InViewListener {
  constructor (delay) {
    this._delay = delay
    this.subscribers = new Set([])
    this._listen()
  }

  static create (delay) {
    this.instance = this.instance || new InViewListener(delay)
    return this.instance
  }

  _listen () {
    const window = Dimensions.get('window')
    setTimeout(() => {
      [...this.subscribers].forEach(o => o.check(window))
      this._listen()
    }, this._delay)
  }

  subscribe (subscriber, shouldSubscribe) {
    shouldSubscribe
      ? this.subscribers.add(subscriber)
      : this.subscribers.delete(subscriber)
  }
}

export default class InView extends React.PureComponent {
  componentDidMount () {
    this.listener = InViewListener.create(this.props.delay)
  }

  componentDidUpdate () {
    if (this.props.inFocus === this._inFocus) return
    this._inFocus = this.props.inFocus
    this.listener.subscribe(this, this._inFocus)
  }

  _isVisible (x, y, width, height, window) {
    return (
      y + height > 0 && y + height <= window.height &&
      x + width > 0 && x + width <= window.width
    )
  }

  check (window) {
    this.refs.inview.measureInWindow((x, y, width, height) => {
      const isVisible = this._isVisible(x, y, width, height, window)
      if (this._visible !== isVisible) {
        this._visible = isVisible
        this.props.onChange(isVisible)
      }
    })
  }

  render () {
    return <View ref='inview' {...this.props}>{this.props.children}</View>
  }
}

InView.defaultProps = {
  active: true,
  delay: 200
}
InView.propTypes = {
  delay: PropTypes.number,
  onChange: PropTypes.func.isRequired
}
