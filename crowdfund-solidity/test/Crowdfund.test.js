const { abi, evm } = require('../compile');

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { beforeEach } = require('mocha');


let crowdfundContract, accounts, campaignId;
const web3 = new Web3(ganache.provider());
const BASE_GAS = '1000000';

const createCampaign = async (crowdfundContract, account) => {
    const txnObj = await crowdfundContract.methods
        .createCampaign(web3.utils.toWei('0.00001', 'ether'), web3.utils.toWei('10', 'ether'))
        .send({ from: account, gas: BASE_GAS });
    campaignId = txnObj.events.CampaignIdEvent.returnValues.campaignId;
}

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    crowdfundContract = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: BASE_GAS });
    createCampaign(crowdfundContract, accounts[0]);
});

describe('Crowdfund Test', () => {
    it('Crowdfund contract is deployed', () => {
        assert.ok(crowdfundContract.options.address);
    });

    it('Campaign created', () => {
        assert.ok(campaignId);
        assert(!isNaN(campaignId));
    });

    it('Campaign contribution successful', async () => {
        //given
        const contribution = web3.utils.toWei('1', 'ether');
        const oldBalance = await crowdfundContract.methods.getCampaignBalance(campaignId).call();

        //when
        await crowdfundContract.methods.contributeToCampaign(campaignId)
            .send({ from: accounts[0], gas: BASE_GAS, value: contribution });

        //then
        const newBalance = await crowdfundContract.methods.getCampaignBalance(campaignId).call();
        assert.equal(newBalance - oldBalance, contribution);
    });

    it('Campaign contribution left account balance', async () => {
        //given
        const contribution = web3.utils.toWei('0.1', 'ether');
        const oldBalance = await web3.eth.getBalance(accounts[0]);

        //when
        await crowdfundContract.methods.contributeToCampaign(campaignId)
            .send({ from: accounts[0], BASE_GAS, value: contribution });

        //then
        const balanceChange = oldBalance - await web3.eth.getBalance(accounts[0]);
        assert(balanceChange > contribution);
    });
});

