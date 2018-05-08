const SHA256 = require("crypto-js/sha256");
const BigNumber = require('bignumber.js')
const { performance } = require('perf_hooks')

let diffy = new BigNumber('2', 10)

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty) {
      // console.log(diffy.toString(16))
        // console.log(new BigNumber(Array(64 + 1).join('f'), 16).minus(diffy).toString(16))
        while (!new BigNumber(this.hash, 16).isLessThan(new BigNumber(Array(64 + 1).join('f'), 16).minus(diffy))) {
          // console.log(this.hash)
          // console.log(hex2bin(this.hash))
          this.nonce++
          this.hash = this.calculateHash()
        }

        console.log(`新出块 ${this.index}: ${this.hash}`);
    }
}

class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = diffy
    }

    createGenesisBlock() {
        return new Block(0, "01/01/2017", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

let savjeeCoin = new Blockchain();

let startTime, spend, df = 10000, spends = []

for (var i = new BigNumber('0', 10); i.isLessThan(new BigNumber(Array(64 + 1).join('f'), 16)); i = i.plus(1)) {
  // console.log(`Mining block ${i.toString(10)}...`, difficulty.toString(16))
  diffy = new BigNumber(Array(64 + 1).join('f'), 16).times(1 - 1 / df)
  console.log('难度: ', df)
  startTime = performance.now()
  savjeeCoin.addBlock(new Block(i, "20/07/2017", { amount: i.toString(10) }))
  spend = (performance.now() - startTime) / 1000 || 0.001
  spends.push(spend)
  // if (spends.length > 100) spends.shift()
  console.log('花费时间：',  `${spend} 秒`)

  let avg = spends.slice(spends.length - 10).reduce((a, b) => a + b) / 10
  // let avg = spends.reduce((a, b) => a + b) / spends.length
  let targetTime = 1
  let times = targetTime / avg
  if (times > 1.01) {
    times = 1.01
  } else if (times < 0.99) {
    times = 0.99
  }
  df *= times
  console.log('平均花费时间：', `${spends.reduce((a, b) => a + b) / spends.length} 秒`)
  console.log('目标时间：', `${targetTime} 秒`)
  console.log('难度乘以：', times || 1)

  console.log('\r\n')
}
