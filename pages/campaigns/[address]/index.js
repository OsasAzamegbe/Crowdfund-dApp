import React from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import { Button } from "semantic-ui-react";
import Link from "next/link";


const AdressIndex = () => {
    const router = useRouter();
    const { address } = router.query;

    return (
        <Layout>
            <header>{address}</header>
            <Link href={`/campaigns/${address}/requests`}><Button primary>View Requests</Button></Link>
        </Layout>
    );
}

export default AdressIndex;