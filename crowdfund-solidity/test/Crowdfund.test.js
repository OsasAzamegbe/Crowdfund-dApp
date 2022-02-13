const { Crowdfund, Campaign } = require('../compile');

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { beforeEach } = require('mocha');


let crowdfundContract, accounts, campaign;
const BASE_GAS = '10000000';
const web3 = new Web3(ganache.provider({gasLimit: BASE_GAS}));

const createCampaign = async (crowdfundContract, account) => {
    await crowdfundContract.methods
        .createCampaign(web3.utils.toWei('0.00001', 'ether'), web3.utils.toWei('10', 'ether'))
        .send({ from: account, gas: BASE_GAS });
    const campaignAddress = await crowdfundContract.methods.campaigns(0).call();
    campaign = await new web3.eth.Contract(Campaign.abi, campaignAddress);
}

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    crowdfundContract = await new web3.eth.Contract(Crowdfund.abi)
        .deploy({ data: Crowdfund.evm.bytecode.object })
        .send({ from: accounts[0], gas: BASE_GAS });
    createCampaign(crowdfundContract, accounts[0]);
});

describe('Crowdfund Test', () => {
    it('Crowdfund contract is deployed', () => {
        assert.ok(crowdfundContract.options.address);
    });

    it('Campaign created', () => {
        assert.ok(campaign.options.address);
    });

    it('Campaign contribution successful', async () => {
        //given
        const contribution = web3.utils.toWei('1', 'ether');

        //when
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[0], value: contribution });

        //then
        const campaignBalance = await web3.eth.getBalance(campaign.options.address);

        assert.equal(campaignBalance, contribution);
    });

    it('Campaign contribution left account balance', async () => {
        //given
        const contribution = web3.utils.toWei('0.1', 'ether');
        const oldBalance = await web3.eth.getBalance(accounts[0]);

        //when
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[0], value: contribution });

        //then
        const balanceChange = oldBalance - await web3.eth.getBalance(accounts[0]);
        assert(balanceChange > contribution);
    });
});

