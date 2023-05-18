import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ethers } from "hardhat"
import { ContractFactory } from "ethers"

describe("Basic test for understanding ERC721", async () => {
    let accounts: SignerWithAddress[]
    let erc20ContractFactory: ContractFactory
    let erc721ContractFactory: ContractFactory
    beforeEach(async () => {
        ;[accounts, erc20ContractFactory, erc721ContractFactory] = await Promise.all([
            ethers.getSigners(),
            ethers.getContractFactory("MyERC20Token"),
            ethers.getContractFactory("MyERC721Token"),
        ])
    })
})
