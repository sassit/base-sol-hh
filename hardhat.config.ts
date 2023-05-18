import "@nomicfoundation/hardhat-chai-matchers"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "@typechain/hardhat"
import "hardhat-contract-sizer"
import "hardhat-gas-reporter"
import "hardhat-nodemon"
import "solidity-coverage"

import { HardhatUserConfig, task } from "hardhat/config"
import * as dotenv from "dotenv"

dotenv.config()

const NETWORK_GAS_PRICE: Partial<Record<string, number>> = {
    // "mainnet": ethers.utils.parseUnits("10", "gwei").toNumber(),
    // "sepolia": ethers.utils.parseUnits("10", "gwei").toNumber(),
}

const config: HardhatUserConfig = {
    paths: { tests: "tests" },
    defaultNetwork: "hardhat",
    solidity: {
        compilers: [
            {
                version: "0.8.18",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 800,
                        details: {
                            yul: true,
                        },
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            initialBaseFeePerGas: 0,
            chainId: 31337,
            forking: {
                url: process.env.ETH_MAINNET_URL || "",
                // The Hardhat network will by default fork from the latest mainnet block
                // To pin the block number, specify it below
                // You will need access to a node with archival data for this to work!
                // blockNumber: 14743877,
                // If you want to do some forking, set `enabled` to true
                enabled: false,
            },
        },
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        sepolia: {
            chainId: 11155111,
            url: process.env.ETH_SEPOLIA_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
            gasPrice: NETWORK_GAS_PRICE["sepolia"] || "auto",
            gas: 2100000,
        },
        mumbai: {
            chainId: 80001,
            url: process.env.ETH_MUMBAI_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
            gasPrice: NETWORK_GAS_PRICE["mumbai"] || "auto",
            gas: 2100000,
        },
        main: {
            chainId: 1,
            url: process.env.ETH_MAINNET_URL || "",
            accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
            gasPrice: NETWORK_GAS_PRICE["mainnet"] || "auto",
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
    },
    contractSizer: {
        alphaSort: true,
        runOnCompile: true,
        disambiguatePaths: false,
        strict: true,
        only: [],
        except: [],
    },
    etherscan: {
        apiKey: {
            sepolia: process.env.ETHERSCAN_API_KEY || "",
            polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
        },
    },
}

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

export default config
