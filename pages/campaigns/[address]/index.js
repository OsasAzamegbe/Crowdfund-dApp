import React from "react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";


const AdressIndex = () => {
    const router = useRouter();
    const { address } = router.query;

    return (
        <Layout>
            {address}
        </Layout>
    );
}

export default AdressIndex;