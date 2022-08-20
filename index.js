#!/usr/bin/env node

const meow = require("meow");
const fgh = require("./cli");

const cli = meow(
    `
    Usage
      $ dex-market-data [options]
 
    Options
      --pancake, -p get market data from Pancakeswap.
      --uniswap, -u get market data from Uniswap.
      --sushiswap, -s get market data from Sushiswap.
      
    Examples
      $ node index.js --pancake
      $ node index.js --uniswap
      $ node index.js --sushiswap
`,
    {
        flags: {
            pancake: {
                type: "boolean",
                alias: "p",
            },
            uniswap: {
                type: "boolean",
                alias: "u",
            },
            sushiswap: {
                type: "boolean",
                alias: "s",
            },
        }
    }
);

fgh(cli.flags);
