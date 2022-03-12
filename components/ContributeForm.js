import { useRouter } from "next/router";
import React, { useState } from "react";
import { Button, Form, Input, Message, Modal } from "semantic-ui-react";
import crowdfund from "../crowdfund-solidity/crowdfund";


const ContributeForm = ({ address }) => {
    const [contribution, setContribution] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const displayError = (error) => {
        setErrorMessage(error);
        setTimeout(() => {
            setErrorMessage("");
        }, 10000);
    }

    // handlers
    const contributionHandler = (event) => {
        setContribution(event.target.value);
    }

    const sendContributionHandler = async (event) => {
        event.preventDefault();
        if (contribution === '0') {
            displayError('Your campaign contribution should not be zero :(');
            return;
        }

        setLoading(true);
        setErrorMessage("");
        try {
            await crowdfund.contributeToCampaign(address, contribution);
            setContribution("");
            setSuccessMessage('Contribution was sent successfully!');
            router.reload();
        } catch (error) {
            displayError(error.message);
        }
        setLoading(false);
    }

    const modalCloseHandler = async () => {
        setSuccessMessage("");
    }

    return (
        <Form onSubmit={sendContributionHandler} error={!!errorMessage}>
            <Modal
                open={!!successMessage}
                header='Success!'
                content={successMessage}
                closeIcon
                onClose={modalCloseHandler}
            />
            <Message error header="Ouch! An error occured" content={errorMessage} />
            <Form.Field>
                <label>Amount</label>
                <Input
                    type="number"
                    step="0.000001"
                    placeholder="contribution"
                    label="ETH" labelPosition="right"
                    required
                    value={contribution}
                    onChange={contributionHandler}
                />
            </Form.Field>
            <Button loading={loading} primary>Contribute</Button>
        </Form>
    );
}

export default ContributeForm;