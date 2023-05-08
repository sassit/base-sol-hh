import hre from "hardhat"
import * as dotenv from "dotenv"
import { Ballot__factory } from "../typechain-types"
import { formatBytes32String } from "ethers/lib/utils"
import { AlchemyProvider } from "@ethersproject/providers"

dotenv.config()

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"].map(formatBytes32String)

async function main() {
    // await hre.run("compile")
    // console.log(`Private Key: ${process.env.PRIVATE_KEY}`)
    // const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY ?? "")
    // console.log(`Wallet Address: ${wallet.address}`)
    // const a = new AlchemyProvider()
    // const provider = hre.ethers.providers.getDefaultProvider(process.env.ETH_SEPOLIA_URL)
    // console.log(`Network name: ${(await provider.getNetwork()).name}`)
    // const latest = await provider.getBlock("latest")
    // console.log(`Latest block: ${latest.number}`)
    // const signer = wallet.connect(provider)
    // const balance = await signer.getBalance()
    // console.log(`Balance: ${balance}`)
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
      });
    console.log(`The ballot contract was verified`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
