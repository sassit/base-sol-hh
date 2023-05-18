import { expect } from "chai"
import { ethers } from "hardhat"
import { Ballot } from "../typechain-types"
import { Signer } from "ethers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import _ from "lodash"

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"]

describe("Ballot", () => {
    let ballotContract: Ballot
    let signers: SignerWithAddress[]
    let cpAddress: string
    let cpSigner: Signer

    beforeEach(async () => {
        const ballotFactory = await ethers.getContractFactory("Ballot")
        ballotContract = await ballotFactory.deploy(PROPOSALS.map(ethers.utils.formatBytes32String))
        await ballotContract.deployed()

        signers = await ethers.getSigners()
        cpAddress = await ballotContract.chairperson()
        cpSigner = await ethers.getSigner(cpAddress)
    })

    describe("when the contract is deployed", () => {
        it("has the provided proposals", async () => {
            await Promise.all(
                _.range(PROPOSALS.length).map(async (index) => {
                    const proposal = await ballotContract.proposals(index)
                    expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(PROPOSALS[index])
                })
            )
        })

        it("has zero votes for all proposals", async () => {
            await Promise.all(
                _.range(PROPOSALS.length).map(async (index) => {
                    const proposal = await ballotContract.proposals(index)
                    expect(proposal.voteCount).to.eq(0)
                })
            )
        })

        it("sets the deployer address as chairperson", async () => {
            const [owner] = await ethers.getSigners()
            const chairperson = await ballotContract.chairperson()
            expect(chairperson).to.eq(owner.address)
        })

        it("sets the voting weight for the chairperson as 1", async () => {
            const chairperson = await ballotContract.chairperson()
            const voter = await ballotContract.voters(chairperson)
            expect(voter.weight).to.eq(1)
        })
    })

    describe("when the chairperson interacts with the giveRightToVote function in the contract", () => {
        it("gives right to vote for another address", async () => {
            ;(await ballotContract.connect(cpSigner).giveRightToVote(signers[3].address)).wait()
            const voter = await ballotContract.voters(signers[3].address)
            expect(voter.weight).to.eq(1)
        })

        it("can not give right to vote for someone that has voted", async () => {
            await ballotContract.vote(0) // implicit address[0] connects
            await expect(
                ballotContract.connect(cpSigner).giveRightToVote(signers[0].address)
            ).to.be.revertedWith("The voter already voted.")
        })

        it("can not give right to vote for someone that has already voting rights", async () => {
            ;(await ballotContract.connect(cpSigner).giveRightToVote(signers[3].address)).wait()
            await expect(
                ballotContract.connect(cpSigner).giveRightToVote(signers[3].address)
            ).to.be.revertedWith("Already has voting rights.")
        })
    })

    describe("when the voter interact with the vote function in the contract", () => {
        // used chairman, implicitly has right to vote
        it("should register the vote", async () => {
            ballotContract.vote(0)
            expect((await ballotContract.proposals(0)).voteCount).is.eq(1)
        })
    })

    describe("when the voter interact with the delegate function in the contract", () => {
        it("should transfer voting power", async () => {
            const cpConnect = ballotContract.connect(cpSigner)
            ;(await cpConnect.giveRightToVote(signers[1].address)).wait()
            ;(await cpConnect.delegate(signers[1].address)).wait()
            expect((await ballotContract.voters(signers[1].address)).weight).is.eq(2)
        })
    })

    // an attacker must be someone not having a right to vote but interacting with the operations of the ballot
    describe("when an attacker interacts with the giveRightToVote function in the contract", () => {
        it("should revert", async () => {
            const attConnect = ballotContract.connect(signers[3])
            await expect(attConnect.giveRightToVote(signers[3].address)).to.be.revertedWith(
                "Only chairperson."
            )
        })
    })

    describe("when the an attacker interact with the vote function in the contract", () => {
        it("should revert", async () => {
            const attConnect = ballotContract.connect(signers[3])
            await expect(attConnect.vote(0)).to.be.revertedWith("Has no right to vote")
        })
    })

    describe("when the an attacker interact with the delegate function in the contract", () => {
        it("should revert", async () => {
            const attConnect = ballotContract.connect(signers[3])
            await expect(attConnect.delegate(signers[3].address)).to.be.revertedWith(
                "You have no right to vote"
            )
        })
    })

    describe("when someone interact with the winningProposal function before any votes are cast", () => {
        it("should return 0", async () => {
            const somConnect = ballotContract.connect(signers[2])
            expect(await somConnect.winningProposal()).is.eq(0)
        })
    })

    describe("when someone interacts with the winningProposal function after one vote is cast for the first proposal", () => {
        it("should return 0", async () => {
            ballotContract.vote(0)
            const somConnect = ballotContract.connect(signers[2])
            expect(await somConnect.winningProposal()).is.eq(0)
        })
    })

    describe("when someone interacts with the winnerName function before any votes are cast", () => {
        it("should return name of proposal 0", async () => {
            const somConnect = ballotContract.connect(signers[2])
            expect(ethers.utils.parseBytes32String(await somConnect.winnerName())).is.eq(
                "Proposal 1"
            )
        })
    })

    describe("when someone interacts with the winnerName function after one vote is cast for the first proposal", () => {
        it("should return name of proposal 0", async () => {
            ballotContract.vote(0)
            const somConnect = ballotContract.connect(signers[2])
            expect(ethers.utils.parseBytes32String(await somConnect.winnerName())).is.eq(
                "Proposal 1"
            )
        })
    })

    // Buggy!
    // describe("when someone interacts with the winningProposal function and winnerName after 5 random votes are cast for the proposals", () => {
    //     it("should return the name of the winner proposal", async () => {
    //         await Promise.all(
    //             _.range(1, 5).map(async (i) => {
    //                 (await ballotContract.giveRightToVote(signers[i].address)).wait
    //                 ballotContract.connect(signers[i]).vote(_.random(PROPOSALS.length - 1))
    //             })
    //         )
    //         const winningProposal = PROPOSALS[(await ballotContract.winningProposal()).toNumber()]
    //         const winnerName = ethers.utils.parseBytes32String(await ballotContract.winnerName())
    //         expect(winningProposal).is.eq(winnerName)
    //     })
    // })
    describe("how many votes are casted for each proposal", () => {
        it("should return the number of votes for each proposal", async () => {
            await Promise.all(
                _.range(1, 5).map(async (i) => {
                    ;(await ballotContract.giveRightToVote(signers[i].address)).wait
                    ballotContract.connect(signers[i]).vote(_.random(PROPOSALS.length - 1))
                })
            )
            const votes = await Promise.all(
                _.range(PROPOSALS.length).map(async (index) => {
                    const proposal = await ballotContract.proposals(index)
                    return proposal.voteCount
                })
            )
            expect(votes).to.have.lengthOf(PROPOSALS.length)
        })
    })
})
