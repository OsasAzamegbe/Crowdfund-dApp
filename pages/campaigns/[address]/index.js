import React from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { Button, Card, Container, Header } from "semantic-ui-react";
import Link from "next/link";


const AdressIndex = () => {
    const router = useRouter();
    const { address } = router.query;
    const cardItems = [
        {
            header: "nadnvoapndvo",
            description: "The manager started this campaign and can create fund requests for withdrawals and payouts.",
            meta: "Manager's Address",
            key: 0
        },
        {
            header: "3 ETH",
            description: "This is the target fund this campaign has set.",
            meta: "Goal",
            key: 1
        },
        {
            header: "0.000001 ETH",
            description: "The minimum contribution you would have to make to be an approver for this campaign. You can still contribute less money, but you won't have approver priviledges.",
            meta: "Minimum Contribution",
            key: 2
        },
        {
            header: "0.002 ETH",
            description: "The current balance of the campaign.",
            meta: "Balance",
            key: 3
        },
        {
            header: "23",
            description: "The number of approvers this campaign currently has.",
            meta: "Approvers",
            key: 4
        },
        {
            header: "4",
            description: "The number of fund requests this campaign currently has.",
            meta: "Campaign Requests",
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
            {renderCampaignCards()}
            <Link href={`/campaigns/${address}/requests`}><Button primary>View Requests</Button></Link>
        </Layout>
    );
}

export default AdressIndex;