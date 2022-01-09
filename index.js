const express = require("express");
const colors = require("colors");
const Web3 = require("web3");
const notifier = require("node-notifier");
const { default: BigNumber } = require("bignumber.js");
const app = express();
const port = 3030;

const FactoryV2Abi = require("./abis/FactoryV2.json");
const LPV2Abi = require("./abis/LPV2.json");
const { default: axios } = require("axios");

const web3 = new Web3("wss://bsc-ws-node.nariox.org:443");

let pairs = 669822;

web3.eth.subscribe("newBlockHeaders", async function (err, blockRes) {
  if (!err) {
    const PSv2Contract = new web3.eth.Contract(
      FactoryV2Abi,
      "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
    );
    const totalPairs = await PSv2Contract.methods.allPairsLength().call();
    if (parseFloat(totalPairs) > pairs) {
      const newLP = await PSv2Contract.methods
        .allPairs(parseFloat(totalPairs) - 1)
        .call();
      const PSLPContract = new web3.eth.Contract(LPV2Abi, newLP);
      const token1 = await PSLPContract.methods.token1().call();

      if (token1 === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c") {
        const reserves = await PSLPContract.methods.getReserves().call();
        if (BigNumber(reserves._reserve1).shiftedBy(-18).gt(10)) {
          const token2 = await PSLPContract.methods.token0().call();

          // try {
          //   const { data } = await axios.get(
          //     `https://aywt3wreda.execute-api.eu-west-1.amazonaws.com/default/IsHoneypot?chain=bsc2&token=${token2}`
          //   );
          // } catch (err) {
          //   console.log(err);
          // }

          notifier.notify({
            title: `New high liquidity has been added: ${newLP}`,
            message: `BNB in LP: ${BigNumber(reserves._reserve1)
              .shiftedBy(-18)
              .toFixed()}`,
            sound: true, // Only Notification Center or Windows Toasters
          });
          console.log("");
          console.log(`Block NR: ${blockRes.number}`);
          console.log(`https://bscscan.com/address/${newLP}`.blue.bold);
          console.log(
            `https://pancakeswap.finance/info/pool/${newLP}`.cyan.bold
          );
          console.log(
            `BNB in LP: ${BigNumber(reserves._reserve1)
              .shiftedBy(-18)
              .toFixed()}`.red.bold
          );
        }
      }
      pairs = totalPairs;
      // console.log(`New LP: ${newLP}`.red.bold);
    }
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
