import web3 from "./web3";
import { Crowdfund } from "./build/Crowdfund.json";
import dotenv from 'dotenv';
dotenv.config();


const crowdfund = new web3.eth.Contract(Crowdfund.abi, process.env.CROWDFUND_CONTRACT_ADDRESS);

export default crowdfund;