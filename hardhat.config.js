require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: process.env.STAGING_QUICKNODE_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  // etherscan: {
  //   apiKey: process.env.ETHER_API_KEY
  // }
};

// Contract deployed to: 0x38431f2b31D2C7075747739132Bee5EDD7552fB9
// Minted NFT #1
// Minted NFT #2
