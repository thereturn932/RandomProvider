const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deplotContracts() {
    const [owner, oracleAccount, randomnessRequester] = await ethers.getSigners();

    const Coordinator = await ethers.getContractFactory("RandomnessCoordinator");
    const coordinator = await Coordinator.deploy(oracleAccount.address);

    const Consumer = await ethers.getContractFactory("RandomnessConsumer");
    const consumer = await Consumer.deploy(coordinator.address);

    return { coordinator,consumer, owner, oracleAccount, randomnessRequester };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { coordinator,consumer, owner, oracleAccount, randomnessRequester } = await loadFixture(deplotContracts);
      console.log("Creating Sub");
      const subId = await coordinator.createSubscription({value: ethers.utils.parseEther("1")});
      console.log("Created Sub");
      console.log("Adding Consumer");
      console.log("SubId is", 1)
      await coordinator.addContractToSub(1,consumer.address);
      console.log("Added Consumer");
      console.log("Requesting Random");

      const {address,id,randomWords} =await consumer.requestRandomValue(3);
      console.log("Requested Random");
      console.log("Fulfilling Random");
      let oldSubBalance = await coordinator.getBalanceOfSub(1);
      let oldOwnerBalance = await ethers.provider.getBalance(owner.address);
      await coordinator.connect(oracleAccount).fulfillRandomness(0,[1,2,3],consumer.address, {gasLimit: 1000000});
      let newOwnerBalance = await ethers.provider.getBalance(owner.address);
      let newSubBalance = await coordinator.getBalanceOfSub(1);
      console.log("Owner earned", (newOwnerBalance.sub(oldOwnerBalance)))
      console.log("Sub spent", (oldSubBalance.sub(newSubBalance)))
      console.log("Fulfilled Random");
      console.log(await consumer.readRandomValues(0));
      const output = [ethers.BigNumber.from(1),ethers.BigNumber.from(2),ethers.BigNumber.from(3)];
      console.log(output)
      expect(await consumer.readRandomValues(0)).to.equal(output);
    });
  });


});
