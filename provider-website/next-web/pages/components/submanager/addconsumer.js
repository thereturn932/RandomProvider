import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Coordinator_ABI from "../../utils/Coordinator_ABI.json";
import coordinatorAddress from "../../../../../config";

const AddConsumerModal = (props) => {
  const [consumerAddress, setConsumerAddress] = useState("0xabcd....1234");
  const [txError, setTxError] = useState(null);

  const addConsumer = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coordinator = new ethers.Contract(
          coordinatorAddress,
          Coordinator_ABI.abi,
          signer
        );
        if (ethers.utils.isAddress(consumerAddress)) {
          await coordinator.addConsumerToSubscription(
            props.currentSub,
            consumerAddress
          );
        } else {
          throw new Error("Entered value is not an address");
        }
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      alert(error);
      console.log(error);
      setTxError(error.message);
    }
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2>Add Consumer</h2>
        <span
          className="close"
          onClick={() => {
            props.close("");
          }}
        >
          &times;
        </span>
      </div>
      <div className="modal-body">
        <label className="modal-label">Consumer Address</label>
        <input
          className="modal-input"
          type="text"
          value={consumerAddress}
          onChange={(e) => setConsumerAddress(e.target.value)}
        ></input>
      </div>
      <div className="modal-footer">
        <button
          onClick={() => {
            addConsumer();
          }}
        >
          Add Consumer
        </button>
      </div>
    </div>
  );
};

export default AddConsumerModal;
