// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRandomnessConsumer {
    function fulfillRandomness(uint _randomId, uint[] calldata _randomValue)
        external;
}

contract RandomnessCoordinator is Ownable {
    uint private latestSub;
    mapping(address => uint) public subIdOfContract;
    mapping(uint => address) public ownerOfSub;
    mapping(address => uint[]) public subsOfOwner;
    mapping(uint => uint) public balanceOfSub;
    uint public premium = 0.1 ether;
    mapping(uint => bool) public isDeleted;
    mapping(address => mapping(uint => bool)) public isRemoved; // consumer address => subId => isRemoved
    mapping(uint => address[]) public consumersOfSub;

    address public oracleAddress;

    event RequestRandomness(address, uint, uint);

    constructor(address _oracleAddress) {
        oracleAddress = _oracleAddress;
    }

    function createSubscription() external payable returns (uint) {
        latestSub++;
        ownerOfSub[latestSub] = msg.sender;

        subsOfOwner[msg.sender].push(latestSub);
        balanceOfSub[latestSub] += msg.value;
        return latestSub;
    }

    function deleteSubscription(uint subId) external {
        require(
            msg.sender == ownerOfSub[subId],
            "You are not the owner of subscription"
        );
        ownerOfSub[subId] = address(0x0);
        uint amount = balanceOfSub[subId];
        balanceOfSub[subId] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
        isDeleted[subId] = true;
    }

    function setOracleAddress(address _oracleAddress) external onlyOwner {
        oracleAddress = _oracleAddress;
    }

    function addConsumerToSubscription(uint subId, address contractAddress)
        external
    {
        require(
            msg.sender == ownerOfSub[subId],
            "You are not the owner of subscription"
        );
        subIdOfContract[contractAddress] = subId;
        consumersOfSub[subId].push(contractAddress);
    }

    function removeConsumerFromSubscription(uint subId, address contractAddress)
        external
    {
        require(
            msg.sender == ownerOfSub[subId],
            "You are not the owner of subscription"
        );
        subIdOfContract[contractAddress] = 0;
        isRemoved[contractAddress][subId] = true;
    }

    function depositToSub(uint subId) external payable {
        require(
            msg.sender == ownerOfSub[subId],
            "You are not the owner of subscription"
        );
        balanceOfSub[subId] += msg.value;
    }

    function withdrawFromSub(uint subId, uint amount) external payable {
        require(
            msg.sender == ownerOfSub[subId],
            "You are not the owner of subscription"
        );
        require(
            balanceOfSub[subId] >= amount,
            "Subscription does not have enough tokens"
        );
        balanceOfSub[subId] -= amount;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    function requestRandomValue(uint randomId, uint randomValueCount)
        external
        returns (
            address,
            uint,
            uint
        )
    {
        require(
            subIdOfContract[msg.sender] != 0,
            "Consumer is not subscribed!"
        );
        emit RequestRandomness(msg.sender, randomId, randomValueCount);
        return (msg.sender, randomId, randomValueCount);
    }

    function fulfillRandomness(
        uint _randomId,
        uint[] calldata _randomValue,
        address consumerAddress
    ) external {
        require(msg.sender == oracleAddress, "Only Oracle Can Fulfill");
        require(
            subIdOfContract[consumerAddress] != 0,
            "Contract is not subscribed"
        );
        uint startGas = gasleft();
        IRandomnessConsumer(consumerAddress).fulfillRandomness(
            _randomId,
            _randomValue
        );
        uint endGas = startGas - gasleft();
        uint gasUsed = endGas * tx.gasprice;
        uint totalFee = gasUsed + premium;
        require(
            balanceOfSub[subIdOfContract[consumerAddress]] >= totalFee,
            "Subscription does not have enough tokens"
        );
        balanceOfSub[subIdOfContract[consumerAddress]] -= totalFee;
        (bool sent, ) = oracleAddress.call{value: gasUsed}("");
        require(sent, "Failed to send Ether");
        (sent, ) = owner().call{value: premium}("");
        require(sent, "Failed to send Ether");
    }

    function getBalanceOfSub(uint subId) external view returns (uint) {
        return balanceOfSub[subId];
    }

    function getSubscriptipnsOfOnwer(address _user)
        external
        view
        returns (uint[] memory subs, bool[] memory isDel)
    {
        subs = subsOfOwner[_user];
        bool[] memory temp = new bool[](subs.length);
        for (uint i; i < subs.length; i++) {
            temp[i] = isDeleted[subs[i]];
        }
        isDel = temp;
    }

    function getConsumersOfSubscription(uint subId)
        external
        view
        returns (address[] memory consumers, bool[] memory isRem)
    {
        consumers = consumersOfSub[subId];
        bool[] memory temp = new bool[](consumers.length);
        for (uint i; i < consumers.length; i++) {
            temp[i] = isRemoved[consumers[i]][subId];
        }
        isRem = temp;
    }
}
