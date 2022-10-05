const Web3 = require('web3');



let web3 = new Web3("wss://eth-rinkeby.alchemyapi.io/v2/oBLz1qWKWT9P5_bW8_e8b771ui46eOlw");

const interface = require("../provider-contract/artifacts/contracts/RandomnessConsumer.sol/RandomnessConsumer.json");
const deployedAddress = "0x610178da211fef7d417bc0e6fed39f05609ad788";

// contract address 0x5FbDB2315678afecb367f032d93F642f64180aa3

const consumer = new web3.eth.Contract(interface.abi,deployedAddress);

const priv_key = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const account = web3.eth.accounts.privateKeyToAccount(priv_key);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

  console.log("Sending Request")

 consumer.methods.requestRandomValue().send({from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', gasLimit : 300000})
.then(function(receipt){ console.log(receipt)
    // receipt can also be a new contract instance, when coming from a "contract.deploy({...}).send()"
});
console.log("Request Sent")
