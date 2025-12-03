// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}


contract SavingsVault {
    IERC20 public immutable wINJ;

    mapping(address => uint256) private balances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address _wINJ) {
        wINJ = IERC20(_wINJ);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(wINJ.transferFrom(msg.sender, address(this), amount), "transferFrom failed");

        balances[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(balances[msg.sender] >= amount, "insufficient balance");

        balances[msg.sender] -= amount;
        require(wINJ.transfer(msg.sender, amount), "transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function myBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
}
