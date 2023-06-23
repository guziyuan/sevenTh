# sevenTh
下面是使用 crypto.js 进行签名和验证的示例代码及注释：

import { SHA256 } from 'crypto-js'

// 假设我们有一对公私钥，可以使用 CryptoJS 生成：
const privateKey = CryptoJS.lib.WordArray.random(32) // 32 字节私钥
const publicKey = CryptoJS.SHA256(privateKey).toString() // 通过 SHA-256 生成 32 字节公钥

// 签名示例
const message = 'hello world'
const signature = SHA256(message + privateKey).toString()

// 验证签名示例
const isValid = publicKey === SHA256(message + signature).toString()
