require("@nomiclabs/hardhat-waffle")
require("dotenv").config({ path: ".env" })

const NODE_URL = process.env.ROPSTEN_URL;

const PKEY = process.env.PKEY;

module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: NODE_URL,
      accounts: [PKEY],
    },
  },
};