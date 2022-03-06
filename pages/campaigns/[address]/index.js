import React from "react";
import Layout from "../../../components/Layout";
import { Button, Card, Container, Grid, Header, Segment } from "semantic-ui-react";
import Link from "next/link";
import ContributeForm from "../../../components/ContributeForm";
import crowdfund from "../../../crowdfund-solidity/crowdfund";


const AddressIndex = ({
    address,
    manager,
    minContribution,
    target,
    balance,
    numApprovers,
    numRequests
}) => {
    const cardItems = [
        {
            header: manager,
            description: "The manager started this campaign and can create fund requests for withdrawals and payouts.",
            meta: "Manager's Address",
            raised: true,
            key: 0,
            style: { overflowWrap: 'break-word' }
        },
        {
            header: `${target} ETH`,
            description: "This is the target fund this campaign has set.",
            meta: "Goal",
            raised: true,
            key: 1
        },
        {
            header: `${minContribution} ETH`,
            description: "The minimum contribution you would have to make to be an approver for this campaign. You can still contribute less money, but you won't have approver priviledges.",
            meta: "Minimum Contribution",
            raised: true,
            key: 2
        },
        {
            header: `${balance} ETH`,
            description: "The current balance of the campaign.",
            meta: "Balance",
            raised: true,
            key: 3
        },
        {
            header: numApprovers,
            description: "The number of approvers this campaign currently has.",
            meta: "Approvers",
            raised: true,
            key: 4
        },
        {
            header: numRequests,
            description: "The number of fund requests this campaign currently has.",
            meta: "Campaign Requests",
            raised: true,
            key: 5
        }
    ]

    const renderCampaignCards = () => {
        return (
            <Container>
                <Card.Group items={cardItems} />
            </Container>
        );
    }

    return (
        <Layout>
            <Header as="h1" content={address} subheader="The campaign address" icon="shekel sign" dividing />
            <Grid doubling stackable stretched>
                <Grid.Row>
                    <Grid.Column width={10}>
                        {renderCampaignCards()}
                    </Grid.Column>
                    <Grid.Column width={6}>
                        <Grid.Row stretched>
                            <ContributeForm address={address} />
                        </Grid.Row>
                        <Grid.Row verticalAlign="bottom">
                            <Link href={`/campaigns/${address}/requests`}><Button fluid primary>View Requests</Button></Link>
                        </Grid.Row>                    
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Layout>
    );
}

AddressIndex.getInitialProps = async (props) => {
    const address = props.query.address;
    const campaignDetails = await crowdfund.getCampaignDetails(address);
    return {
        address,
        ...campaignDetails
    };
}

export default AddressIndex;