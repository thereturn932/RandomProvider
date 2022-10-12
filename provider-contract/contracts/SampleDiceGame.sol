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

contract SampleDiceGame is Ownable {
    mapping(uint => uint[]) public randomValue;
    mapping(uint => uint[]) public predictions;
    mapping(uint => uint8) public predictionResult;
    uint public randomId;
    event RequestRandomness(address, uint, uint);
    event GameResult(uint, uint[], bool);
    address public rfCoordinator;

    constructor(address _rfCoordinator) {
        rfCoordinator = _rfCoordinator;
    }

    function setRFCoordinator(address _rfCoordinator) external onlyOwner {
        rfCoordinator = _rfCoordinator;
    }

    function playDice(uint[] calldata dicePredictions, uint randomValueCount)
        external
    {
        require(
            1 < randomValueCount && randomValueCount < 5,
            "Min 1, Max 4 dices can be played at the same time"
        );
        require(
            dicePredictions.length == randomValueCount,
            "Predicted more than requested"
        );
        for (uint i; i < dicePredictions.length; i++) {
            require(
                0 < dicePredictions[i] && dicePredictions[i] < 7,
                "Dice Predictions should be between 1 and 6"
            );
        }
        IRCCoordinator(rfCoordinator).requestRandomValue(
            randomId,
            randomValueCount
        );
        predictions[randomId] = dicePredictions;
        randomId++;
    }

    function fulfillRandomness(uint _randomId, uint[] calldata _randomValue)
        external
    {
        require(msg.sender == rfCoordinator);
        randomValue[_randomId] = _randomValue;
        uint[] memory tempArray = predictions[_randomId];
        for (uint i = 0; i < _randomValue.length; i++) {
            for (uint j = 0; j < tempArray.length; j++) {
                if (((_randomValue[i] % 6) + 1) == tempArray[j]) {
                    tempArray[j] = tempArray[tempArray.length - 1];
                    delete tempArray[tempArray.length - 1];
                    break;
                }
            }
        }
        bool gameResult;
        if (tempArray.length == 0) {
            predictionResult[_randomId] = 1;
            gameResult = true;
        } else {
            predictionResult[_randomId] = 2;
        }
        emit GameResult(_randomId, _randomValue, gameResult);
    }

    function readRandomValues(uint index)
        external
        view
        returns (uint[] memory)
    {
        return randomValue[index];
    }

    function getPredictionResult(uint _randomId)
        external
        view
        returns (uint8 result)
    {
        result = predictionResult[_randomId];
    }
}
