
import CryptoJS from 'crypto-js'

const APPID = 'a3e82383'
const API_SECRET = 'Mjg2NzkwZWNhMjkxOThlY2IxYzM5ZTI4'
const API_KEY = 'a006e35376de6480c3691144b4830b3a'


let total_res = "";

function getWebsocketUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
        const apiKey = API_KEY
        const apiSecret = API_SECRET
        let url = 'wss://spark-api.xf-yun.com/v1.1/chat'
        const host = location.host
        // @ts-ignore
        const date = new Date().toGMTString()
        const algorithm = 'hmac-sha256'
        const headers = 'host date request-line'
        const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`
        const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
        const signature = CryptoJS.enc.Base64.stringify(signatureSha)
        const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
        const authorization = btoa(authorizationOrigin)
        url = `${url}?authorization=${authorization}&date=${date}&host=${host}`
        resolve(url)
    })
}

class TTSRecorder {
    appId: string;
    status: string;
    ttsWS: WebSocket;
    playTimeout: number;
    constructor({ appId = APPID } = {}) {
        this.appId = appId
        this.status = 'init'
        this.ttsWS = null
    }

    // 修改状态
    setStatus(status: string) {
        this.onWillStatusChange && this.onWillStatusChange(this.status, status)
        this.status = status
    }

    public onWillStatusChange(newStatus: string, oldStatus: string) {

    }

    // 连接websocket
    connectWebSocket() {
        this.setStatus('ttsing')
        return getWebsocketUrl().then(url => {
            let ttsWS
            if ('WebSocket' in window) {
                ttsWS = new WebSocket(url)
            } else if ('MozWebSocket' in window) {
                // @ts-ignore
                ttsWS = new MozWebSocket(url)
            } else {
                alert('浏览器不支持WebSocket')
                return
            }
            this.ttsWS = ttsWS
            ttsWS.onopen = (e: any) => {
                this.webSocketSend()
            }
            ttsWS.onmessage = (e: { data: any; }) => {
                this.result(e.data)
            }
            ttsWS.onerror = (e: any) => {
                clearTimeout(this.playTimeout)
                this.setStatus('error')
                alert('WebSocket报错，请f12查看详情')
                console.error(`详情查看：${encodeURI(url.replace('wss:', 'https:'))}`)
            }
            ttsWS.onclose = (e: any) => {
                console.log(e)
            }
        })
    }


    // websocket发送数据
    webSocketSend() {
        const params = {
            "header": {
                "app_id": this.appId,
                "uid": "fd3f47e4-d"
            },
            "parameter": {
                "chat": {
                    "domain": "general",
                    "temperature": 0.5,
                    "max_tokens": 1024
                }
            },
            "payload": {
                "message": {
                    "text": [
                        {
                            "role": "user",
                            "content": "中国第一个皇帝是谁？"
                        }
                    ]
                }
            }
        }
        console.log(JSON.stringify(params))
        this.ttsWS.send(JSON.stringify(params))
    }

    start() {
        total_res = ""; // 请空回答历史
        this.connectWebSocket()
    }

    // websocket接收数据的处理
    result(resultData: string) {
        let jsonData = JSON.parse(resultData)
        total_res = total_res + resultData
        console.log(total_res, 'total_res')

        // 提问失败
        if (jsonData.header.code !== 0) {
            alert(`提问失败: ${jsonData.header.code}:${jsonData.header.message}`)
            console.error(`${jsonData.header.code}:${jsonData.header.message}`)
            return
        }
        // 消息结束
        if (jsonData.header.code === 0 && jsonData.header.status === 2) {
            this.ttsWS.close()
            this.setStatus("init")
        }
    }
}

let bigModel = new TTSRecorder({ appId: APPID })
bigModel.onWillStatusChange = function (oldStatus, status) {
    // 可以在这里进行页面中一些交互逻辑处理：按钮交互等
    // 按钮中的文字

    console.log('www')

}

setTimeout(() => {
    bigModel.start()
}, 3000);
