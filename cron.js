'use strict';
const Web3 = require('web3');
const web3M = new Web3(new Web3.providers.HttpProvider('https://rpc.metheus.network/ext/bc/21Z7pN9Z6VfmMo8jjhDQYyYJS5MB7MftZSuKrmenhmwADCWWJH/rpc'));
const web3T = new Web3(new Web3.providers.HttpProvider('https://rpc-testnet.metheus.network/ext/bc/2g4jDuqDRtsCc5beAdvW8oP4URv4Cr4qVewRqDjvAzAihXyiQm/rpc'));
const CronJob = require('cron').CronJob;
const accounts = require("./accounts.json");
const accounts1 = require("./accounts1.json");
const ABI = require("./ABI/MultiTransfer.json");

const contractAddressMainnet = '0x1e60Fa3ed2618D21756C0fB2C1A1abCE1e05e984';
const contractAddressTestnet = '0x84C4Cdfafcc6E7f87896B606a6e737d762cD2240';
const contract = new web3M.eth.Contract(ABI, contractAddressMainnet);

const tokensMainnet = ["0x84C4Cdfafcc6E7f87896B606a6e737d762cD2240"];
const tokensTestnet = ["0xF7B4F33c81E514F90EA8e1C9f6c3e47BbB8235CF"];

const baseTx = async (account, privateKey, web3, contractAddress, dataTx, value) => {
  try {
    const nonce = await web3.eth.getTransactionCount(account);
    const gasPrice = await web3.eth.getGasPrice();

    const rawTransaction = {
      type: 2,
      nonce: web3.utils.toHex(nonce),
      from: account,
      to: contractAddress,
      data: dataTx,
      gasPrice: web3.utils.toHex(gasPrice),
      maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toWei('13'.toString(), "gwei")),
      maxFeePerGas: web3.utils.toHex(web3.utils.toWei('100'.toString(), "gwei"))
    };

    if (value) {
      rawTransaction.value = web3.utils.toHex(web3.utils.toWei(value.toString(), "ether"));
    }

    const gasLimit = await web3.eth.estimateGas(rawTransaction);
    const gasLimitHex = web3.utils.toHex(gasLimit);
    rawTransaction.gasLimit = gasLimitHex;

    const signedTransaction = await web3.eth.accounts.signTransaction(rawTransaction, privateKey);

    return web3.eth
      .sendSignedTransaction(signedTransaction.rawTransaction)
      .on("receipt", ({ transactionHash }) => {
        console.log(`${process.env.EXPLORER_BSC}/tx/${transactionHash}`);
      })
      .catch((err) => {
        console.log("error1", err);
      });
  } catch (err) {
    console.log("error2", err);
  }
};

const length = accounts1.length;

const sendWPT2 = async () => {
  try {
    let ps  = [];
    for (let j = 0; j < length; j++) {
      let amount = Math.random(); 
      ps.push(baseTx(accounts1[j].address, accounts1[j].privateKey, web3M, accounts1[length - 1 - j].address, '', amount));
      // if (amount > 0.5) {
        
      // } else {
      //   const amountInWei = web3M.utils.toWei(amount.toString(), "ether");
      //   const amountTokenInWei = web3M.utils.toWei(amount.toString(), "ether");
      //   const dataTxMainnet = contract.methods.distributeSingle(accounts1[length - 1 - j].address, amountInWei, tokensMainnet, amountTokenInWei).encodeABI();
      //   ps.push(baseTx(accounts[j].address, accounts[j].privateKey, web3M, contractAddressMainnet, dataTxMainnet, amount));
      // }
      if ((j + 1) % 5 === 0) {
        await Promise.all(ps);
        ps = [];
      }
      if (j === length - 1) j = -1;
    }
  } catch (error) {
    console.log('error', error)
  }
};

// const sendWPT = new CronJob('*/3 * * * * *', async () => {
//   try {
//     const amount = 1; 
//     const amountInWei = web3M.utils.toWei(amount.toString(), "ether");
//     const amountToken = 0.1;
//     const amountTokenInWei = web3M.utils.toWei(amountToken.toString(), "ether");
//     const dataTxMainnet = contract.methods.distributeSingle([accounts1[i].address], amountInWei, tokensMainnet, amountTokenInWei).encodeABI();
//     const dataTxTestnet = contract.methods.distributeSingle([accounts1[i].address], amountInWei, tokensTestnet, amountTokenInWei).encodeABI();
//     let ps  = [];
//     for (let j = 0; j < accounts.length; j++) {
//       if (j % 2 === 0) {
//         console.log('chan', j)
//         ps.push(baseTx(accounts[j].address, accounts[j].privateKey, web3M, contractAddressMainnet, dataTxMainnet, amount));
//         ps.push(baseTx(accounts[j].address, accounts[j].privateKey, web3T, contractAddressTestnet, dataTxTestnet, amount));
//       } else {
//         console.log('le', j)
//         ps.push(baseTx(accounts[j].address, accounts[j].privateKey, web3M, accounts1[i].address, '', amount));
//         ps.push(baseTx(accounts[j].address, accounts[j].privateKey, web3T, accounts1[i].address, '', amount));
//       }
//       await Promise.all(ps);
//     }
//     ps = [];
//     i++;
//     if (i == length) i = 0;
//   } catch (error) {
//     console.log('error', error)
//   }
// }, null, false, process.env.TIME_ZONE);

module.exports = {
	fetch: () => {
		// sendWPT.start();
    sendWPT2();
	}
};

