import { run, ethers } from "hardhat"
import * as dotenv from "dotenv"
import { Ballot__factory } from "../typechain-types"
import { formatBytes32String } from "ethers/lib/utils"
dotenv.config()

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"].map(formatBytes32String)

async function main() {
    await run("compile")
    console.log(`Private Key: ${process.env.PRIVATE_KEY}`)
    console.log(`Network: ${process.env.NETWORK}`)
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "")
    console.log(`Wallet Address: ${wallet.address}`)
    const provider = ethers.providers.getDefaultProvider(process.env.NETWORK)
    const latest = await provider.getBlock("latest")
    console.log(`Latest block: ${latest.number}`)
    const signer = wallet.connect(provider)
    const balance = await signer.getBalance()
    console.log(`Balance: ${balance}`)
    const ballotFactory = new Ballot__factory(signer)
    const ballotContract = await ballotFactory.deploy(PROPOSALS)
    await ballotContract.deployed()
    const deployTx = await ballotContract.deployTransaction.wait()
    console.log(`The ballot contract was deployed in transaction ${deployTx.blockHash}`)
    console.log(`The ballot contract was deployed at ${ballotContract.address}`)
    console.log(`The ballot contract is verifiied with api key ${process.env.ETHERSCAN_API_KEY}`) 
    await run(`verify:verify`, {
        address: ballotContract.address,
        constructorArguments: [PROPOSALS],
      });
    console.log(`The ballot contract was verified`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })