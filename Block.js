import sha256 from ‘crypto-js/sha256.js’

export const DIFFICULTY = 2

class Block {
// 1. 完成构造函数及其参数
constructor(transactions, previousHash, timestamp = Date.now()) {
this.timestamp = timestamp;
this.transactions = transactions;
this.previousHash = previousHash;
this.nonce = 0;
this.hash = this._setHash();
}

isValid() {
return this.hash.startsWith(‘0’.repeat(DIFFICULTY));
}
function getParentBlockUnspentTxOuts(parentBlockHash) {
  const parentBlock = Blockchain.getBlock(parentBlockHash);
  let consumedTxOuts = [];
  let unspentTxOuts = [];

  // 遍历父区块中所有的交易
  for (const tx of parentBlock.transactions) {
    // 获取到本次交易的已消费的 UTXO 并加入已消费的 UTXO 集合中
    for (const txIn of tx.txIns) {
      consumedTxOuts.push(txIn);
    }

    // 获取到本次交易的新产生的 UTXO 并加入未消费的 UTXO 集合中
    for (let i = 0; i < tx.txOuts.length; i++) {
      const txOut = tx.txOuts[i];
      if (!consumedTxOuts.find(txIn => txIn.txOutId === tx.id && txIn.txOutIndex === i)) {
        unspentTxOuts.push(new UnspentTxOut(tx.id, i, txOut.address, txOut.amount));
      }
    }
  }
  return unspentTxOuts;
}

setNonce(nonce) {
this.nonce = nonce;
this.hash = this._setHash();
}

// 根据交易变化更新区块 hash
_setHash() {
const data = this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce;
return sha256(data).toString();
}

// 汇总计算交易的 Hash 值
/**

默克尔树实现
*/
combinedTransactionsHash() {
const hashes = this.transactions.map(transaction => transaction.hash);
while (hashes.length > 1) {
const level = [];
for (let i = 0; i < hashes.length; i += 2) {
const left = hashes[i];
const right = i + 1 === hashes.length ? left : hashes[i + 1];
level.push(sha256(left + right).toString());
}
hashes.splice(0, hashes.length, …level);
}
return hashes[0];
}
// 添加交易到区块
/**
*

需包含 UTXOPool 的更新与 hash 的更新
*/
addTransaction(transaction, utxoPool) {
if (!utxoPool.isValidTransaction(transaction)) {
return false;
}
const isValid = transaction.inputs.every(input => {
  const utxo = utxoPool.utxos[input.id];
  return utxo && utxo.publicKey === input.publicKey;
});

if (!isValid) {
  return false;
}

const index = this.transactions.length;
this.transactions.push(transaction);

for (let input of transaction.inputs) {
  delete utxoPool.utxos[input.id];
}

for (let i = 0; i < transaction.outputs.length; i++) {
  const output =
transaction.outputs[i];
const utxo = {
id: transaction.id,
index: i,
publicKey: output.publicKey,
amount: output.amount,
};
utxoPool.addUTXO(utxo);
}

this.hash = this._setHash();
return true;
}
}

export default Block;