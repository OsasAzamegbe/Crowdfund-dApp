// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Crowdfund {
    struct FundMember {
        bool isContributor;
        bool isApprover;
        uint contribution;
    }

    struct CampaignRequest {
        address payable recipient;
        string description;
        uint numApprovals;
        bool isApproved;
        bool isCompleted;
    }

    struct Campaign {
        address manager;
        uint minContributionForApprover;
        uint balance;
        uint target;
        uint numRequests;
        uint numApprovers;
        CampaignRequest[] requests;
        mapping(address => FundMember) contributors;
    }

    uint numCampaigns;
    mapping(uint => Campaign) public campaigns;


    modifier validCampaign(uint campaignId) {
        require(campaignId <= numCampaigns);
        _;
    }

    constructor() {
        numCampaigns = 0;
    }
    
    function createCampaign(uint minContribution, uint target) public returns (uint) {
        Campaign storage c = campaigns[numCampaigns];

        c.manager = msg.sender; 
        c.minContributionForApprover = minContribution;
        c.balance = 0;
        c.target = target;
        c.numApprovers = 0;
        c.numRequests = 0;
        
        return numCampaigns++;
    }

    function contributeToCampaign(uint campaignId) validCampaign(campaignId) public payable {
        Campaign storage campaign = campaigns[campaignId];
        FundMember storage fundMember = campaign.contributors[msg.sender];
        bool isNewApprover = !fundMember.isApprover;

        fundMember.isContributor = true;
        fundMember.contribution += msg.value;
        fundMember.isApprover = fundMember.contribution >= campaign.minContributionForApprover;
        campaign.balance += msg.value;
        campaign.numApprovers += isNewApprover && fundMember.isApprover ? 1 : 0;
    }

    function createCampaignRequest(uint campaignId, address payable recipient, string memory description) validCampaign(campaignId) public returns(uint) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.manager == msg.sender);

        campaign.requests.push(CampaignRequest({
            recipient: recipient,
            description: description,
            numApprovals: 0,
            isApproved: false,
            isCompleted: false
        }));

        return campaign.numRequests++;
    }

}