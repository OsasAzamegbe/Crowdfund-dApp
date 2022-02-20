import Web3 from "web3";


let web3;
if(typeof window === "undefined" || typeof window.ethereum === "undefined") {
    web3 = new Web3(new Web3.providers.HttpProvider(process.env.NEXT_PUBLIC_INFURA_RINKEBY_ENDPOINT));
} else {
    window.ethereum.request({ method: "eth_requestAccounts" });
    web3 = new Web3(window.ethereum);
}

export default web3;