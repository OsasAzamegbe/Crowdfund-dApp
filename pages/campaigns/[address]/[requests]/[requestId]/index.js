import React from "react";
import { Header } from "semantic-ui-react";
import Layout from "../../../../../components/Layout";
import crowdfund from "../../../../../crowdfund-solidity/crowdfund";


const CampaignRequest = ({
    campaignAddress,
    recipient,
    description,
    amount,
    numApprovals,
    isApproved,
    isCompleted
}) => {

    return (
        <Layout>
            <Header as="h1" content={campaignAddress} subheader="The campaign address" icon="shekel sign" dividing />
        </Layout>
    );
}

CampaignRequest.getInitialProps = async (props) => {
    const campaignAddress = props.query.address;
    const requestId = props.query.requestId;
    const campaignRequest = await crowdfund.getCampaignRequest(campaignAddress, requestId);
    console.log(campaignRequest);
    return {
        campaignAddress,
        ...campaignRequest
    };
}

export default CampaignRequest;