import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Coordinator_ABI from "../../utils/Coordinator_ABI.json";
import coordinatorAddress from "../../../config";

const AddFundModal = (props) => {
  const [depositAmount, setDeposit] = useState("Enter Amount");
  const [txError, setTxError] = useState(null);

  const addFund = async () => {
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
        let amount = ethers.utils.parseEther(depositAmount);
        await coordinator.depositToSub(props.currentSub, {
          value: amount,
        });
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
        <h2>Add Fund</h2>
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
        <label className="modal-label">Deposit Amount</label>
        <input
          className="modal-input"
          type="text"
          value={depositAmount}
          onChange={(e) => setDeposit(e.target.value)}
        ></input>
      </div>
      <div className="modal-footer">
        <button
          onClick={() => {
            addFund();
          }}
        >
          Add Fund
        </button>
      </div>
    </div>
  );
};

export default AddFundModal;
