import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { MyERC20 } from "../typechain-types"

describe("Basic tests for understanding ERC20", async () => {
    let myERC20Contract: MyERC20
    let deployer: SignerWithAddress

    beforeEach(async () => {
        [deployer] = await ethers.getSigners()
        const myERC20ContractFactory = await ethers.getContractFactory("MyERC20")
        myERC20Contract = await myERC20ContractFactory.deploy()
        await myERC20Contract.deployed()
    })

    it("should have zero total supply at deployment", async () => {
        const totalSupplyBN = await myERC20Contract.totalSupply()
        const decimals = await myERC20Contract.decimals()
        const totalSupply = parseFloat(ethers.utils.formatUnits(totalSupplyBN, decimals))
        expect(totalSupply).to.eq(0)
    })

    it("should have more than zero total supply after minting", async () => {
        ;(await myERC20Contract.mint(deployer.address, 2)).wait()
        const totalSupplyBN = await myERC20Contract.totalSupply()
        const decimals = await myERC20Contract.decimals()
        const totalSupply = parseFloat(ethers.utils.formatUnits(totalSupplyBN, decimals))
        expect(totalSupply).to.eq(2)
    })

    it("triggers the Transfer event with the address of the sender when sending transactions", async function () {
        ;(await myERC20Contract.mint(deployer.address, 2)).wait()
        const targetAddress = deployer.address
        await expect(myERC20Contract.transfer(targetAddress, 1))
            .to.emit(myERC20Contract, "Transfer")
            .withArgs(deployer.address, targetAddress, 1)
    })
})
