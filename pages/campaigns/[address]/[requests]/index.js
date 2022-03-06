import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../../../components/Layout";
import crowdfund from "../../../../crowdfund-solidity/crowdfund";


const CampaignRequest = () => {
    const [campaignRequests, setCampaignRequests] = useState([]);

    const router = useRouter();
    const { address } = router.query;

    useEffect(() => {
        const setInitState = async () => {
            if (typeof address !== 'undefined') {
                setCampaignRequests(await crowdfund.getCampaignRequests(address));
            }
        }
        setInitState();
    }, [address]);

    return (
        <Layout>
            {address}
            {campaignRequests}
        </Layout>
    );
}

export default CampaignRequest;