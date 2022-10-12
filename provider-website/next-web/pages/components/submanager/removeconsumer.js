import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Coordinator_ABI from "../../utils/Coordinator_ABI.json";
import coordinatorAddress from "../../../config";

const RemoveConsumerModal = (props) => {
  const [txError, setTxError] = useState(null);

  const removeConsumer = async () => {
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
        if (ethers.utils.isAddress(props.consumerAddress)) {
          await coordinator.removeConsumerFromSubscription(
            props.currentSub,
            props.consumerAddress
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
        <h2>Remove Consumer</h2>
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
        <p>Are you sure?</p>
      </div>
      <div className="modal-footer">
        <button
          className="confirm"
          onClick={() => {
            removeConsumer();
          }}
        >
          Confirm
        </button>
        <button
          className="cancel"
          onClick={() => {
            props.close(false);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemoveConsumerModal;
