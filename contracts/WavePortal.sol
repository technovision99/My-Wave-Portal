//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;
    mapping(address => uint256) public waveRecord;
    mapping(address => uint256) public lastWavedAt;
    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }
    Wave[] waves;

    constructor() payable {
        console.log("This is a smart contract!");
    }

    function wave(string memory _message) public {
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30 seconds!"
        );
        lastWavedAt[msg.sender] = block.timestamp;
        totalWaves++;
        console.log("%s has waved!", msg.sender);

        waveRecord[msg.sender]++;
        waves.push(Wave(msg.sender, _message, block.timestamp));
        uint256 randomNumber = (block.difficulty + block.timestamp + seed) %
            100;
        console.log("Random # generated: %s", randomNumber);
        seed = randomNumber;
        if (randomNumber < 50) {
            console.log("%s won!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "The contract doesn't have enough money."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }
        emit NewWave(msg.sender, block.timestamp, _message);
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %s total waves!", totalWaves);
        return totalWaves;
    }

    function getSenderWaves() public view returns (uint256) {
        console.log(
            "%s has waved %s times!",
            msg.sender,
            waveRecord[msg.sender]
        );
        return waveRecord[msg.sender];
    }
}
