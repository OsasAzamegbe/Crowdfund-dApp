const { Crowdfund, Campaign } = require('../build/Crowdfund.json');

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { beforeEach } = require('mocha');


let accounts, campaign;
const BASE_GAS = '10000000';
const web3 = new Web3(ganache.provider({ gasLimit: BASE_GAS }));

const createCampaign = async (account) => {
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
    await createCampaign(accounts[0]);
});

describe('Crowdfund Test', () => {
    it('Crowdfund contract is deployed', () => {
        assert.ok(crowdfundContract.options.address);
    });

    it('Campaign created', () => {
        assert.ok(campaign.options.address);
    });

    it('Multiple Campaigns can be created', async () => {
        await crowdfundContract.methods
            .createCampaign(web3.utils.toWei('0.00001', 'ether'), web3.utils.toWei('10', 'ether'))
            .send({ from: accounts[0], gas: BASE_GAS });
        await crowdfundContract.methods
            .createCampaign(web3.utils.toWei('0.00001', 'ether'), web3.utils.toWei('10', 'ether'))
            .send({ from: accounts[1], gas: BASE_GAS });
        await crowdfundContract.methods
            .createCampaign(web3.utils.toWei('0.00001', 'ether'), web3.utils.toWei('10', 'ether'))
            .send({ from: accounts[2], gas: BASE_GAS });
        await crowdfundContract.methods
            .createCampaign(web3.utils.toWei('0.00001', 'ether'), web3.utils.toWei('10', 'ether'))
            .send({ from: accounts[3], gas: BASE_GAS });

        const campaigns = await crowdfundContract.methods.getCampaigns().call();
        assert.equal(5, campaigns.length); // including campaign created in beforeEach()
    });

    it('Campaign contribution successful', async () => {
        //given
        const contribution = web3.utils.toWei('1', 'ether');

        //when
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[0], value: contribution });

        //then
        const campaignBalance = await web3.eth.getBalance(campaign.options.address);

        assert.equal(contribution, campaignBalance);
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

    it('Multiple Campaign requests created successfully', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[0], value: web3.utils.toWei('1', 'ether') });

        //when
        await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test 1", web3.utils.toWei('0.1', 'ether'))
            .send({ from: accounts[0], gas: BASE_GAS });
        await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test 2", web3.utils.toWei('0.1', 'ether'))
            .send({ from: accounts[0], gas: BASE_GAS });
        await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test 3", web3.utils.toWei('0.1', 'ether'))
            .send({ from: accounts[0], gas: BASE_GAS });

        //then
        const campaignRequests = await campaign.methods.getCampaignRequests().call();
        assert.equal(3, campaignRequests.length);
    });
});

