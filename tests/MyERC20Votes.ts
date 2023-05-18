import { expect } from "chai"
import { ethers } from "hardhat"
import { MyERC20Votes } from "../typechain-types"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

const MINT_VALUE = ethers.utils.parseUnits("10", "ether")

describe("Vote contracts", async () => {
    let voteContract: MyERC20Votes
    let deployer: SignerWithAddress
    let acc1: SignerWithAddress
    let acc2: SignerWithAddress

    beforeEach(async () => {
        // Deploy the contract and mint acc1 with MINT_VALUE
        ;[deployer, acc1, acc2] = await ethers.getSigners()
        const voteContractFactory = await ethers.getContractFactory("MyERC20Votes")
        voteContract = await voteContractFactory.deploy()
        await voteContract.mint(acc1.address, MINT_VALUE)
    })

    describe("When the contract is deployed", async () => {
        it("has account1 with the minted amount", async () => {
            const balance = await voteContract.balanceOf(acc1.address)
            expect(balance).to.eq(MINT_VALUE)
        })

        it("has account1 with zero votes before self delegating", async () => {
            const votes = await voteContract.getVotes(acc1.address)
            expect(votes).to.eq(0)
        })

        it("has account1 with zero delegated votes", async () => {
            await voteContract.connect(acc1).delegates(acc1.address)
            const votes = await voteContract.getVotes(acc1.address)
            expect(Number(votes)).to.eq(Number(0))
        })
    })

    describe("Interacting with the contract", async () => {
        it("has minted amount after self delegating", async () => {
            await voteContract.connect(acc1).delegates(acc1.address)
            const votes = await voteContract.connect(deployer).getVotes(acc1.address)
            expect(Number(votes)).to.eq(Number(0))
        })

        it("has account1 with half of total voting power after a transfer", async () => {
            ;(await voteContract.connect(acc1).transfer(acc2.address, MINT_VALUE.div(2))).wait()
            const lastBlock = await ethers.provider.getBlock("latest")
            const pastVotes = await voteContract.getPastVotes(acc1.address, lastBlock.number - 1)
            expect(Number(pastVotes)).to.eq(Number(MINT_VALUE.div(2)))
        })
    })
})
