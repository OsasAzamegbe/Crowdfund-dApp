const { abi, evm } = require('../compile');

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { beforeEach } = require('mocha');


let crowdfundContract, accounts;
const web3 = new Web3(ganache.provider());

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    crowdfundContract = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Crowdfund Test', () => {
    it('Crowdfund contract is deployed', () => {
        assert.ok(crowdfundContract.options.address);
    });
});

