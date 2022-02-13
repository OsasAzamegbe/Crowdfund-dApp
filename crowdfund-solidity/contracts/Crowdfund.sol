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
        uint amount;
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
    event CampaignIdEvent(uint campaignId);
    event CampaignRequestIdEvent(uint requestId);


    modifier validCampaign(uint campaignId) {
        require(campaignId <= numCampaigns);
        _;
    }

    modifier validRequest(uint campaignId, uint requestId) {
        require(campaignId <= numCampaigns);
        require(requestId <= campaigns[campaignId].numRequests);
        _;
    }

    constructor() {
        numCampaigns = 0;
    }
    
    function createCampaign(uint minContribution, uint target) public {
        Campaign storage c = campaigns[numCampaigns];

        c.manager = msg.sender; 
        c.minContributionForApprover = minContribution;
        c.balance = 0;
        c.target = target;
        c.numApprovers = 0;
        c.numRequests = 0;

        emit CampaignIdEvent(numCampaigns);
        numCampaigns++;
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

    function createCampaignRequest(uint campaignId, address payable recipient, string memory description, uint amount) validCampaign(campaignId) public {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.manager == msg.sender);
        require(campaign.balance >= amount);

        campaign.requests.push(CampaignRequest({
            recipient: recipient,
            description: description,
            amount: 0,
            numApprovals: 0,
            isApproved: false,
            isCompleted: false
        }));

        emit CampaignRequestIdEvent(campaign.numRequests);
        campaign.numRequests++;
    }

    function approveCampaignRequest(uint campaignId, uint requestId) validRequest(campaignId, requestId) public {
        Campaign storage campaign = campaigns[campaignId];
        FundMember storage member = campaign.contributors[msg.sender];
        require(member.isApprover);

        CampaignRequest storage campaignRequest = campaign.requests[requestId];
        campaignRequest.numApprovals++;
        campaignRequest.isApproved = campaignRequest.numApprovals > campaign.numApprovers/2;
    }

    function completeCampaignRequest(uint campaignId, uint requestId) validRequest(campaignId, requestId) public {
        Campaign storage campaign = campaigns[campaignId];
        CampaignRequest storage campaignRequest = campaign.requests[requestId];
        require(campaignRequest.isApproved);
        require(campaign.balance >= campaignRequest.amount);

        campaignRequest.recipient.transfer(campaignRequest.amount);
        campaign.balance -= campaignRequest.amount;
        campaignRequest.isCompleted = true;
    }

    function getCampaignContributor(uint campaignId) validCampaign(campaignId) public view returns(FundMember memory) {
        return campaigns[campaignId].contributors[msg.sender];
    }

    function getCampaignBalance(uint campaignId) validCampaign(campaignId) public view returns(uint) {
        return campaigns[campaignId].balance;
    }

    function getCampaignRequest(uint campaignId, uint requestId) validRequest(campaignId, requestId) public view returns(CampaignRequest memory) {
        return campaigns[campaignId].requests[requestId];
    }

}