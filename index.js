const express = require("express");
const colors = require("colors"); // eslint-disable-line
const Web3 = require("web3");
const notifier = require("node-notifier");
const BigNumber = require("bignumber.js");
const app = express();
const port = 3030;
const FactoryV2Abi = require("./abis/FactoryV2.json");
const LPV2Abi = require("./abis/LPV2.json");
const { swapTest } = require("./honeypot.script");

const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const web3 = new Web3("wss://bsc-ws-node.nariox.org:443");
const PSv2Contract = new web3.eth.Contract(
  FactoryV2Abi,
  "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
);

PSv2Contract.events.PairCreated({}, async function (err, event) {
  if (!err) {
    try {
      const { token0, token1, pair } = event.returnValues;

      console.log(token0, token1);

      // Check if pair has WBNB
      if (token1 === wbnb || token0 === wbnb) {
        const PSLPContract = new web3.eth.Contract(LPV2Abi, pair);
        const reserves = await PSLPContract.methods.getReserves().call();

        const wbnbReserve =
          token1 === wbnb ? reserves._reserve1 : reserves._reserve0;

        // Check if WBNB amount is enough to make it significant
        if (BigNumber(wbnbReserve).shiftedBy(-18).gt(1)) {
          await swapTest(token0);
          notifier.notify({
            title: `New high liquidity has been added: ${pair}`,
            message: `BNB in LP: ${BigNumber(wbnbReserve)
              .shiftedBy(-18)
              .toFixed()}`,
            sound: true, // Only Notification Center or Windows Toasters
          });
          console.log(`\nhttps://bscscan.com/address/${pair}`.blue.bold);
          console.log(
            `https://pancakeswap.finance/info/pool/${pair}`.cyan.bold
          );
          console.log(
            `BNB in LP: ${BigNumber(reserves._reserve1)
              .shiftedBy(-18)
              .toFixed()}`.red.bold
          );
        }
      }
    } catch (err) {
      // console.log()
    }
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
