'use strict';
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://117.102.210.217:9650/ext/bc/21Z7pN9Z6VfmMo8jjhDQYyYJS5MB7MftZSuKrmenhmwADCWWJH/rpc'));
const CronJob = require('cron').CronJob;
const accounts = require("./accounts1.json");
const ABI = require("./ABI/MultiTransfer.json");

const contractAddress = '0x1e60Fa3ed2618D21756C0fB2C1A1abCE1e05e984';
const contract = new web3.eth.Contract(ABI, contractAddress);

const ownerAddress = "0x51c5D59764aF4F39c50980C64130D7224ab2d1c2";
const ownerPrivateKey = "a96783827b917ea239c9d78797bf27e094ee7bdca40f54ad11f194388fa37d24";
const tokens = ["0x84C4Cdfafcc6E7f87896B606a6e737d762cD2240"];

const baseTx = async (account, privateKey, dataTx, value) => {
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

let i = 0;
const length = accounts.length;

const sendWPT = new CronJob('*/1 * * * *', async () => {
  try {
    const amount = 1; 
    const amountInWei = web3.utils.toWei(amount.toString(), "ether");
    const amountToken = 0.1;
    const amountTokenInWei = web3.utils.toWei(amountToken.toString(), "ether");
    const dataTx = contract.methods.distributeSingle(accounts[i], amountInWei, tokens, amountTokenInWei).encodeABI();
    await baseTx(ownerAddress, ownerPrivateKey, dataTx, amount);
    i++;
    if (i == length) i = 0;
  } catch (error) {
    console.log('error', error)
  }
}, null, false, process.env.TIME_ZONE);

module.exports = {
	fetch: () => {
		sendWPT.start();
	}
};

