import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button, Icon, Header, Table } from "semantic-ui-react";
import Layout from "../../../../components/Layout";
import crowdfund from "../../../../crowdfund-solidity/crowdfund";
import web3 from "../../../../crowdfund-solidity/web3";


const CampaignRequest = ({ campaignAddress, campaignRequests, manager }) => {
    const [userAddress, setUserAddress] = useState("");
    const [numApprovers, setNumApprovers] = useState(0);

    useEffect(() => {
        const loadUser = async () => {
            const accounts = await crowdfund.getAccounts();
            setUserAddress(accounts[0]);
            setNumApprovers(await crowdfund.getNumApprovers(campaignAddress));
        }
        loadUser();
    });

    const renderNewRequestJSX = () => {
        return (
            <Link href={`/campaigns/${campaignAddress}/requests/new`}>
                <Button fluid primary animated="fade">
                    <Button.Content visible>New Request</Button.Content>
                    <Button.Content hidden><Icon name='add circle' /></Button.Content>
                </Button>
            </Link>            
        );
    }

    return (
        <Layout>
            <Header as="h1" content='Fund Requests' subheader={`The requests for the campaign with address ${campaignAddress}`} icon="shekel sign" dividing />
            {userAddress === manager ? renderNewRequestJSX() : null}
            <Table textAlign="center" color='blue' >
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Recipient</Table.HeaderCell>
                        <Table.HeaderCell>Amount</Table.HeaderCell>
                        <Table.HeaderCell>Approvals</Table.HeaderCell>
                        <Table.HeaderCell>Approve</Table.HeaderCell>
                        <Table.HeaderCell>Complete Request</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {campaignRequests.map((request, index) => (
                        <Table.Row disabled={request[5]} key={request[0]}>
                            <Table.Cell>{index + 1}</Table.Cell>
                            <Table.Cell>{request[1]}</Table.Cell>
                            <Table.Cell>{request[0]}</Table.Cell>
                            <Table.Cell>{web3.utils.fromWei(request[2])} ETH</Table.Cell>
                            <Table.Cell>{`${request[3]}/${numApprovers}`}</Table.Cell>
                            <Table.Cell selectable>{request[4]}</Table.Cell>
                            <Table.Cell selectable></Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
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