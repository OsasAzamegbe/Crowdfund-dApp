import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { Form, Modal, Input, Message, Button } from "semantic-ui-react";
import Layout from "../../../../components/Layout";
import crowdfund from "../../../../crowdfund-solidity/crowdfund";


const RequestForm = ({ campaignAddress, manager }) => {
    const [recipient, setRecipient] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [userAddress, setUserAddress] = useState("");
    const [requestId, setRequestId] = useState(0);

    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const accounts = await crowdfund.getAccounts();
            setUserAddress(accounts[0]);
        }
        loadUser();
    });

    const displayError = (error) => {
        setErrorMessage(error);
        setTimeout(() => {
            setErrorMessage("");
        }, 10000);
    }

    // handlers
    const amountHandler = (event) => {
        setAmount(event.target.value);
    }

    const recipientHandler = (event) => {
        setRecipient(event.target.value);
    }

    const descriptionHandler = (event) => {
        setDescription(event.target.value);
    }

    const createRequestHandler = async (event) => {
        event.preventDefault();
        if (amount === '0') {
            displayError('Your requested campaign withdrawal should not be zero :(');
            return;
        }
        const campaignBalance = await crowdfund.getBalance(campaignAddress);
        if (campaignBalance < amount) {
            displayError('The requested campaign withdrawal should not be greater than the campaign balance!');
            return;
        }

        setLoading(true);
        setErrorMessage("");
        try {
            const txnObj = await crowdfund.createCampaignRequest(campaignAddress, recipient, description, amount);
            setRequestId(txnObj.events.RequestIdEvent.returnValues.requestId);
            setDescription("");
            setRecipient("");
            setAmount("");
            setSuccessMessage('Campaign Request was created successfully!');
        } catch (error) {
            displayError(error.message);
        }
        setLoading(false);
    }

    const modalCloseHandler = async () => {
        setSuccessMessage("");
        router.push(`/campaigns/${campaignAddress}/requests/${requestId}`);
    }

    const requestFormJSX = () => {
        return (
            <Form onSubmit={createRequestHandler} error={!!errorMessage}>
                <Modal
                    open={!!successMessage}
                    header='Success!'
                    content={successMessage}
                    closeIcon
                    onClose={modalCloseHandler}
                />
                <Message error header="Ouch! An error occured" content={errorMessage} />
                <Form.Field>
                    <label>Recipient</label>
                    <Input
                        placeholder="Ethereum address of recipient"
                        required
                        value={recipient}
                        onChange={recipientHandler}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Description</label>
                    <Input
                        placeholder="purpose of request"
                        required
                        value={description}
                        onChange={descriptionHandler}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Amount</label>
                    <Input
                        type="number"
                        step="0.000001"
                        placeholder="requested amount"
                        label="ETH" labelPosition="right"
                        required
                        value={amount}
                        onChange={amountHandler}
                    />
                </Form.Field>
                <Button loading={loading} primary>Create Request</Button>
            </Form>
        );
    }

    return (
        <Layout>
            {userAddress == manager ? requestFormJSX() : null}
        </Layout>
    );
}

RequestForm.getInitialProps = async (props) => {
    const campaignAddress = props.query.address;
    const manager = await crowdfund.getManager(campaignAddress);

    return { campaignAddress, manager };
}

export default RequestForm;