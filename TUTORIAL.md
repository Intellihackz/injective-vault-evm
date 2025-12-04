# Building a Savings Vault DApp on Injective EVM

Welcome! In this  tutorial, we're going to build a fully functional savings vault  on Injective EVM . By the end, you'll have written and deployed your own smart contracts, built a React frontend, and connected everything together into a production-ready DApp where users can deposit tokens, withdraw from a vault, and transfer assets - all through their MetaMask wallet.

## Table of Contents

* [Prerequisites](#prerequisites)
* [What We're Building](#what-were-building)
* [How This Will Work](#how-this-will-work)
* [Part 1: Smart Contract Development](#part-1-smart-contract-development)
  * [Setting Up Hardhat](#setting-up-hardhat)
  * [Writing the Vault Contract](#writing-the-vault-contract)
  * [Understanding wINJ Integration](#understanding-winj-integration)
  * [Testing Our Contracts](#testing-our-contracts)
  * [Deploying to Testnet](#deploying-to-testnet)
* [Part 2: Frontend Development](#part-2-frontend-development)
  * [Setting Up React with TypeScript](#setting-up-react-with-typescript)
  * [Connecting MetaMask Wallet](#connecting-metamask-wallet)
  * [Implementing Token Approval Flow](#implementing-token-approval-flow)
  * [Building the Deposit/Withdraw Interface](#building-the-depositwithdraw-interface)
  * [Adding Transfer Functionality](#adding-transfer-functionality)
  * [Real-time Balance Updates](#real-time-balance-updates)
* [Part 3: Integration & Polish](#part-3-integration--polish)
  * [Contract-Frontend Integration](#contract-frontend-integration)
  * [Transaction Status Handling](#transaction-status-handling)
  * [Error Handling & UX](#error-handling--ux)
  * [Styling & Final Touches](#styling--final-touches)
* [Conclusion & Next Steps](#conclusion--next-steps)
* [Ready to Build?](#ready-to-build)

## Prerequisites

Before we dive in, let's make sure you have everything you need. Don't worry - we'll keep things practical and I'll explain everything along the way:

### Required Tools

* **Node.js 18+** - We'll be using modern JavaScript features
* **MetaMask wallet** - Install the browser extension if you haven't already
* **Code editor** - VS Code is great and has excellent Solidity support
* **Git** - For version control and cloning repositories
* **Some testnet INJ** - We'll show you how to get this from the faucet
* **Some testnet wINJ** - We'll show you how to get this too

### Required Knowledge

* **Basic Solidity** - You should understand variables, functions, and modifiers
* **React fundamentals** - Comfortable with hooks, state, and useEffect
* **TypeScript basics** - Helpful but not required; I'll explain as we go

## Complete Code Repository

📁 **View the complete source code on GitHub** [https://github.com/Intellihackz/injective-vault-evm]

### 📖 How to Use This Tutorial

This tutorial can be used in two ways:

1. **Learning Mode** - Follow along step-by-step and build everything from scratch to deeply understand how each piece works
2. **Reference Mode** - If you've cloned the completed repository, use this tutorial to understand the implementation details and design decisions

## What We're Building

Here's what our Savings Vault DApp will be able to do by the end of this tutorial:

### Smart Contract Features

* **Secure Vault Contract** - Holds user deposits with proper access controls
* **wINJ Integration** - Works with wrapped INJ tokens (ERC20)
* **Deposit Function** - Users can deposit wINJ into the vault
* **Withdraw Function** - Users can withdraw their deposited tokens
* **Balance Tracking** - Track individual user balances in the vault

### Frontend Features

* **MetaMask Connection** - Seamless wallet integration with network switching
* **Token Approval Flow** - User-friendly approval process for wINJ spending
* **Real-time Balances** - Live updates of INJ, wINJ, and vault balances
* **Deposit Interface** - Simple form to deposit tokens into vault
* **Withdraw Interface** - Easy withdrawal of tokens from vault
* **Transfer Functionality** - Send INJ/wINJ to other addresses

## How This Will Work

Let me quickly break down what we're building:

### The Tech Stack

#### Smart Contracts (Solidity)

* Vault Contract - Our custom contract that holds user deposits
* wINJ Token - Pre-deployed ERC20 token (Wrapped INJ)
* Hardhat - Development framework for testing and deployment

#### Frontend (React + TypeScript)

* React - For building our user interface
* ethers.js v6 - For blockchain interactions
* TypeScript - For type safety
* Plain CSS - For styling

#### Infrastructure

* Injective EVM Testnet - Where we'll deploy and test everything
* MetaMask - Handles wallet connection and transaction signing
* BlockScout Explorer - For viewing transactions and verifying contracts

## Ready to Build?

Alright, enough introduction - let's start building something awesome!

In the next section, we'll set up our project structure with both the smart contracts and frontend in one organized workspace. By the time we're done, you'll have a complete, working DApp that you can actually use and show off.

Let's go! 🚀

---

## Project Setup

Before we dive into smart contracts or frontend code, let's set up our project structure properly. We'll create a parent folder that contains both our contracts and frontend as separate packages.

### Creating the Project Structure

First, create a new directory for the entire project:

```bash
mkdir injective-vault
cd injective-vault
```

Now let's set up the contract folder using Injective's Hardhat template:

```bash
git clone https://github.com/InjectiveLabs/injective-hardhat-template.git contract
cd contract
npm install --force
```

This gives us a pre-configured Hardhat setup optimized for Injective EVM, including:

* Hardhat configuration for Injective networks
* Sample contract structure
* Testing setup
* Deployment scripts

### Understanding the Hardhat Configuration

The cloned template already comes with a configured `hardhat.config.js` file. Let's understand what each part does:

```javascript
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.28',
  networks: {
    inj_testnet: {
      url: process.env.INJ_TESTNET_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1439,
      gas: 10000000,
      gasPrice: 50000000000,
    },
  },
  etherscan: {
    apiKey: {
      inj_testnet: 'nil',
    },
    customChains: [
      {
        network: 'inj_testnet',
        chainId: 1439,
        urls: {
          apiURL: 'https://testnet.blockscout-api.injective.network/api',
          browserURL: 'https://testnet.blockscout.injective.network/',
        },
      },
    ],
  },
  sourcify: {
    enabled: false,
  },
};
```

## Configuration Breakdown

**Solidity Version**

```javascript
solidity: '0.8.28',
```

The Solidity compiler version we'll use for our contracts.

**Network Configuration**

```javascript
networks: {
  inj_testnet: {
    url: process.env.INJ_TESTNET_RPC_URL || 'https://k8s.testnet.json-rpc.injective.network/',
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    chainId: 1439,
    gas: 10000000,
    gasPrice: 50000000000,
  },
}
```

* **url**: The RPC endpoint for Injective EVM testnet
* **accounts**: Your wallet's private key (loaded from .env)
* **chainId**: Injective EVM testnet chain ID (1439)
* **gas**: Gas limit for transactions
* **gasPrice**: Gas price in wei

**Contract Verification**

```javascript
etherscan: {
  apiKey: {
    inj_testnet: 'nil',
  },
  customChains: [
    {
      network: 'inj_testnet',
      chainId: 1439,
      urls: {
        apiURL: 'https://testnet.blockscout-api.injective.network/api',
        browserURL: 'https://testnet.blockscout.injective.network/',
      },
    },
  ],
},
```

This configuration allows us to verify our contracts on BlockScout (Injective's block explorer) after deployment.

### Setting Up Environment Variables

Create a `.env` file in the contracts folder:

Add your private key and rpc url:

```env
PRIVATE_KEY=your_private_key_here
INJ_TESTNET_RPC_URL=https://k8s.testnet.json-rpc.injective.network/
```

**⚠️ Important Security Notes:**

1. **Never commit your `.env` file to git!** The template's `.gitignore` already excludes it
2. **Use a testnet-only wallet** - Never use your mainnet wallet's private key
3. **Get your private key from MetaMask**:
   * Open MetaMask
   * Click the three dots → Account Details → Export Private Key
   * Enter your password and copy the key

Now we're ready to write our contract!

## Part 1: Smart Contract Development

Now that our environment is set up, let's write our Vault contract! This contract will allow users to safely deposit and withdraw wINJ tokens.

### Writing the Vault Contract

Navigate to the `contract/contracts` folder and create a new file called `SavingsVault.sol`:

Here's our complete vault contract:

```solidity
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
```

### Understanding the Contract

Let's break down what each part does:

#### The IERC20 Interface

```solidity
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
```

This interface defines the ERC20 token functions we'll use. We only include the functions we need - `transferFrom` for deposits and `transfer` for withdrawals. This keeps our contract simple and gas-efficient.

#### State Variables

```solidity
IERC20 public immutable wINJ;
mapping(address => uint256) private balances;
```

* **`wINJ`**: An immutable reference to the wINJ token contract. We use `immutable` because this address never changes after deployment, which saves gas on reads.
* **`balances`**: A mapping that tracks how much each user has deposited. We use `private` visibility since we provide a public getter function.

#### Events

```solidity
event Deposited(address indexed user, uint256 amount);
event Withdrawn(address indexed user, uint256 amount);
```

Events are crucial for off-chain applications. They allow our frontend to:

* Track deposit and withdrawal history
* Show real-time notifications
* Build transaction logs

The `indexed` keyword on the `user` parameter lets us filter events by user address efficiently.

#### Constructor

```solidity
constructor(address _wINJ) {
    wINJ = IERC20(_wINJ);
}
```

When we deploy the contract, we pass in the wINJ token address. On Injective EVM testnet, this is `0x0000000088827d2d103ee2d9A6b781773AE03FfB`.

#### Deposit Function

```solidity
function deposit(uint256 amount) external {
    require(amount > 0, "amount=0");
    require(wINJ.transferFrom(msg.sender, address(this), amount), "transferFrom failed");

    balances[msg.sender] += amount;
    emit Deposited(msg.sender, amount);
}
```

Here's what happens when a user deposits:

1. **Validation**: We check that the amount is greater than 0
2. **Transfer**: We use `transferFrom` to move tokens from the user to the vault. This requires the user to have approved the vault first (we'll handle this in the frontend)
3. **Update Balance**: We add the amount to the user's balance
4. **Emit Event**: We emit a `Deposited` event for off-chain tracking

#### Withdraw Function

```solidity
function withdraw(uint256 amount) external {
    require(amount > 0, "amount=0");
    require(balances[msg.sender] >= amount, "insufficient balance");

    balances[msg.sender] -= amount;
    require(wINJ.transfer(msg.sender, amount), "transfer failed");

    emit Withdrawn(msg.sender, amount);
}
```

The withdrawal process:

1. **Validate Amount**: Check that amount > 0
2. **Check Balance**: Ensure the user has enough deposited
3. **Update State**: Reduce the user's balance BEFORE transferring (prevents reentrancy)
4. **Transfer**: Send tokens back to the user
5. **Emit Event**: Record the withdrawal

#### Balance Query Function

```solidity
function myBalance() external view returns (uint256) {
    return balances[msg.sender];
}
```

A simple view function that returns the caller's balance. View functions don't cost gas when called off-chain, making them perfect for UI updates.

### Compiling the Contract

Let's make sure our contract compiles without errors:

```bash
npx hardhat compile
```

You should see:

```bash
Compiled 1 Solidity file successfully
```

If you see any errors, double-check your code matches exactly.

Now that we have our contract written and compiled, we need to test it

### Testing Our Contracts

Now let's write tests to make sure our vault works correctly. Create a new file `SavingsVault.test.js` in the `test` folder:

Here's our test suite:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SavingsVault", function () {
  let signer;
  let vault, wINJ;
  const depositAmount = ethers.parseUnits("0.01");

  before(async () => {
    [signer] = await ethers.getSigners();

    // Load wINJ
    const wINJ_ADDRESS = "0x0000000088827d2d103ee2d9A6b781773AE03FfB";

    wINJ = await ethers.getContractAt(
      "IERC20",
      wINJ_ADDRESS,
      signer
    );

    // Deploy vault
    const Vault = await ethers.getContractFactory("SavingsVault", signer);
    vault = await Vault.deploy(wINJ_ADDRESS);
    await vault.waitForDeployment();

    console.log("Vault deployed to:", await vault.getAddress());
  });

  it("should allow deposit", async () => {
    const vaultAddress = await vault.getAddress();

    // approve
    await wINJ.approve(vaultAddress, depositAmount);

    // deposit
    await expect(vault.deposit(depositAmount))
      .to.emit(vault, "Deposited")
      .withArgs(signer.address, depositAmount);

    expect(await vault.myBalance()).to.equal(depositAmount);
  });

  it("should allow withdrawal", async () => {
    await expect(vault.withdraw(depositAmount))
      .to.emit(vault, "Withdrawn")
      .withArgs(signer.address, depositAmount);

    expect(await vault.myBalance()).to.equal(0);
  });
});
```

### Understanding the Tests

Let's break down what our test suite does:

#### Test Setup

```javascript
let signer;
let vault, wINJ;
const depositAmount = ethers.parseUnits("0.01");
```

We declare variables for:

* **signer**: The account that will interact with the contracts
* **vault**: Our SavingsVault contract instance
* **wINJ**: The wINJ token contract instance
* **depositAmount**: 0.01 wINJ (converted to wei using `parseUnits`)

#### Before Hook - Deployment

```javascript
before(async () => {
  [signer] = await ethers.getSigners();

  const wINJ_ADDRESS = "0x0000000088827d2d103ee2d9A6b781773AE03FfB";

  wINJ = await ethers.getContractAt(
    "IERC20",
    wINJ_ADDRESS,
    signer
  );

  const Vault = await ethers.getContractFactory("SavingsVault", signer);
  vault = await Vault.deploy(wINJ_ADDRESS);
  await vault.waitForDeployment();

  console.log("Vault deployed to:", await vault.getAddress());
});
```

The `before` hook runs once before all tests:

1. Gets a signer from Hardhat
2. Connects to the existing wINJ token contract on testnet
3. Deploys our SavingsVault contract
4. Waits for deployment to complete

#### Test 1: Deposit

```javascript
it("should allow deposit", async () => {
  const vaultAddress = await vault.getAddress();

  // approve
  await wINJ.approve(vaultAddress, depositAmount);

  // deposit
  await expect(vault.deposit(depositAmount))
    .to.emit(vault, "Deposited")
    .withArgs(signer.address, depositAmount);

  expect(await vault.myBalance()).to.equal(depositAmount);
});
```

This test verifies the deposit flow:

1. Approve the vault to spend wINJ
2. Call deposit and check that the `Deposited` event is emitted with correct parameters
3. Verify that `myBalance()` returns the deposited amount

#### Test 2: Withdrawal

```javascript
it("should allow withdrawal", async () => {
  await expect(vault.withdraw(depositAmount))
    .to.emit(vault, "Withdrawn")
    .withArgs(signer.address, depositAmount);

  expect(await vault.myBalance()).to.equal(0);
});
```

This test verifies the withdrawal flow:

1. Withdraw the deposited amount
2. Check that the `Withdrawn` event is emitted correctly
3. Verify that the balance is now 0

### Running Tests on Injective EVM Testnet

Unlike typical Hardhat tests that run on a local simulated blockchain, we need to run these tests on the actual Injective EVM testnet. This is because we're interacting with the real wINJ token contract.

Before running tests, make sure you have:

1. Added your private key to `.env` file
2. Some testnet INJ for gas fees
3. Some testnet wINJ tokens in your account

Run the tests with:

```bash
npx hardhat test --network inj_testnet
```

You should see output like:

```bash
  SavingsVault
Vault deployed to: 0x... (your deployed address)
    ✓ should allow deposit
    ✓ should allow withdrawal

  2 passing
```

### Getting Testnet Tokens

If you don't have testnet tokens yet:

1. **Get testnet INJ**: Visit the [Injective testnet faucet](https://testnet.faucet.injective.network/)
2. **Get testnet wINJ**:
   * Use the wINJ contract's `deposit()` function to wrap your INJ
   * Or interact with it through a testnet interface on thr explorer

### What the Tests Verify

Our test suite confirms that:

* ✅ Users can approve and deposit wINJ tokens
* ✅ The vault correctly tracks user balances
* ✅ Events are emitted with correct parameters
* ✅ Users can withdraw their deposited tokens
* ✅ Balances update correctly after withdrawals

These tests give us confidence that our contract works as expected before we deploy it for real users.

### Deploying to Testnet

Now that our contract is tested and working, let's deploy it to Injective EVM testnet so we can interact with it from our frontend.

#### Creating the Deployment Script

Create a new file `scripts/deploy.js`:

```javascript
async function main() {
    const network = await ethers.provider.getNetwork();
    console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);

    // wINJ token address on Injective testnet
    const WINJ_ADDRESS = process.env.WINJ_ADDRESS || '0x0000000088827d2d103ee2d9A6b781773AE03FfB';
    
    console.log(`Using wINJ token address: ${WINJ_ADDRESS}`);

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} INJ`);

    // Deploy SavingsVault
    console.log('\nDeploying SavingsVault...');
    const SavingsVault = await ethers.getContractFactory('SavingsVault');
    const savingsVault = await SavingsVault.deploy(WINJ_ADDRESS, {
        gasPrice: 160e6,
        gasLimit: 2e6,
    });
    
    await savingsVault.waitForDeployment();
    const address = await savingsVault.getAddress();

    console.log('\n✅ SavingsVault deployed successfully!');
    console.log(`Contract address: ${address}`);
    console.log(`wINJ token: ${WINJ_ADDRESS}`);
    console.log(`\nVerify with: npx hardhat verify --network inj_testnet ${address} ${WINJ_ADDRESS}`);
}

main()
    .then(() => {
        console.log('\n✅ Deployment script executed successfully.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Deployment failed:');
        console.error(error);
        process.exitCode = 1;
    });
```

#### Understanding the Deployment Script

Let's break down what this script does:

```javascript
const wINJ_ADDRESS = "0x0000000088827d2d103ee2d9A6b781773AE03FfB";
```

We hardcode the wINJ token address that our vault will use.

```javascript
const SavingsVault = await hre.ethers.getContractFactory("SavingsVault");
const vault = await SavingsVault.deploy(wINJ_ADDRESS);
await vault.waitForDeployment();
```

This:

1. Gets the contract factory (compiled bytecode)
2. Deploys the contract with the wINJ address
3. Waits for the deployment transaction to be mined

```javascript
await vault.deploymentTransaction().wait(5);
```

We wait for 5 block confirmations to ensure the deployment is finalized before verification.

```javascript
await hre.run("verify:verify", {
  address: vaultAddress,
  constructorArguments: [wINJ_ADDRESS],
});
```

This verifies the contract on BlockScout explorer, which:

* Makes the source code public
* Allows users to read the contract on the explorer
* Enables direct interaction through the explorer UI

#### Running the Deployment

Make sure you have:

1. Testnet INJ for gas fees
2. Your private key in `.env`
3. The RPC URL in `.env`

Deploy the contract:

```bash
npx hardhat run scripts/deploy.js --network inj_testnet
```

You should see output like:

```bash
Deploying SavingsVault...
SavingsVault deployed to: 0x26292356C2b29291B46DdEB18C6B8973026933bF
Waiting for block confirmations...
Verifying contract on BlockScout...
Contract verified successfully!
```

**🎉 Save this contract address!** You'll need it for the frontend.

#### Verifying the Deployment

Visit BlockScout to see your deployed contract:

``` bash
https://testnet.blockscout.injective.network/address/YOUR_CONTRACT_ADDRESS
```

You should see:

* ✅ Contract verified (green checkmark)
* ✅ Source code visible
* ✅ Read/Write contract tabs available

Congratulations! Our vault contract is now live on Injective EVM testnet. In the next part, we'll build the frontend to interact with it.
