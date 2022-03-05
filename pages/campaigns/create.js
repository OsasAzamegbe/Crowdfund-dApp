import React, { useState } from "react";
import Layout from "../../components/Layout";
import { Button, Form, Input, Message } from "semantic-ui-react";
import CrowdfundWrapper from "../../crowdfund-solidity/crowdfund";


const Create = () => {
    const [minimumContribution, SetMinimumContribution] = useState("");
    const [target, SetTarget] = useState("");
    const [errorMessage, SetErrorMessage] = useState("");

    const displayError = (error) => {
        SetErrorMessage(error);
        setTimeout(() => {
            SetErrorMessage("");
        }, 10000);
    }

    // handlers
    const minimumContributionHandler = (event) => {
        SetMinimumContribution(event.target.value);
    }

    const targetHandler = (event) => {
        SetTarget(event.target.value);
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

        try {
            const crowdfund = new CrowdfundWrapper();
            await crowdfund.createCampaign(minimumContribution, target);
            SetTarget("");
            SetMinimumContribution("");
            alert('Campaign was created successfully!');
        } catch (error) {
            displayError(error.message);
        }
    }

    return (
        <Layout>
            <Form onSubmit={createCampaignHandler} error={!!errorMessage}>
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
                <Button primary>Create</Button>
            </Form>
        </Layout>
    );
}

export default Create;