import web3 from "./web3";
import compiled from "./build/Crowdfund.json";


class CrowdfundWrapper {
    m_crowdfund;
    m_address;

    constructor() {
        this.m_address = process.env.NEXT_PUBLIC_CROWDFUND_CONTRACT_ADDRESS;
        this.m_crowdfund = new web3.eth.Contract(compiled.Crowdfund.abi, this.m_address);
    }

    async getCampaigns() {
        return await this.m_crowdfund.methods.getCampaigns().call();
    }

    async createCampaign(mincontribution, target) {
        mincontribution = web3.utils.toWei(mincontribution, 'ether');
        target = web3.utils.toWei(target, 'ether');
        const accounts = await web3.eth.getAccounts();
        return await this.m_crowdfund.methods.createCampaign(mincontribution, target).send({ from: accounts[0] });
    }
}

export default CrowdfundWrapper;