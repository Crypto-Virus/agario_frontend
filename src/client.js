

export class Client {

  constructor(url) {
    this.socket = null
    this.url = url
    this.msgId = 0
    this.promises = {}
    this.onConnectionRequests = []
    this.handleNotifications = {}
  }

  connect() {
    if (!this.connected()) {
      this.socket = new WebSocket(this.url)
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
    console.log('Opened connection to server')
  }

  onclose = (event) => {
    console.log('Closed connection to server')
    this.reconnect()
  }

  onerror = (event) => {
    console.log(`Connection errored with server. Error [${event}]`)
    this.reconnect()
  }

  onmessage = (event) => {
    // console.log(`Received Message: ${event.data}`)
    this.dateReceived(event.data)
  }

  reconnect() {
    setTimeout(() => {
      this.connect()
    }, 1000)
  }


  getMsgId() {
    msgId++
    if (msgID > 100000) msgID = 0
    return msgID
  }

  async remoteCall(method, params = {}) {
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

  notify(method, params = {}) {
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
          promise.reject(error.message)
        }
      }
    }
    if (id) {
      const promise = this.promises[id]
      if (promise) {
        promise.resolve(result)
      }
    }
    else if (method) {
      this.notificationReceived(message)
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
