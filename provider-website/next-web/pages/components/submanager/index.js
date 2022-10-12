import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Coordinator_ABI from "../../utils/Coordinator_ABI.json";
import coordinatorAddress from "../../../config";
import RemoveConsumerModal from "./removeconsumer";
import AddConsumerModal from "./addconsumer";
import AddFundModal from "./addfund";
import RemoveFundModal from "./removefund";
import DeleteSubscriptionModal from "./deleteSubscription";

const SubscriptionManager = (props) => {
  const [consumerModal, setConsumerModal] = useState("");
  const [consumers, setConsumers] = useState([]);
  const [removed, setRemoved] = useState([]);
  const [consumerAddress, setConsumerAddress] = useState(null);
  const [balance, setBalance] = useState(0);

  let subs = [];
  let isDel = [];
  if (props.subs) {
    if (props.subs.length !== 0) {
      subs = props.subs[0];
      isDel = props.subs[1];
    }
  }

  useEffect(() => {
    const getConsumers = async () => {
      try {
        const { ethereum } = window;
        console.log("Running????");
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const coordinator = new ethers.Contract(
            coordinatorAddress,
            Coordinator_ABI.abi,
            signer
          );
          const cons = await coordinator.getConsumersOfSubscription(
            props.currentSub
          );
          const { 0: consumers, 1: isRem } = cons;
          console.log("Consumers are ", consumers);
          console.log("IsRemoved are", isRem);
          setConsumers(consumers);
          setRemoved(isRem);
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        alert(error);
        console.log(error);
        setTxError(error.message);
      }
    };

    const getBalance = async () => {
      try {
        const { ethereum } = window;
        console.log("Running????");
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const coordinator = new ethers.Contract(
            coordinatorAddress,
            Coordinator_ABI.abi,
            signer
          );
          const bal = await coordinator.getBalanceOfSub(props.currentSub);
          console.log(`Balance of ${props.currentSub} is ${bal}`);
          setBalance(ethers.utils.formatEther(bal));
        } else {
          console.log("Ethereum object doesn't exist!");
        }
      } catch (error) {
        alert(error);
        console.log(error);
        setTxError(error.message);
      }
    };
    getConsumers();
    getBalance();
  }, []);

  return (
    <>
      <div className="sub-manager">
        <div className="sub-top">
          <div className="dropdown">
            {console.log("Current sub is", props.currentSub)}

            <button>Subscription {props.currentSub}</button>
            <div className="dropdown-content">
              {subs.map((sub) => {
                return sub !== props.currentSub ? (
                  <button
                    key={sub}
                    onClick={() => {
                      props.changeCurrentSub(sub.toNumber());
                    }}
                  >
                    Subscription {sub.toNumber()}
                  </button>
                ) : (
                  <></>
                );
              })}
            </div>
          </div>
          <p>Subscription Balance: {balance}</p>
          <div className="management-buttons">
            <button
              key={"add-sub"}
              onClick={() => {
                setConsumerModal("addSub");
              }}
            >
              Add Consumer
            </button>
            <button
              key={"add-fund"}
              onClick={() => {
                setConsumerModal("addFund");
              }}
            >
              Deposit Fund
            </button>
            <button
              key={"remove-fund"}
              onClick={() => {
                setConsumerModal("removeFund");
              }}
            >
              Withdraw Fund
            </button>
            <button
              key={"delete-sub"}
              onClick={() => {
                setConsumerModal("deleteSub");
              }}
            >
              Delete Subscription
            </button>
            <button
              key={"go-back"}
              onClick={() => {
                props.changeCurrentSub(-1);
              }}
            >
              Go Back to Subscriptions
            </button>
          </div>
        </div>
        <div className="list-div">
          <ul className="list">
            {consumers !== [] ? (
              consumers.map((consumer, index) => (
                <>
                  {console.log("Current consumer is", consumer)}
                  <li className="list-item" key={consumer}>
                    <p>
                      {consumer.slice(0, 6)}....{consumer.slice(38)}
                    </p>
                    {removed[index] ? (
                      <button
                        className="disabled"
                        key={`btn-${consumer}`}
                        onClick={() => {
                          setConsumerModal("removeSub");
                          setConsumerAddress(consumer);
                        }}
                        disabled
                      >
                        Removed
                      </button>
                    ) : (
                      <button
                        key={`btn-${consumer}`}
                        onClick={() => {
                          setConsumerModal("removeSub");
                          setConsumerAddress(consumer);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                </>
              ))
            ) : (
              <></>
            )}
          </ul>
        </div>
        <div>
          {consumerModal === "addSub" ? (
            <AddConsumerModal
              close={setConsumerModal}
              currentSub={props.currentSub}
            />
          ) : consumerModal === "removeSub" ? (
            <RemoveConsumerModal
              close={setConsumerModal}
              currentSub={props.currentSub}
              consumerAddress={consumerAddress}
            />
          ) : consumerModal === "addFund" ? (
            <AddFundModal
              close={setConsumerModal}
              currentSub={props.currentSub}
              consumerAddress={consumerAddress}
            />
          ) : consumerModal === "removeFund" ? (
            <RemoveFundModal
              close={setConsumerModal}
              currentSub={props.currentSub}
              consumerAddress={consumerAddress}
            />
          ) : consumerModal === "deleteSub" ? (
            <DeleteSubscriptionModal
              close={setConsumerModal}
              currentSub={props.currentSub}
              consumerAddress={consumerAddress}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default SubscriptionManager;
