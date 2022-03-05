import React, { useEffect, useState } from 'react';
import CrowdfundWrapper from '../crowdfund-solidity/crowdfund';

const Index = (props) => {

    return (
        <div>
            <h1>Home page. WAGMI!!!</h1>
            <p>{props.campaigns}</p>
        </div>

    );
}

Index.getInitialProps = async () => {
    const crowdfund = new CrowdfundWrapper();
    const campaigns = await crowdfund.getCampaigns();
    return {campaigns};
}

export default Index;