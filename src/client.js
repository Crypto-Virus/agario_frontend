
import { connectionStatus } from './store.js'

export class Client {

  constructor(url) {
    this.socket = null
    this.url = url
    this.msgId = 0
    this.promises = {}
    this.onConnectionRequests = []
    this.handleNotifications = {}
    this.handleBinaryNotifications = {}
  }

  connect() {
    if (!this.connected()) {
      this.socket = new WebSocket(this.url)
      this.socket.binaryType = "arraybuffer"
      this.socket.onopen = this.onopen
      this.socket.onmessage = this.onmessage
      this.socket.close = this.onclose
      this.socket.onerror = this.onerror
    }
  }

  connected() {
    return (this.socket && this.socket.readyState == 1) ? true : false
  }

  onopen = (event) => {
    connectionStatus.set(true)
    console.log('Opened connection to server')
  }

  onclose = (event) => {
    connectionStatus.set(false)
    console.log('Closed connection to server')
    this.reconnect()
  }

  onerror = (event) => {
    connectionStatus.set(false)
    console.log(`Connection errored with server. Error [${event}]`)
    this.reconnect()
  }

  onmessage = (event) => {
    if(event.data instanceof ArrayBuffer) {
      this.binaryReceived(event.data)
    } else {
      // console.log(`Received Message: ${event.data}`)
      this.dateReceived(event.data)
    }
  }

  reconnect() {
    setTimeout(() => {
      this.connect()
    }, 1000)
  }


  getMsgId() {
    this.msgId++
    if (this.msgId > 100000) this.msgId = 0
    return this.msgId
  }

  async remoteCall(method, params = null) {
    if (!this.connected()) {
      throw new Error('Client is not connected!')
    }
    const id = this.getMsgId()
    const message = JSON.stringify({
      jsonrpc: '2.0',
      id: id,
      method: method,
      params: params,
    })
    this.socket.send(message)
    const p = new Promise((resolve, reject) => {
        this.promises[id] = {resolve: resolve, reject: reject}
    })
    let response = await p
    return response
  }

  notify(method, params = null) {
    if (!this.connected()) {
      throw new Error('Client is not connected!')
    }
    const message = JSON.stringify({
      jsonrpc: '2.0',
      method: method,
      params: params,
    })
    this.socket.send(message)
  }

  dateReceived(data) {
    let message
    try {
      message = JSON.parse(data)
    } catch (err) {
      console.error(`Received message is not a valid jsonrpc. Error [${err}]`)
      return
    }
    const id = message['id']
    const result = message['result']
    const error = message['error']
    const method = message['method']
    if (error) {
      console.log(`Received error response. Code [${error.code}], Message [${error.message}]`)
      if (id) {
        const promise = this.promises[id]
        if (promise) {
          delete this.promises[id]
          promise.reject(new Error(error.message))
        }
      }
    }
    if (id) {
      const promise = this.promises[id]
      if (promise) {
        delete this.promises[id]
        promise.resolve(result)
      }
    }
    else if (method) {
      this.notificationReceived(message)
    }
  }

  binaryReceived(data) {
    const view = new DataView(data, 0, 1);
    const nType = view.getUint8(0)
    const method = this.handleBinaryNotifications[nType]
    if (method) {
      const dataView = new DataView(data, 1)
      method(dataView)
    } else {
      console.log(`Binary notification has no handler. Type [${nType}]`)
    }
  }

  notificationReceived(message) {
    const method = this.handleNotifications[message.method]
    if (method) {
      method(message.params)
    } else {
      console.log(`Notification has no handler. Message [${message}]`)
    }
  }

}
