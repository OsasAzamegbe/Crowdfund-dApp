// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;


contract Crowdfund {
    address[] public campaigns;
    uint public numCampaigns;
    event CampaignIdEvent(uint campaignId);

    function createCampaign(uint minContribution, uint targetAmount) public {
        Campaign campaign = new Campaign(msg.sender, minContribution, targetAmount);
        campaigns.push(address(campaign));
        emit CampaignIdEvent(numCampaigns);
        numCampaigns++;
    }

    function getCampaigns() public view returns(address[] memory) {
        return campaigns;
    }
}

contract Campaign {

    struct Contributor {
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

    address public manager;
    uint public minContributionForApprover;
    uint public target;
    uint public numRequests;
    uint public numApprovers;
    CampaignRequest[] public requests;
    mapping(address => Contributor) public contributors;
    event RequestIdEvent(uint requestId);

    modifier validRequest(uint requestId) {
        require(requestId < numRequests);
        _;
    }

    modifier admin() {
        require(manager == msg.sender);
        _;
    }
    
    constructor(address managerAddress, uint minContribution, uint targetAmount) {
        manager = managerAddress; 
        minContributionForApprover = minContribution;
        target = targetAmount;
        numApprovers = 0;
        numRequests = 0;
    }

    function contributeToCampaign() public payable {
        Contributor storage contributor = contributors[msg.sender];
        bool isNewApprover = !contributor.isApprover;

        contributor.contribution += msg.value;
        contributor.isApprover = contributor.contribution >= minContributionForApprover;
        if(isNewApprover && contributor.isApprover) {
            numApprovers++;
        }
    }

    function createCampaignRequest(address payable recipient, string calldata description, uint amount) admin public {
        require(address(this).balance > amount);

        requests.push(CampaignRequest({
            recipient: recipient,
            description: description,
            amount: amount,
            numApprovals: 0,
            isApproved: false,
            isCompleted: false
        }));

        emit RequestIdEvent(numRequests);

        numRequests++;
    }

    function approveCampaignRequest(uint requestId) validRequest(requestId) public {
        Contributor storage contributor = contributors[msg.sender];
        require(contributor.isApprover);

        CampaignRequest storage campaignRequest = requests[requestId];
        campaignRequest.numApprovals++;
        campaignRequest.isApproved = campaignRequest.numApprovals > numApprovers/2;
    }

    function completeCampaignRequest(uint requestId) validRequest(requestId) admin public {
        CampaignRequest storage campaignRequest = requests[requestId];
        require(campaignRequest.isApproved);
        require(address(this).balance >= campaignRequest.amount);

        campaignRequest.recipient.transfer(campaignRequest.amount);
        campaignRequest.isCompleted = true;
    }

    function getContributor() public view returns(Contributor memory) {
        return contributors[msg.sender];
    }

    function getCampaignRequests() public view returns(CampaignRequest[] memory) {
        return requests;
    }
}