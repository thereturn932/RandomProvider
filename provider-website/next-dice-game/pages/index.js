import Head from "next/head";
import { useState, useEffect } from "react";

import { ethers } from "ethers";
import axios from "axios";

// Components

import gameABI from "../../../provider-contract/artifacts/contracts/SampleDiceGame.sol/SampleDiceGame.json";

import { BsTwitter, BsGithub } from "react-icons/bs";
import { FaFacebookF, FaTelegramPlane, FaDiscord } from "react-icons/fa";
import dynamic from "next/dynamic";

import RollDice from "./components/dice";
import Die from "./components/dice/Die";
import {
  faDiceOne,
  faDiceTwo,
  faDiceThree,
  faDiceFour,
  faDiceFive,
  faDiceSix,
} from "@fortawesome/free-solid-svg-icons";
import gameAddress from "../config";

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [correctNetwork, setCorrectNetwork] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [loadingState, setLoadingState] = useState(0);
  const [txError, setTxError] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(-1);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [subCount, setSubCount] = useState(0);
  const [createdSub, setCreatedSub] = useState(null);
  const [dieResult, setDieResult] = useState(faDiceOne);
  const [rolling, setRolling] = useState(false);
  const [waitingResult, setWaitingResult] = useState(false);
  const [predictions, setPredictions] = useState(0);
  const [gameId, setGameId] = useState(-1);
  const [gameResult, setGameResult] = useState(-1);

  const [email, setEmail] = useState("Enter Email Address");

  /// CONNECTION MANAGEMENT
  // Checks if wallet is connected
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (ethereum) {
      console.log("Got the ethereum obejct: ", ethereum);
    } else {
      console.log("No Wallet found. Connect Wallet");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      console.log("Found authorized Account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } else {
      console.log("No authorized account found");
    }
  };

  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Metamask not detected");
        return;
      }
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain:" + chainId);

      const goerliChainId = "0x287";

      if (chainId !== goerliChainId) {
        alert("You are not connected to the Goerli Testnet!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Found account", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("Error connecting to metamask", error);
    }
  };

  // Checks if wallet is connected to the correct network
  const checkCorrectNetwork = async () => {
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain:" + chainId);

    const goerliChainId = "0x287";
    const ethereumChainId = "0x1";

    if (chainId !== goerliChainId) {
      setCorrectNetwork(false);
    } else {
      setCorrectNetwork(true);
    }
  };

  const switchOrAddNetwork = async () => {
    const chainId = "0x287"; // 1 ETH Mainnet 5 Goerli
    console.log("Chain is", window.ethereum.networkVersion);
    if (window.ethereum.networkVersion !== chainId) {
      try {
        console.log("here");
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainId }],
        });
        setCorrectNetwork(true);
      } catch (err) {
        console.error;
      }
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkCorrectNetwork();
  }, []);

  useEffect(() => {}, [currentAccount]);

  const playDice = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const game = new ethers.Contract(gameAddress, gameABI.abi, signer);
        console.log(`Prediction is ${predictions}`);
        if (predictions < 1 || predictions > 6) {
          alert("Prediction Should Be Between 1 and 6");
          return;
        }
        const gameTx = await game.playDice([predictions]);
        const result = await gameTx.wait();
        const event = result.events.find(
          (event) => event.event === "RequestRandomness"
        );
        console.log("Event is", event);
        const [address, randomId, dicePredictions] = event.args;
        console.log(address, randomId.toNumber(), dicePredictions);
        setGameId(randomId.toNumber());
        setWaitingResult(true);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      alert(error);
      console.log(error);
      setTxError(error.message);
    }
  };

  if (waitingResult) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const game = new ethers.Contract(gameAddress, gameABI.abi, signer);
    game.on("GameResult", async (randomId, dices, result, event) => {
      if (randomId.toNumber() == gameId) {
        setWaitingResult(false);
        switch (dices[0].toString()) {
          case "1":
            setDieResult(faDiceOne);
            break;
          case "2":
            setDieResult(faDiceTwo);
            break;
          case "3":
            setDieResult(faDiceThree);
            break;
          case "4":
            setDieResult(faDiceFour);
            break;
          case "5":
            setDieResult(faDiceFive);
            break;
          case "6":
            setDieResult(faDiceSix);
            break;
          default:
            console.log("Result", dices[0].toString, "out of bonds");
        }
        setRolling(true);
        setRolling(false);
        if (result) {
          setGameResult(1);
        } else {
          setGameResult(2);
        }
      }
    });
  }

  useEffect(() => {
    if (gameResult === 1) {
      alert("You Win!");
    } else if (gameResult === 2) {
      alert("You Lost!");
    }
  }, [rolling]);

  return (
    <div>
      <Head>
        <title>Gordios VRF</title>
        <meta name="description" content="Provable Randomness" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="header">
        <h1 className="title">WELCOME TO GORDIOS VRF</h1>
        {currentAccount === "" ? (
          <>
            <button className="header-connect" onClick={connectWallet}>
              Connect Wallet
            </button>
          </>
        ) : (
          <>
            <p className="header-connect">
              {currentAccount.slice(0, 6)}....{currentAccount.slice(38)}
            </p>
          </>
        )}
      </div>
      <div className="main">
        {currentAccount === "" ? (
          <div className="connect-page">
            <p>To Continue Please Connect Your Wallet</p>
          </div>
        ) : correctNetwork ? (
          <div className="content-page">
            <div className="game-area">
              <select
                value={predictions}
                onChange={(e, value) => {
                  console.log(e.target.value);
                  setPredictions(e.target.value);
                }}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
              <div className="dice">
                <Die face={dieResult} rolling={rolling} />
              </div>
              <button
                onClick={() => {
                  playDice();
                }}
              >
                Play Dice!
              </button>
            </div>
          </div>
        ) : (
          <button
            className="text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out"
            onClick={switchOrAddNetwork}
          >
            Switch to SX Network
          </button>
        )}
      </div>

      <footer className="footer">
        <p>Copyright &copy; Gordios. All Rights Reserved.</p>
        <div className="social">
          <a className="social-buttons" href="https://facebook.com">
            <FaFacebookF />
          </a>
          <a className="social-buttons" href="https://twitter.com">
            <BsTwitter />
          </a>
          <a className="social-buttons" href="https://github.com">
            <BsGithub />
          </a>
          <a className="social-buttons" href="https://discord.com">
            <FaDiscord />
          </a>
          <a className="social-buttons" href="https://telegram.org">
            <FaTelegramPlane />
          </a>
        </div>
        <div className="contact-div">
          <label>Subscribe to Gordios</label>
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          ></input>
          <button>Subscribe</button>
        </div>
      </footer>
    </div>
  );
}
