import hre from "hardhat"
import * as dotenv from "dotenv"
import { Ballot__factory } from "../typechain-types"
import { formatBytes32String } from "ethers/lib/utils"

dotenv.config()

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"].map(formatBytes32String)

async function main() {
    const ballotFactory = new Ballot__factory(hre.ethers.provider.getSigner())
    const ballotContract = await ballotFactory.deploy(PROPOSALS)
    await ballotContract.deployed()
    const deployTx = await ballotContract.deployTransaction.wait(5)
    console.log(`The ballot contract was deployed in transaction ${deployTx.blockHash}`)
    console.log(`The ballot contract was deployed at ${ballotContract.address}`)
    console.log(`The ballot contract is verifiied with api key ${process.env.ETHERSCAN_API_KEY}`)
    await hre.run(`verify:verify`, {
        address: ballotContract.address,
        constructorArguments: [PROPOSALS],
    })
    console.log(`The ballot contract was verified`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
