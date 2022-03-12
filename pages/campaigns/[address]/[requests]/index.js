import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button, Icon } from "semantic-ui-react";
import Layout from "../../../../components/Layout";
import crowdfund from "../../../../crowdfund-solidity/crowdfund";


const CampaignRequest = ({ campaignAddress, campaignRequests, manager }) => {
    const [userAddress, setUserAddress] = useState("");

    useEffect(() => {
        const loadUser = async () => {
            const accounts = await crowdfund.getAccounts();
            setUserAddress(accounts[0]);
        }
        loadUser();
    });

    const renderNewRequestJSX = () => {
        return (
            <Link href={`/campaigns/${campaignAddress}/requests`}>
                <Button fluid primary animated="fade">
                    <Button.Content visible>New Request</Button.Content>
                    <Button.Content hidden><Icon name='add circle' /></Button.Content>
                </Button>
            </Link>
        );
    }

    return (
        <Layout>
            {campaignAddress}
            {campaignRequests}
            {userAddress === manager ? renderNewRequestJSX() : null}
        </Layout>
    );
}

CampaignRequest.getInitialProps = async (props) => {
    const campaignAddress = props.query.address;
    const campaignRequests = await crowdfund.getCampaignRequests(campaignAddress);
    const manager = await crowdfund.getManager(campaignAddress);
    return { campaignRequests, campaignAddress, manager };
}

export default CampaignRequest;