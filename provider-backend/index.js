const { ethers } = require("ethers");
require("dotenv").config();

// const provider = new ethers.providers.WebSocketProvider("wss://eth-rinkeby.alchemyapi.io/v2/oBLz1qWKWT9P5_bW8_e8b771ui46eOlw"/*"ws://localhost:8545"?*/);
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.toronto.sx.technology"
);

const interface = require("../provider-contract/artifacts/contracts/RFCoordinator.sol/RandomnessCoordinator.json");
const contractAddress = process.env.CONTRACT_ADDRESS;

// goerli contract address 0x69ff3A6a9b96443D589C33A722437f096eCd26e2

const consumer = new ethers.Contract(contractAddress, interface.abi, provider);

async function main() {
  const balance = await provider.getBalance(contractAddress);
  console.log(`Coordinator balance is ${balance}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

let nonce = 0;
let accountNonce = async () => {
  nonce = await signer.getTransactionCount();
  console.log(nonce);
};

accountNonce();

const randomSignature = async (address, id, hash) => {
  const messageHashBytes = ethers.utils.arrayify(hash);
  const randomSigner = new ethers.Wallet.createRandom();
  let flatSig = await randomSigner.signMessage(messageHashBytes);
  let sig = ethers.utils.splitSignature(flatSig);
  return [randomSigner, sig];
};

consumer.on(
  "RequestRandomness",
  async function (address, id, coordinatorRequestId, randomWords, event) {
    // console.log(`Result is ${JSON.stringify(event)}`);
    // console.log("Waiting for next block, current block is", event.blockNumber);
    await new Promise((r) => setTimeout(r, 4000));
    const nextBlockNo = parseInt(event.blockNumber.toString()) + 1;
    const nextBlock = await provider.getBlock(nextBlockNo);
    // console.log(nextBlock);
    let requestId = id.toString();
    let randomWordCount = parseInt(randomWords.toString());
    let encodePacked = ethers.utils.solidityPack(
      ["address", "uint256", "bytes32"],
      [address, id, nextBlock.hash]
    );
    var hash = ethers.utils.keccak256(encodePacked);
    const sig = await randomSignature(address, requestId, hash);
    await consumer
      .connect(signer)
      .fulfillVerifiableRandomness(
        id,
        randomWords,
        address,
        sig[0].address,
        nextBlockNo,
        sig[1].v,
        sig[1].r,
        sig[1].s,
        {
          nonce: nonce,
        }
      );
    nonce++;
    console.log("Id from consumer is", id);
    console.log(`Request done, new nonce is ${nonce}`);
  }
);
