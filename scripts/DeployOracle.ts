import hre  from "hardhat";
import * as dotenv from "dotenv"

dotenv.config()

async function main() {
    const contractFactory = await hre.ethers.getContractFactory("Oracle")
    const contract = await contractFactory.deploy(process.env.TRELLOR_ORACLE ?? ``)
    await contract.deployed()
    console.log(`The oracle is deployed at ${contract.address}`)
    const lastBTCPrice = await contract.getBtcSpotPrice()
    console.log(`The last BTC price is ${hre.ethers.utils.formatUnits(lastBTCPrice)}`)
    await hre.run(`verify:verify`, {
        address: contract.address,
        constructorArguments: [process.env.TRELLOR_ORACLE],
    })
    console.log(`The oracle contract was verified`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
