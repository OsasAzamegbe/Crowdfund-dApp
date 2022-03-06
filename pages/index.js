import React, { useEffect, useState } from 'react';
import crowdfund from '../crowdfund-solidity/crowdfund';
import { Button, Card, Icon } from 'semantic-ui-react';
import Layout from '../components/Layout';
import Link from 'next/link';


const Index = (props) => {
    const renderCampaigns = () => (
        <Card.Group>
        {props.campaigns.map(address => {
            return <Card
                fluid
                raised
            >
                <Card.Content
                    header={address}
                    description={<Link href={`/campaigns/${address}`}>View Campaign</Link>}
                    textAlign="center"
                />
            </Card>
        })}
    </Card.Group>
    );

    return (
        <Layout>
            <div>
                <h1> Campaigns</h1>
                <Link href="campaigns/create">
                    <Button primary animated='fade' floated='right'>
                        <Button.Content visible>New Campaign</Button.Content>
                        <Button.Content hidden><Icon name='add circle'/></Button.Content>
                    </Button>
                </Link>
                {renderCampaigns()}
            </div>
        </Layout>
    );
}

Index.getInitialProps = async () => {
    const campaigns = await crowdfund.getCampaigns();
    return {campaigns};
}

export default Index;