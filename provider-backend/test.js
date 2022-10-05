const { ethers } = require("ethers");

// const provider = new ethers.providers.WebSocketProvider("wss://eth-rinkeby.alchemyapi.io/v2/oBLz1qWKWT9P5_bW8_e8b771ui46eOlw"/*"ws://localhost:8545"?*/);
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.toronto.sx.technology" /*"ws://localhost:8545"?*/
);

const interface = require("../provider-contract/artifacts/contracts/RandomnessConsumer.sol/RandomnessConsumer.json");
const contractAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";

// rinkeby contract address 0x179A377fCB0ae67610b06c71E46E2d77Cc446272
// contract address 0x5FbDB2315678afecb367f032d93F642f64180aa3

const consumer = new ethers.Contract(contractAddress, interface.abi, provider);

async function main() {
  const balance = await provider.getBalance(
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
  );
  console.log(`balance is ${balance}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const signer = new ethers.Wallet(
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);
let nonce = 0;
let accountNonce = async () => {
  nonce = await signer.getTransactionCount();
  console.log(nonce);
};

accountNonce();
consumer.on(
  "RequestRandomness",
  async function (address, id, randomWords, event) {
    console.log(`Result is ${JSON.stringify(event)}`);
    let requestId = id.toString();
    let randomWordCount = parseInt(randomWords.toString());
    let randoms = [];
    for (var i = 0; i < randomWordCount; i++) {
      randoms.push(ethers.BigNumber.from(ethers.utils.randomBytes(32)));
    }
    await consumer
      .connect(signer)
      .fulfillRandomness(requestId, randoms, { nonce: nonce });
    nonce++;
    console.log(`Request done, new nonce is ${nonce}`);
  }
);

//   console.log("Started Listening")
//   consumer.events.allEvents({},{ fromBlock: 0}, function(error, event){ console.log(event); })
//   .on('data', function(event){
//     console.log(event);
// })
// .on('changed', function(event){
//    console.log('on changed');
// })
// .on('error', console.error);
