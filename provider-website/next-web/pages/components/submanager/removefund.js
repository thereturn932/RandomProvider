import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Coordinator_ABI from "../../utils/Coordinator_ABI.json";
import coordinatorAddress from "../../../../../config";

const RemoveFundModal = (props) => {
  const [amount, setAmount] = useState("Enter Amount");
  const [txError, setTxError] = useState(null);

  const removeFund = async () => {
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

        let withdrawAmount = ethers.utils.parseEther(amount);
        await coordinator.withdrawFromSub(props.currentSub, withdrawAmount);
        // if (typeof depositAmount == "number") {

        // } else {
        //   throw new Error("Entered value is number");
        // }
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
        <h2>Withdraw Fund</h2>
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
        <label className="modal-label">Withdrawal Amount</label>
        <input
          className="modal-input"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        ></input>
      </div>
      <div className="modal-footer">
        <button
          onClick={() => {
            removeFund();
          }}
        >
          Remove Fund
        </button>
      </div>
    </div>
  );
};

export default RemoveFundModal;
