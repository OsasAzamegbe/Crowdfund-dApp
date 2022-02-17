const { Crowdfund, Campaign } = require('../build/Crowdfund.json');

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { beforeEach } = require('mocha');


let accounts, campaign, manager;
const BASE_GAS = '10000000';
const web3 = new Web3(ganache.provider({ gasLimit: BASE_GAS }));
const MIN_CONTRIBUTION_FOR_APPROVER = web3.utils.toWei('0.00001', 'ether');

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    manager = accounts[0];
    crowdfundContract = await new web3.eth.Contract(Crowdfund.abi)
        .deploy({ data: Crowdfund.evm.bytecode.object })
        .send({ from: manager, gas: BASE_GAS });

    const obj = await crowdfundContract.methods
        .createCampaign(MIN_CONTRIBUTION_FOR_APPROVER, web3.utils.toWei('10', 'ether'))
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

    it('Cmapaign manager is correct', async() => {
        const campaignManager = await campaign.methods.manager().call();
        assert.equal(manager, campaignManager);
    });

    it('Multiple Campaigns can be created', async () => {
        await crowdfundContract.methods
            .createCampaign(MIN_CONTRIBUTION_FOR_APPROVER, web3.utils.toWei('10', 'ether'))
            .send({ from: manager, gas: BASE_GAS });
        await crowdfundContract.methods
            .createCampaign(MIN_CONTRIBUTION_FOR_APPROVER, web3.utils.toWei('10', 'ether'))
            .send({ from: accounts[1], gas: BASE_GAS });
        await crowdfundContract.methods
            .createCampaign(MIN_CONTRIBUTION_FOR_APPROVER, web3.utils.toWei('10', 'ether'))
            .send({ from: accounts[2], gas: BASE_GAS });
        await crowdfundContract.methods
            .createCampaign(MIN_CONTRIBUTION_FOR_APPROVER, web3.utils.toWei('10', 'ether'))
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
        const numApprovers = await campaign.methods.numApprovers().call();

        assert.equal(contribution, campaignBalance);
        assert.equal(1, numApprovers);
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

    it('Campaign contribution below approver limit successful', async () => {
        //given
        const contribution = web3.utils.toWei('0.000001', 'ether');

        //when
        await campaign.methods.contributeToCampaign()
            .send({ from: manager, value: contribution });

        //then
        const campaignBalance = await web3.eth.getBalance(campaign.options.address);
        const numApprovers = await campaign.methods.numApprovers().call();

        assert.equal(contribution, campaignBalance);
        assert.equal(0, numApprovers);
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
        const numRequests = await campaign.methods.numRequests().call();
        assert.equal(1, campaignRequests.length);
        assert.equal(1, numRequests);
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
        const numRequests = await campaign.methods.numRequests().call();
        assert.equal(3, campaignRequests.length);
        assert.equal(3, numRequests);
    });

    it('Non-manager cannot create campaign request', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[2], value: web3.utils.toWei('1', 'ether') });
        const description = "pay vendor for test";
        const vendor = accounts[1];
        const amount = web3.utils.toWei('0.1', 'ether');
        let failed = false;

        //when
        try {
            await campaign.methods.createCampaignRequest(vendor, description, amount)
                .send({ from: accounts[2], gas: BASE_GAS });
        } catch (error) {
            failed = true;
            assert.ok(error);
        }

        //then
        const campaignRequests = await campaign.methods.getCampaignRequests().call();
        assert.equal(0, campaignRequests.length);
        assert(failed);
    });    

    it('Cannot create campaign request with amount greater than campaign balance', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[2], value: web3.utils.toWei('1', 'ether') });
        const description = "pay vendor for test";
        const vendor = accounts[1];
        const amount = web3.utils.toWei('10', 'ether');
        let failed = false;

        //when
        try {
            await campaign.methods.createCampaignRequest(vendor, description, amount)
                .send({ from: manager, gas: BASE_GAS });
        } catch (error) {
            failed = true;
            assert.ok(error);
        }

        //then
        const campaignRequests = await campaign.methods.getCampaignRequests().call();
        assert.equal(0, campaignRequests.length);
        assert(failed);
    });

    it('Can approve campaign request', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[2], value: web3.utils.toWei('1', 'ether') });

        //when
        const responseObj = await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test", web3.utils.toWei('0.1', 'ether'))
            .send({ from: manager, gas: BASE_GAS });
        const requestId = responseObj.events.RequestIdEvent.returnValues.requestId;
        await campaign.methods.approveCampaignRequest(requestId).send({ from: accounts[2], gas: BASE_GAS });

        //then
        const campaignRequest = await campaign.methods.requests(requestId).call();
        assert.equal(1, campaignRequest.numApprovals);
        assert(campaignRequest.isApproved);
        assert(!campaignRequest.isCompleted);
    });

    it('Manager can complete approved campaign request', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[2], value: web3.utils.toWei('1', 'ether') });

        //when
        const responseObj = await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test", web3.utils.toWei('0.1', 'ether'))
            .send({ from: manager, gas: BASE_GAS });
        const requestId = responseObj.events.RequestIdEvent.returnValues.requestId;
        await campaign.methods.approveCampaignRequest(requestId).send({ from: accounts[2], gas: BASE_GAS });
        await campaign.methods.completeCampaignRequest(requestId).send({ from: manager, gas: BASE_GAS });

        //then
        const campaignRequest = await campaign.methods.requests(requestId).call();
        assert.equal(1, campaignRequest.numApprovals);
        assert(campaignRequest.isApproved);
        assert(campaignRequest.isCompleted);
    });

    it('Non-manager cannot complete approved campaign request', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[2], value: web3.utils.toWei('1', 'ether') });
        let failed = false;

        //when
        const responseObj = await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test", web3.utils.toWei('0.1', 'ether'))
            .send({ from: manager, gas: BASE_GAS });
        const requestId = responseObj.events.RequestIdEvent.returnValues.requestId;
        await campaign.methods.approveCampaignRequest(requestId).send({ from: accounts[2], gas: BASE_GAS });
        try {
            await campaign.methods.completeCampaignRequest(requestId).send({ from: accounts[2], gas: BASE_GAS });
        } catch(error) {
            assert.ok(error);
            failed = true;
        }

        //then
        const campaignRequest = await campaign.methods.requests(requestId).call();
        assert.equal(1, campaignRequest.numApprovals);
        assert(campaignRequest.isApproved);
        assert(!campaignRequest.isCompleted);
        assert(failed);
    });

    it('Manager cannot complete non-approved campaign request', async () => {
        //given
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[1], value: web3.utils.toWei('0.2', 'ether') });
        await campaign.methods.contributeToCampaign()
            .send({ from: accounts[2], value: web3.utils.toWei('0.3', 'ether') });
        let failed = false;

        //when
        const responseObj = await campaign.methods.createCampaignRequest(accounts[1], "pay vendor for test", web3.utils.toWei('0.1', 'ether'))
            .send({ from: manager, gas: BASE_GAS });
        const requestId = responseObj.events.RequestIdEvent.returnValues.requestId;
        await campaign.methods.approveCampaignRequest(requestId).send({ from: accounts[2], gas: BASE_GAS });
        try {
            await campaign.methods.completeCampaignRequest(requestId).send({ from: manager, gas: BASE_GAS });
        } catch(error) {
            assert.ok(error);
            failed = true;
        }

        //then
        const campaignRequest = await campaign.methods.requests(requestId).call();
        const numApprovers = await campaign.methods.numApprovers().call();
        assert.equal(1, campaignRequest.numApprovals);
        assert.equal(2, numApprovers);
        assert(!campaignRequest.isApproved);
        assert(!campaignRequest.isCompleted);
        assert(failed);
    });
});

