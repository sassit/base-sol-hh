import { expect } from "chai"
import { ethers } from "hardhat"

describe.skip("NFT Shop", async () => {
    beforeEach(async () => {})

    describe("When the Shop contract is deployed", async () => {
        it("defines the ratio as provided in parameters", async () => {
            throw new Error("Not implemented")
        })

        it("uses a valid ERC20 as payment token", async () => {
            throw new Error("Not implemented")
        })
    })

    describe("When a user buys an ERC20 from the Token contract", async () => {
        beforeEach(async () => {})

        it("charges the correct amount of ETH", async () => {
            throw new Error("Not implemented")
        })

        it("gives the correct amount of tokens", async () => {
            throw new Error("Not implemented")
        })
    })

    describe("When a user burns an ERC20 at the Shop contract", async () => {
        it("gives the correct amount of ETH", async () => {
            throw new Error("Not implemented")
        })

        it("burns the correct amount of tokens", async () => {
            throw new Error("Not implemented")
        })
    })

    describe("When a user buys an NFT from the Shop contract", async () => {
        it("charges the correct amount of ERC20 tokens", async () => {
            throw new Error("Not implemented")
        })

        it("gives the correct NFT", async () => {
            throw new Error("Not implemented")
        })
    })

    describe("When a user burns their NFT at the Shop contract", async () => {
        it("gives the correct amount of ERC20 tokens", async () => {
            throw new Error("Not implemented")
        })
    })

    describe("When the owner withdraws from the Shop contract", async () => {
        it("recovers the right amount of ERC20 tokens", async () => {
            throw new Error("Not implemented")
        })

        it("updates the owner pool account correctly", async () => {
            throw new Error("Not implemented")
        })
    })
})
