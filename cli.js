const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType } = require('@uniswap/sdk');
const sushiData = require('@sushiswap/sushi-data');
const axios = require('axios');
const fs = require("fs");
const { stringify } = require("csv-stringify");

const { Uni_ETH_Price } = require('./utils');

const tokenlist = require('./tokens.json');

async function PancakeswapData() {
    try {
        const return_data = [];

        const res = await axios.get("https://api.pancakeswap.info/api/v2/tokens");

        for (const key in res.data.data) {
            return_data.push({
                'symbol': res.data.data[key].symbol,
                'address': key,
                'price': res.data.data[key].price
            })
        }

        return return_data;
    }
    catch (err) {
        console.error(err);
    }
}

async function UniswapData() {
    try {
        const pairs_ls = [];
        const return_data = [];

        const ETH_Price = await Uni_ETH_Price();

        for (let i = 1; i < tokenlist.length; i++) {
            const token = new Token(ChainId.MAINNET, tokenlist[i].address, tokenlist[i].decimals);
            pairs_ls.push(Fetcher.fetchPairData(token, WETH[token.chainId]));
        }
        const pairs = await Promise.all(pairs_ls);

        return_data.push({
            'symbol': 'WETH',
            'address': tokenlist[0].address,
            'price': ETH_Price
        })

        for (let i = 0; i < pairs.length; i++) {
            const route = new Route([pairs[i]], WETH[tokenlist[i].chainId]);
            const trade = new Trade(route, new TokenAmount(WETH[tokenlist[i].chainId], '1000000000000000000'), TradeType.EXACT_INPUT);

            return_data.push({
                'symbol': tokenlist[i + 1].symbol,
                'address': tokenlist[i + 1].address,
                'price': ETH_Price / trade.executionPrice.toSignificant(6)
            })
        }

        return return_data;
    }
    catch (err) {
        console.error(err);
    }
}

async function SushiswapData() {
    try {
        const return_data = [];

        const ETH = await sushiData.exchange.ethPrice();

        const tokens = await sushiData.exchange.tokens({});

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].derivedETH === 0) continue;
            if (tokens[i].derivedETH < 0.0001) continue;
            return_data.push({
                'symbol': tokens[i].symbol,
                'address': tokens[i].id,
                'price': ETH * tokens[i].derivedETH
            })
        }

        return return_data;
    }
    catch (err) {
        console.error(err);
    }
}

function writeFile(data) {
    try {
        const writableStream = fs.createWriteStream(`csv/market.csv`);

        const columns = [''];

        for (const key in data) {
            data[key].map((row) => {
                columns.push(`${row.symbol}_${key}`);
            })
        }

        const stringifier = stringify({ header: true, columns: columns });

        for (const key in data) {
            for (let i = 0; i < data[key].length; i++) {
                const row = [`${data[key][i].symbol}_${key}`];
                for (const _key in data) {
                    for (let j = 0; j < data[_key].length; j++) {
                        if (i === j && key === _key) row.push('1');
                        else row.push(Number(data[key][i].price) / Number(data[_key][j].price));
                    }
                }
                stringifier.write(row);
            }
        }

        stringifier.pipe(writableStream);
    }
    catch (err) {
        console.error(err);
    }
}


module.exports = function ({ pancake, uniswap, sushiswap, }) {
    console.log(pancake, uniswap, sushiswap);
    (async () => {
        setInterval(async () => {
            let pancake_data = [];
            let uniswap_data = [];
            let sushi_data = [];

            if (pancake)
                pancake_data = await PancakeswapData();
            console.log('pancake_data = ', pancake_data);

            if (uniswap)
                uniswap_data = await UniswapData();
            console.log('uniswap_data = ', uniswap_data);

            if (sushiswap)
                sushi_data = await SushiswapData();
            console.log('sushi_data = ', sushi_data);

            writeFile(
                {
                    'pancake': pancake_data,
                    'uniswap': uniswap_data,
                    'sushiswap': sushi_data
                }
            );
        }, 300000);
    })()
}

