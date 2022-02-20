import React, { useEffect, useState } from 'react';
import CrowdfundWrapper from '../crowdfund-solidity/crowdfund';

const Index = () => {
    const [campaigns, setCampaigns] = useState([]);

    const crowdfund = new CrowdfundWrapper();

    useEffect(() => {
        const loadCrowdfundState = async () => {
            setCampaigns(await crowdfund.getCampaigns());
        }
        loadCrowdfundState();
    }, []);

    return (
        <div>
            <h1>Home page. WAGMI!!!</h1>
            <p>{campaigns}</p>
        </div>

    );
}

export default Index;