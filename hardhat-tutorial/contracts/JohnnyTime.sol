// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract JohnnyTime is ERC721Enumerable, Ownable {
    
    // General Params
    string baseTokenURI;
    uint256 public price = 0.01 ether;
    bool public paused;
    uint256 public maxTokenIds = 20;
    uint256 public tokenIds;

    // Whitelist Pre Sale Params
    IWhitelist whitelist;
    bool public presaleStarted;
    uint256 public presaleEndTime;

    modifier onlyWhenNotPaused {
        require(!paused, "Sale is currently paused.");
        _;
    }

    constructor(string memory _baseTokenURI, address _whiteListContract) ERC721("JohnnyTime", "JT") {
        baseTokenURI = _baseTokenURI;
        whitelist = IWhitelist(_whiteListContract);
    }



}