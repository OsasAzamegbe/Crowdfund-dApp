const { Crowdfund, Campaign } = require('../build/Crowdfund.json');

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { beforeEach } = require('mocha');


let accounts, campaign, manager;
const BASE_GAS = '10000000';
const web3 = new Web3(ganache.provider({ gasLimit: BASE_GAS }));

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    manager = accounts[0];
    crowdfundContract = await new web3.eth.Contract(Crowdfund.abi)
        .deploy({ data: Crowdfund.evm.bytecode.object })
        .send({ from: manager, gas: BASE_GAS });

    const obj = await crowdfundContract.methods
        .createCampaign(web3.utils.toWei('0.00001', 'ether'), web3.utils.toWei('10', 'ether'))
        .send({ from: manager, gas: BASE_GAS });
    const campaignId = obj.events.CampaignIdEvent.returnValues.campaignId;
    const campaignAddress = await crowdfundContract.methods.campaigns(campaignId).call();
    campaign = await new web3.eth.Contract(Campaign.abi, campaignAddress);
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
            .send({ from: manager, gas: BASE_GAS });
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
            .send({ from: manager, value: contribution });

        //then
        const campaignBalance = await web3.eth.getBalance(campaign.options.address);

        assert.equal(contribution, campaignBalance);
    });

    it('Campaign contribution left account balance', async () => {
        //given
        const contribution = web3.utils.toWei('0.1', 'ether');
        const oldBalance = await web3.eth.getBalance(manager);

        //when
        await campaign.methods.contributeToCampaign()
            .send({ from: manager, value: contribution });

        //then
        const balanceChange = oldBalance - await web3.eth.getBalance(manager);
        assert(balanceChange > contribution);
    });

    it('Campaign request created successfully', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: manager, value: web3.utils.toWei('1', 'ether') });
        const description = "pay vendor for test";
        const vendor = accounts[1];
        const amount = web3.utils.toWei('0.1', 'ether');

        //when
        await campaign.methods.createCampaignRequest(vendor, description, amount)
            .send({ from: manager, gas: BASE_GAS });

        //then
        const campaignRequests = await campaign.methods.getCampaignRequests().call();
        assert.equal(1, campaignRequests.length);
        assert.equal(description, campaignRequests[0].description);
        assert.equal(vendor, campaignRequests[0].recipient);
        assert.equal(amount, campaignRequests[0].amount);
    });

    it('Multiple Campaign requests created successfully', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: manager, value: web3.utils.toWei('1', 'ether') });

        //when
        await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test 1", web3.utils.toWei('0.1', 'ether'))
            .send({ from: manager, gas: BASE_GAS });
        await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test 2", web3.utils.toWei('0.1', 'ether'))
            .send({ from: manager, gas: BASE_GAS });
        await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test 3", web3.utils.toWei('0.1', 'ether'))
            .send({ from: manager, gas: BASE_GAS });

        //then
        const campaignRequests = await campaign.methods.getCampaignRequests().call();
        assert.equal(3, campaignRequests.length);
    });
});

