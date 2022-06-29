// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract JohnnyTimeNFT is ERC721Enumerable, Ownable {
    
    // General Params
    string baseTokenURI;
    uint256 public price = 0.01 ether;
    bool public isPaused;
    uint256 public maxTokenIds = 20;
    uint256 public tokenIds;

    // Whitelist Pre Sale Params
    IWhitelist whitelist;
    bool public presaleStarted;
    uint256 public presaleEndTime;

    modifier onlyWhenNotPaused {
        require(!isPaused, "Sale is currently paused.");
        _;
    }

    modifier supplyExists {
        require(tokenIds < maxTokenIds, "Exceed maximum JohnnyTime supply");
        _;
    }

    modifier correctPrice {
        require(msg.value >= price, "Ether sent is not correct");
        _;
    }


    constructor(string memory _baseTokenURI, address _whiteListContract) ERC721("JohnnyTime", "JT") {
        baseTokenURI = _baseTokenURI;
        whitelist = IWhitelist(_whiteListContract);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        presaleEndTime = block.timestamp + 5 minutes; 
    }

    function presaleMint() public payable onlyWhenNotPaused supplyExists correctPrice {
        require(presaleStarted, "Pre sale hasn't started yet");
        require(block.timestamp < presaleEndTime, "Sale has ended.");
        require(whitelist.whitelistedAddresses(msg.sender), "You're not whitelisted.");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function mint() public payable onlyWhenNotPaused supplyExists correctPrice {
        require(presaleStarted && block.timestamp > presaleEndTime, "Pre sale hadn't ended yet.");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setPaused(bool _paused) public onlyOwner {
        isPaused = _paused;
    }

    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}
    fallback() external payable {}
}