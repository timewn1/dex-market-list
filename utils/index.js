const Web3 = require('web3');

const { ERC20Contracts } = require('../contract');

const provider = 'https://eth-rpc.gateway.pokt.network';

const WETH_Address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';                      // WETH contract address
const USDT_Address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';                      // USDT contract address
const Uniswap_Address = '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852';                 // WETH/USDT pair pool address in UniswapV2
const Sushi_Address = '0x06da0fd433C1A5d7a4faa01111c044910A184553';

const web3Provider = new Web3.providers.HttpProvider(provider);
const web3 = new Web3(web3Provider);

const WETH_Contract = new web3.eth.Contract(ERC20Contracts.abi, WETH_Address);
const USDT_Contract = new web3.eth.Contract(ERC20Contracts.abi, USDT_Address);

async function Uni_ETH_Price() {
    const balance_USDT = await USDT_Contract.methods.balanceOf(Uniswap_Address).call();
    const balance_ETH = await WETH_Contract.methods.balanceOf(Uniswap_Address).call();

    const WETH_price = (balance_USDT / Math.pow(10, 6)) / (balance_ETH / Math.pow(10, 18));

    return WETH_price;
}

async function Sushi_ETH_Price() {
    const balance_USDT = await USDT_Contract.methods.balanceOf(Sushi_Address).call();
    const balance_ETH = await WETH_Contract.methods.balanceOf(Sushi_Address).call();

    const WETH_price = (balance_USDT / Math.pow(10, 6)) / (balance_ETH / Math.pow(10, 18));

    return WETH_price;
}

module.exports = {
    Uni_ETH_Price,
    Sushi_ETH_Price,
};
