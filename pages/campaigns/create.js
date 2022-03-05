import React, { useState } from "react";
import Layout from "../../components/Layout";
import { Button, Form, Input } from "semantic-ui-react";
import CrowdfundWrapper from "../../crowdfund-solidity/crowdfund";


const Create = () => {
    const [minimumContribution, SetMinimumContribution] = useState("");
    const [target, SetTarget] = useState("");

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
            alert('Your campaign goal should not be zero :(');
            return;
        }
        if (target < minimumContribution) {
            alert('The minimum contribution to your campaign should not be greater than your target!');
            return;
        }

        const crowdfund = new CrowdfundWrapper();
        await crowdfund.createCampaign(minimumContribution, target);
        SetTarget("");
        SetMinimumContribution("");
        alert('Campaign was created successfully!');
    }

    return (
        <Layout>
            <Form onSubmit={createCampaignHandler}>
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