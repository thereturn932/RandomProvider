// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRCCoordinator {
    function requestRandomValue(uint randomId, uint randomValueCount)
        external
        returns (
            address,
            uint,
            uint
        );
}

contract RandomnessConsumer is Ownable {
    mapping(uint => uint[]) public randomValue;
    uint public randomId;
    event RequestRandomness(address, uint, uint);
    event FulfillRandomness(uint, uint[]);
    address public rfCoordinator;

    constructor(address _rfCoordinator) {
        rfCoordinator = _rfCoordinator;
    }

    function setRFCoordinator(address _rfCoordinator) external onlyOwner {
        rfCoordinator = _rfCoordinator;
    }

    function requestRandomValue(uint randomValueCount) external {
        IRCCoordinator(rfCoordinator).requestRandomValue(
            randomId,
            randomValueCount
        );
    }

    function fulfillRandomness(uint _randomId, uint[] calldata _randomValue)
        external
    {
        require(msg.sender == rfCoordinator);
        randomValue[_randomId] = _randomValue;
        emit FulfillRandomness(_randomId, _randomValue);
    }

    function readRandomValues(uint index)
        external
        view
        returns (uint[] memory)
    {
        return randomValue[index];
    }
}
