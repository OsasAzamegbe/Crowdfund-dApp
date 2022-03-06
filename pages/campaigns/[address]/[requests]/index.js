import React from "react";
import Layout from "../../../../components/Layout";
import crowdfund from "../../../../crowdfund-solidity/crowdfund";


const CampaignRequest = (props) => {

    return (
        <Layout>
            {props.address}
            {props.campaignRequests}
        </Layout>
    );
}

CampaignRequest.getInitialProps = async (props) => {
    const address = props.query.address;
    const campaignRequests = await crowdfund.getCampaignRequests(address);
    return { campaignRequests, address };
}

export default CampaignRequest;