// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/governance/utils/IVotes.sol";

contract TokenizedBallot {
    
    struct Proposal {
        bytes32 name; // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    IVotes public votesContract;
    Proposal[] public proposals;
    uint256 public targetBlockNumber;

    mapping (address => uint256) public votingPowerSpent;

    constructor(bytes32[] memory proposalNames, address _votesContract, uint256 _targetBlockNumber) {
        votesContract = IVotes(_votesContract);
        targetBlockNumber = _targetBlockNumber;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function votingPower(address voter) public view returns (uint256) {
        return votesContract.getPastVotes(voter, targetBlockNumber) - votingPowerSpent[voter];
    }

    function vote(uint proposal, uint256 amount) external {        
        require(votingPowerSpent[msg.sender] >= amount, "Not enough voting power");
        votingPowerSpent[msg.sender] += amount;
        proposals[proposal].voteCount += amount;
    }

    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
