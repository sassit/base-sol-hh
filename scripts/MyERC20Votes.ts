import { ethers } from "hardhat"

const MINT_VALUE = ethers.utils.parseUnits("10", "ether")

async function main() {
    const [deployer, acc1, acc2] = await ethers.getSigners()
    const voteContractFactory = await ethers.getContractFactory("MyERC20Votes")
    const voteContract = await voteContractFactory.deploy()
    const receipt = await voteContract.deployTransaction.wait()
    console.log(
        `The contract was deployed at address ${voteContract.address} at the block ${receipt.blockNumber}`
    )

    const mintTx = await voteContract.connect(deployer).mint(acc1.address, MINT_VALUE)
    const mintTxReceipt = await mintTx.wait()
    console.log(
        `Minted ${ethers.utils.formatUnits(MINT_VALUE)} to the address ${acc1.address} at block ${
            mintTxReceipt.blockNumber
        }`
    )

    const balanceBN = await voteContract.balanceOf(acc1.address)
    console.log(
        `Account ${acc1.address} has ${ethers.utils.formatUnits(
            balanceBN
        )} of ${await voteContract.name()}`
    )
    const votes = await voteContract.getVotes(acc1.address)
    console.log(
        `Account ${acc1.address} has ${ethers.utils.formatUnits(
            votes
        )} of voting powers before self delegating`
    )

    await voteContract.connect(acc1).delegates(acc1.address)
    const votesAfter = await voteContract.getVotes(acc1.address)
    console.log(
        `Account ${acc1.address} has ${ethers.utils.formatUnits(
            votesAfter
        )} of voting powers after self delegating`
    )

    const transferTx = await voteContract.connect(acc1).transfer(acc2.address, MINT_VALUE.div(2))
    await transferTx.wait()

    const lastBlock = await ethers.provider.getBlock("latest")
    const pastVotes = await voteContract.getPastVotes(acc1.address, lastBlock.number - 1)
    console.log(
        `Account ${acc2.address} has ${ethers.utils.formatUnits(
            pastVotes
        )} units of voting power at block ${lastBlock.number - 1}`
    )
}

main().catch((err) => {
    console.log(err)
    process.exit(1)
})
