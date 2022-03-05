import React, { useState } from "react";
import Layout from "../../components/Layout";
import { Button, Form, Input, Message, Modal } from "semantic-ui-react";
import CrowdfundWrapper from "../../crowdfund-solidity/crowdfund";
import { useRouter } from "next/router";


const Create = () => {
    const [minimumContribution, setMinimumContribution] = useState("");
    const [target, setTarget] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [campaignId, setCampaignId] = useState(0);

    const router = useRouter();

    const crowdfund = new CrowdfundWrapper();

    const displayError = (error) => {
        setErrorMessage(error);
        setTimeout(() => {
            setErrorMessage("");
        }, 10000);
    }

    // handlers
    const minimumContributionHandler = (event) => {
        setMinimumContribution(event.target.value);
    }

    const targetHandler = (event) => {
        setTarget(event.target.value);
    }

    const createCampaignHandler = async (event) => {
        event.preventDefault();
        if (target === '0') {
            displayError('Your campaign goal should not be zero :(');
            return;
        }
        if (target < minimumContribution) {
            displayError('The minimum contribution to your campaign should not be greater than your target!');
            return;
        }

        setLoading(true);
        setErrorMessage("");
        try {
            const txnObj = await crowdfund.createCampaign(minimumContribution, target);
            setCampaignId(txnObj.events.CampaignIdEvent.returnValues.campaignId);
            setTarget("");
            setMinimumContribution("");
            setSuccessMessage('Campaign was created successfully!');
        } catch (error) {
            displayError(error.message);
        }
        setLoading(false);
    }

    const modalCloseHandler = async () => {
        setSuccessMessage("");
        const campaignAddress = await crowdfund.getCampaign(campaignId);
        router.push(`/campaigns/${campaignAddress}`);
    }

    return (
        <Layout>
            <Form onSubmit={createCampaignHandler} error={!!errorMessage}>
                <Modal
                    open={!!successMessage}
                    header='Success!'
                    content={successMessage}
                    closeIcon
                    onClose={modalCloseHandler}
                />
                <Message error header="Ouch! An error occured" content={errorMessage} />
                <Form.Field>
                    <label>Minimum contribution</label>
                    <Input
                        type="number"
                        step="0.000001"
                        placeholder="minimum contribution"
                        label="ETH" labelPosition="right"
                        required
                        value={minimumContribution}
                        onChange={minimumContributionHandler}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Fund target</label>
                    <Input
                        type="number"
                        step="0.000001"
                        placeholder="target"
                        label="ETH"
                        labelPosition="right"
                        required
                        value={target}
                        onChange={targetHandler}
                    />
                </Form.Field>
                <Button loading={loading} primary>Create</Button>
            </Form>
        </Layout>
    );
}

export default Create;