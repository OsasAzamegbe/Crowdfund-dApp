import web3 from "./web3";
import compiled from "./build/Crowdfund.json";


class CrowdfundWrapper {
    m_crowdfund;
    m_address;

    constructor() {
        this.m_address = process.env.NEXT_PUBLIC_CROWDFUND_CONTRACT_ADDRESS;
        this.m_crowdfund = new web3.eth.Contract(compiled.Crowdfund.abi, this.m_address);
    }

    async getAccounts() {
        return await web3.eth.getAccounts();
    }

    async getCampaigns() {
        return await this.m_crowdfund.methods.getCampaigns().call();
    }

    async createCampaign(mincontribution, target) {
        mincontribution = web3.utils.toWei(mincontribution, 'ether');
        target = web3.utils.toWei(target, 'ether');
        const accounts = await this.getAccounts();
        return await this.m_crowdfund.methods.createCampaign(mincontribution, target).send({ from: accounts[0] });
    }

    async getCampaign(campaignId) {
        return await this.m_crowdfund.methods.campaigns(campaignId).call();
    }

    getCampaignContract(campaignAddress) {
        return new web3.eth.Contract(compiled.Campaign.abi, campaignAddress);
    }

    async getBalance(campaignAddress) {
        const campaign = this.getCampaignContract(campaignAddress);
        return web3.utils.fromWei(await web3.eth.getBalance(campaign.options.address), 'ether');
    }

    async getCampaignDetails(campaignAddress) {
        const campaign = this.getCampaignContract(campaignAddress);
        const manager = await campaign.methods.manager().call();
        const minContribution = web3.utils.fromWei(await campaign.methods.minContributionForApprover().call(), 'ether');
        const target = web3.utils.fromWei(await campaign.methods.target().call(), 'ether');
        const numRequests = await campaign.methods.numRequests().call();
        const numApprovers = await campaign.methods.numApprovers().call();
        const balance = web3.utils.fromWei(await web3.eth.getBalance(campaign.options.address), 'ether');

        return {
            manager,
            minContribution,
            target,
            balance,
            numApprovers,
            numRequests
        }
    }

    async getCampaignRequests(campaignAddress) {
        const campaign = this.getCampaignContract(campaignAddress);
        return await campaign.methods.getCampaignRequests().call();
    }

    async getCampaignRequest(campaignAddress, requestId) {
        const campaign = this.getCampaignContract(campaignAddress);
        return await campaign.methods.requests(requestId).call();
    }

    async contributeToCampaign(campaignAddress, contribution) {
        contribution = web3.utils.toWei(contribution, 'ether');
        const campaign = this.getCampaignContract(campaignAddress);
        const accounts = await this.getAccounts();
        return await campaign.methods.contributeToCampaign().send({ from: accounts[0], value: contribution });
    }

    async getManager(campaignAddress) {
        const campaign = this.getCampaignContract(campaignAddress);
        return await campaign.methods.manager().call();
    }

    async createCampaignRequest(campaignAddress, recipientAddress, description, amount) {
        const campaign = this.getCampaignContract(campaignAddress);
        const accounts = await this.getAccounts();
        amount = web3.utils.toWei(amount, 'ether');
        return await campaign.methods.createCampaignRequest(recipientAddress, description, amount).send({ from: accounts[0] });
    }
}

export default new CrowdfundWrapper();