const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

// function deployFunc() {
//   console.log("hi");
// }

// module.exports.default = deployFunc;

// module.exports = async (hre) => {
//     const { getNameAccounts, deployments } = hre
// }
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // If chainId is X, use address Y
  //   const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  // If the contract doesn't exist, we deploy a minimal version for our local test network

  // when going for localhost or hardhat network we want to use a mock
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // put price feed address here
    log: true,
    waitConfirmations: network.config.blcokConfirmations || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    // verify
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }

  log("---------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
