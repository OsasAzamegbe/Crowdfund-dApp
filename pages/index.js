import React, { useEffect, useState } from 'react';
import CrowdfundWrapper from '../crowdfund-solidity/crowdfund';
import { Card } from 'semantic-ui-react';

const Index = (props) => {

    return (
        <div>
            <link
                async
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css"
            />
            <h1>Home page. WAGMI!!!</h1>
            <Card.Group>
                {props.campaigns.map(address => {
                    return <Card
                        header={address}
                        description={<a>View Campaign</a>}
                        fluid={true}
                    />
                })}
            </Card.Group>
        </div>

    );
}

Index.getInitialProps = async () => {
    const crowdfund = new CrowdfundWrapper();
    const campaigns = await crowdfund.getCampaigns();
    return {campaigns};
}

export default Index;