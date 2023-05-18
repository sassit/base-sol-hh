import { expect } from "chai"
import { ethers } from "hardhat"
import { TokenizedBallot } from "../typechain-types"
import _ from "lodash"
import { BigNumber } from "ethers"

const ETHERS = 10
const TARGET_BLOCK = 100
const PROPOSALS: string[] = ["Proposal 1", "Proposal 2", "Proposal 3"]
const MINT_VALUE: BigNumber = ethers.utils.parseUnits("10", "ether")

describe("Tokenized ballot tests", () => {
    let tokenizedBallotContract: TokenizedBallot

    beforeEach(async () => {
        const [deployer, acc1] = await ethers.getSigners()
        // Deploy the votes contract
        const votesContractFactory = await ethers.getContractFactory("MyERC20Votes")
        const votesContract = await votesContractFactory.deploy()
        const votesTxReceipt = await votesContract.deployTransaction.wait()
        console.log(
            `The votes contract was deployed at address ${votesContract.address} at the block ${votesTxReceipt.blockNumber}`
        )

        // Mint some tokens
        const mintTx = await votesContract.connect(deployer).mint(acc1.address, MINT_VALUE)
        const mintTxReceipt = await mintTx.wait()
        console.log(
            `Minted ${ethers.utils.formatUnits(MINT_VALUE)} to the address ${
                acc1.address
            } at block ${mintTxReceipt.blockNumber}`
        )

        // Deployed the tokenized ballot contract
        const tokenizedBallotFactory = await ethers.getContractFactory("TokenizedBallot")
        tokenizedBallotContract = await tokenizedBallotFactory.deploy(
            PROPOSALS.map((p) => ethers.utils.formatBytes32String(p)),
            votesContract.address,
            TARGET_BLOCK
        )
        const tokenizedBallotTxReceipt = await tokenizedBallotContract.deployTransaction.wait()
        console.log(
            `The tokenized ballot contract was deployed at address ${tokenizedBallotContract.address} at the block ${tokenizedBallotTxReceipt.blockNumber}`
        )
    })

    describe("When the contract is deployed", () => {
        it("has the proposals set", async () => {
            await Promise.all(
                _.range(PROPOSALS.length).map(async (index) => {
                    const proposal = await tokenizedBallotContract.proposals(index)
                    expect(ethers.utils.parseBytes32String(proposal.name)).to.eq(PROPOSALS[index])
                })
            )
        })

        it("has zero votes for all proposals", async () => {
            await Promise.all(
                _.range(PROPOSALS.length).map(async (index) => {
                    const proposal = await tokenizedBallotContract.proposals(index)
                    expect(proposal.voteCount).to.eq(0)
                })
            )
        })

        it("has a votes contract with the expected minted amount", async () => {
            const votesAddress = await tokenizedBallotContract.votesContract()
            const votesContract = await ethers.getContractAt("MyERC20Votes", votesAddress)
            const totalSupplyBN = await votesContract.totalSupply()
            const decimals = await votesContract.decimals()
            const totalSupply = parseFloat(ethers.utils.formatUnits(totalSupplyBN, decimals))
            expect(totalSupply).to.eq(ETHERS)
        })
    })

    describe("When voting starts", () => {
        it.skip("reverts with not mined block if ", async () => {
            const votingStarted = await tokenizedBallotContract.vote(0, 5)
        })
    })
})
