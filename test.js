const Web3 = require("web3");

const funct = () => {
  const web3 = new Web3(
    "https://quiet-shy-snowflake.quiknode.io/231400de-a409-4443-b704-304f6c2a3e67/1LNFntZ7_TFMiS_Uc10CpO0X5RkzXTDSm2G7RjT-JKwCeWVnveLDDfz_OYhFXEvxSTR9t9lDSs_PfN0YgKFRtQ==/"
  );
  console.log("0xEfdACAab316412E287D11B0d8f5A553f6dB347a3".match(/.{1,6}/g));
  //   0xEfdACAab316412E287D11B0d8f5A553f6dB347a3
  //   0x438eE/C47Dd/5c2AC/24aCd/b14CA/d81E0/3Dd6e/7BBEA
  const first = web3.utils.numberToHex("276718");
  const secnd = web3.utils.numberToHex("804829").slice(2);
  const third = web3.utils.numberToHex("377516").slice(2);
  const forth = web3.utils.numberToHex("150221").slice(2);
  const fifth = web3.utils.numberToHex("726218").slice(2);
  const sixth = web3.utils.numberToHex("885216").slice(2);
  const seventh = web3.utils.numberToHex("253294").slice(2);
  const eight = web3.utils.numberToHex("506858").slice(2);

  console.log(
    web3.utils.toChecksumAddress(
      `${first}${secnd}${third}${forth}${fifth}${sixth}${seventh}${eight}`
    )
  );
};

const getNumbers = (address) => {
  const web3 = new Web3(
    "https://quiet-shy-snowflake.quiknode.io/231400de-a409-4443-b704-304f6c2a3e67/1LNFntZ7_TFMiS_Uc10CpO0X5RkzXTDSm2G7RjT-JKwCeWVnveLDDfz_OYhFXEvxSTR9t9lDSs_PfN0YgKFRtQ==/"
  );
  const firstHex = address.slice(0, 7);
  const restHexes = address
    .slice(7)
    .match(/.{1,5}/g)
    .map((hex) => `0x${hex}`);
  const allHexes = [firstHex, ...restHexes];
  console.log(allHexes);

  const numbers = allHexes.map((hex) => web3.utils.hexToNumberString(hex));
  console.log(numbers);
  //   console.log(web3.utils.hexToNumberString("0x438eE"));
};

// funct();
getNumbers("0xEfdACAab316412E287D11B0d8f5A553f6dB347a3");
