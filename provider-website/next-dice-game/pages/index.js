import Head from "next/head";
import { useState, useEffect } from "react";

import { ethers } from "ethers";
import axios from "axios";

// Components
import Subscription from "./components/subscriptions";
import SubscriptionManager from "./components/submanager";

import Coordinator_ABI from "./utils/Coordinator_ABI.json";

import coordinatorAddress from "../config";

import { BsTwitter, BsGithub } from "react-icons/bs";
import { FaFacebookF, FaTelegramPlane, FaDiscord } from "react-icons/fa";

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

      const goerliChainId = "0x5";

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

    const goerliChainId = "0x5";
    const ethereumChainId = "0x1";

    if (chainId !== goerliChainId) {
      setCorrectNetwork(false);
    } else {
      setCorrectNetwork(true);
    }
  };

  const switchOrAddNetwork = async () => {
    const chainId = "0x5"; // 1 ETH Mainnet 5 Goerli
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
            <div className="sub-creation">
              <div className="creation-control">
                <button onClick={createNewSubscription}>
                  Create New Subscription
                </button>
                <p>You have {subCount} subscriptions</p>
              </div>
              <div className="creation-tx">
                {loadingState === 0 ? (
                  txStatus === 0 ? (
                    txError === null ? (
                      <div>
                        <div>Processing your transaction</div>
                      </div>
                    ) : (
                      <div className="tx-error">{txError}</div>
                    )
                  ) : (
                    <div></div>
                  )
                ) : (
                  <div className="flex flex-col justify-center items-center">
                    <p>Created Subscription {createdSub}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="control-panel">
              {currentSubscription == -1 ? (
                <Subscription
                  subs={userSubscriptions}
                  changeCurrentSub={setCurrentSubscription}
                />
              ) : (
                <SubscriptionManager
                  subs={userSubscriptions}
                  currentSub={currentSubscription}
                  changeCurrentSub={setCurrentSubscription}
                />
              )}
            </div>
          </div>
        ) : (
          <button
            className="text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out"
            onClick={switchOrAddNetwork}
          >
            Switch to Goerli
          </button>
        )}
        <div className="text-xl font-semibold mb-20 mt-4"></div>
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
