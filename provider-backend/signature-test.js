const { ethers } = require("ethers");
require("dotenv").config();

// const provider = new ethers.providers.WebSocketProvider("wss://eth-rinkeby.alchemyapi.io/v2/oBLz1qWKWT9P5_bW8_e8b771ui46eOlw"/*"ws://localhost:8545"?*/);
const provider = new ethers.providers.WebSocketProvider(
  "wss://eth-goerli.g.alchemy.com/v2/ED8Vtw8NaqlCiAMv8IFv_w9-6oFIjNIS"
  /* "https://rpc.toronto.sx.technology" "ws://localhost:8545"?*/
);

const interface = require("../provider-contract/artifacts/contracts/RFCoordinator.sol/RandomnessCoordinator.json");
const contractAddress = "0x3b1BCDA16Ba24F29123C0cA01e4E81FeE0ABC071";

// goerli contract address 0x69ff3A6a9b96443D589C33A722437f096eCd26e2

interface.abi = [
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "fulfillVerifiableRandomness",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
];

const consumer = new ethers.Contract(contractAddress, interface.abi, provider);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const randomSigner = new ethers.Wallet.createRandom();
let nonce = 0;
let accountNonce = async () => {
  nonce = await signer.getTransactionCount();
  console.log(nonce);
};

accountNonce();

const randomSignature = async (hash) => {
  // Sign the string message
  const messageHashBytes = ethers.utils.arrayify(hash);
  let flatSig = await randomSigner.signMessage(messageHashBytes);
  console.log("Random Signer is", randomSigner.address);

  // For Solidity, we need the expanded-format of a signature
  let sig = ethers.utils.splitSignature(flatSig);
  return [messageHashBytes, sig];
};

async function main() {
  var hash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("addressnextBlock.hash")
  );
  console.log(hash);
  var address = "address";
  var requestId = "id";
  var randomWords = "1";
  const sig = await randomSignature(hash);
  console.log(sig);
  console.log(sig[0]);
  console.log(sig[1].v);
  console.log(sig[1].r);
  console.log(sig[1].s);

  console.log(
    await consumer
      .connect(signer)
      .fulfillVerifiableRandomness(sig[0], sig[1].v, sig[1].r, sig[1].s)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
