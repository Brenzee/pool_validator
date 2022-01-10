const Web3 = require("web3");
const colors = require("colors"); //eslint-disable-line
const routerABI = require("./abis/RouterV2.abi.json");
const ERC20Abi = require("./abis/ERC20.json");
const ganache = require("ganache-cli");
const { default: BigNumber } = require("bignumber.js");

// Constants
const wbnb = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

const getGasEstimate = async (web3, func, acc) => {
  try {
    const estimate = await func.estimateGas({
      from: acc,
      value: web3.utils.toWei("1", "ether"),
    });
    return estimate;
  } catch (err) {}
};

const getETHBalance = async (web3, acc) => {
  const data = await web3.eth.getBalance(acc);
  return web3.utils.fromWei(data);
};

exports.swapTest = async (erc20address) => {
  const web3 = new Web3(
    ganache.provider({ fork: "https://bsc-dataseed.binance.org" })
  );
  const routerContract = new web3.eth.Contract(routerABI, routerAddress);
  const erc20Contract = new web3.eth.Contract(ERC20Abi, erc20address);

  try {
    const accounts = await web3.eth.getAccounts();

    // Estimate gas
    const estimateGas = await getGasEstimate(
      web3,
      routerContract.methods.swapExactETHForTokens(
        0,
        [wbnb, erc20address],
        accounts[0],
        Math.floor(Date.now() / 1000) + 60 * 20
      ),
      accounts[0]
    );

    await routerContract.methods
      .swapExactETHForTokens(
        0,
        [wbnb, erc20address],
        accounts[0],
        Math.floor(Date.now() / 1000) + 60 * 20 // 20 min
      )
      .send({
        from: accounts[0],
        gas: estimateGas,
        value: web3.utils.toWei("1", "ether"),
      });

    // Get ERC20 Balance
    const erc20Balance = await erc20Contract.methods
      .balanceOf(accounts[0])
      .call();

    // Approve ERC20 Spending
    await erc20Contract.methods.approve(routerAddress, erc20Balance).send({
      from: accounts[0],
    });

    const allowance = new BigNumber(
      await erc20Contract.methods.allowance(accounts[0], routerAddress).call()
    ).toFixed();

    const estimateGasSwap = await routerContract.methods
      .swapExactTokensForETH(
        allowance,
        0,
        [erc20address, wbnb],
        accounts[0],
        Math.floor(Date.now() / 1000) + 60 * 20
      )
      .estimateGas({
        from: accounts[0],
      });

    await routerContract.methods
      .swapExactTokensForETH(
        erc20Balance,
        0,
        [erc20address, wbnb],
        accounts[0],
        Math.floor(Date.now() / 1000) + 60 * 20 // 20 min
      )
      .send({
        from: accounts[0],
        gas: estimateGasSwap,
      });

    console.log(
      `\n\nSwap successful - ${erc20address} is swappable`.green.bold
    );
  } catch (err) {
    // console.log(`\n\nThis token (${erc20address}) is a HONEYPOT!`.red.bold);
    throw new Error(`${erc20address} - honeypot!`);
  }
};
