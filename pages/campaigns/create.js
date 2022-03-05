import React from "react";
import Layout from "../../components/Layout";
import { Button, Form } from "semantic-ui-react";


const Create = () => {
    return (
        <Layout>
            <Form>
                <Form.Field>
                    <label>Minimum contribution</label>
                    <input placeholder="minimum contribution" />
                </Form.Field>
                <Form.Field>
                    <label>Fund target</label>
                    <input placeholder="target" />
                </Form.Field>
                <Button primary>Create</Button>
            </Form>
        </Layout>
    );
}

export default Create;