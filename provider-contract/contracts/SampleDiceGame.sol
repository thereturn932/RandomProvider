// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
//  import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IRCCoordinator {
    function requestRandomValue(uint randomId, uint randomValueCount) external;
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

    function playDice(uint[] calldata dicePredictions) external {
        uint words = dicePredictions.length;
        require(
            1 < words && words < 5,
            "Min 1, Max 4 dices can be played at the same time"
        );

        for (uint i; i < words; i++) {
            require(
                0 < dicePredictions[i] && dicePredictions[i] < 7,
                "Dice Predictions should be between 1 and 6"
            );
        }

        IRCCoordinator(rfCoordinator).requestRandomValue(randomId, words);

        predictions[randomId] = dicePredictions;
        randomId++;
    }

    function fulfillRandomness(uint _randomId, uint[] calldata _randomValue)
        external
    {
        require(msg.sender == rfCoordinator);
        uint[] memory tempArray = predictions[_randomId];
        uint[] memory randomDiceResults = predictions[_randomValue.length];

        for (uint i = 0; i < _randomValue.length; i++) {
            randomDiceResults[i] = (_randomValue[i] % 6) + 1;
            for (uint j = 0; j < tempArray.length; j++) {
                if (randomDiceResults[i] == tempArray[j]) {
                    tempArray[j] = tempArray[tempArray.length - 1];
                    delete tempArray[tempArray.length - 1];
                    break;
                }
            }
        }
        randomValue[_randomId] = randomDiceResults;
        bool gameResult;
        if (tempArray.length == 0) {
            predictionResult[_randomId] = 1;
            gameResult = true;
        } else {
            predictionResult[_randomId] = 2;
        }
        emit GameResult(_randomId, randomDiceResults, gameResult);
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
