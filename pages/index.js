import React, { useEffect, useState } from 'react';
import CrowdfundWrapper from '../crowdfund-solidity/crowdfund';
import { Button, Card, Icon } from 'semantic-ui-react';
import Layout from '../components/Layout';


const Index = (props) => {

    return (
        <Layout>
            <div>
                <h1>Current Campaigns</h1>
                <Card.Group>
                    {props.campaigns.map(address => {
                        return <Card
                            fluid
                            raised
                        >
                            <Card.Content
                                header={address}
                                description={<a>View Campaign</a>}
                                textAlign="center"
                            />
                        </Card>
                    })}
                </Card.Group>
                <Button primary animated='fade'>
                    <Button.Content visible>New Campaign</Button.Content>
                    <Button.Content hidden><Icon name='add circle'/></Button.Content>
                </Button>
            </div>
        </Layout>
    );
}

Index.getInitialProps = async () => {
    const crowdfund = new CrowdfundWrapper();
    const campaigns = await crowdfund.getCampaigns();
    return {campaigns};
}

export default Index;