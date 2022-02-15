require('dotenv').config();
const HdWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { Crowdfund } = require('./build/Crowdfund.json');

const deploy = async () => {
    const accountProvider = new HdWalletProvider(
        process.env.ACCOUNT_MNEMONIC,
        process.env.INFURA_RINKEBY_ENDPOINT
    );
    const web3 = new Web3(accountProvider);

    console.log('Getting accounts from provider...');
    const accounts = await web3.eth.getAccounts();

    console.log('Deploying contract with ABI:', JSON.stringify(Crowdfund.abi));
    console.log('Using account:', accounts[0]);
    const deployedContract = await new web3.eth
        .Contract(Crowdfund.abi)
        .deploy({ data: Crowdfund.evm.bytecode.object })
        .send({ from: accounts[0], gas: '10000000' });

    console.log('Deployed contract to address:', deployedContract.options.address);
    accountProvider.engine.stop();
}

deploy();
