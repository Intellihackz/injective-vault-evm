# Building a Savings Vault DApp on Injective EVM

Welcome! In this tutorial, we're going to build a fully functional savings vault on Injective EVM. By the end, you'll have written and deployed your own smart contracts, built a React frontend, and connected everything together into a production-ready DApp where users can deposit tokens, withdraw from a vault, and transfer assets - all through their MetaMask wallet.

## Table of Contents

* [Prerequisites](#prerequisites)
* [Complete Code Repository](#complete-code-repository)
* [What We're Building](#what-were-building)
* [How This Will Work](#how-this-will-work)
* [Project Setup](#project-setup)
* [Next Steps](#next-steps)

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

**View the complete source code on GitHub:** [https://github.com/Intellihackz/injective-vault-evm]

### How to Use This Tutorial

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

---

## Project Setup

Before we dive into coding, let's set up our complete project structure. We'll create both the contract and frontend folders right now, so when you start the actual development tutorials, you can jump straight into coding without any setup friction.

### Creating the Project Structure

First, create a new directory for the entire project:

```bash
mkdir injective-vault
cd injective-vault
```

### Setting Up the Contract Folder

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

<details>
<summary>Click to view hardhat.config.js</summary>

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

</details>

### Configuration Breakdown

#### Solidity Version

```javascript
solidity: '0.8.28',
```

The Solidity compiler version we'll use for our contracts.

#### Network Configuration

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

#### Contract Verification

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
WINJ_ADDRESS=0x0000000088827d2d103ee2d9A6b781773AE03FfB
```

**Important Security Notes:**

1. **Never commit your `.env` file to git!** The template's `.gitignore` already excludes it
2. **Use a testnet-only wallet** - Never use your mainnet wallet's private key
3. **Get your private key from MetaMask**:
   * Open MetaMask
   * Click the three dots → Account Details → Export Private Key
   * Enter your password and copy the key

### Getting Testnet Tokens

Before you can deploy and test, you'll need testnet tokens:

1. **Get testnet INJ**: Visit the [Injective testnet faucet](https://testnet.faucet.injective.network/)
2. **Get testnet wINJ**:
   * interact with it through a testnet interface on the explorer

### Setting Up the Frontend Folder

Now let's set up the React frontend. Navigate back to the root folder and create the frontend:

```bash
cd ..  # Go back to injective-vault folder
npm create vite@latest frontend
```

When prompted by Vite:

* **Select a framework:** Choose `React`
* **Select a variant:** Choose `TypeScript`

Now install dependencies:

```bash
cd frontend
npm install
npm install ethers
```

This creates a new React app with TypeScript support and installs ethers.js for blockchain interactions.

### Final Project Structure

Your complete project structure should now look like this:

```bash
injective-vault/
├── contract/              # Smart contract development
│   ├── contracts/         # Solidity contracts go here
│   ├── scripts/           # Deployment scripts
│   ├── test/              # Contract tests
│   ├── hardhat.config.js  # Hardhat configuration
│   ├── .env               # Environment variables (private keys)
│   └── package.json
│
└── frontend/              # React frontend
    ├── src/
    │   ├── App.tsx        # Main app component (we'll build this)
    │   ├── App.css        # Styling
    │   └── abis/          # Contract ABIs (we'll create this)
    ├── public/
    └── package.json
```

---

## Next Steps

Congratulations! Your development environment is now completely set up. You have:

✅ Both contract and frontend folders created  
✅ All dependencies installed  
✅ Hardhat configured for Injective EVM  
✅ Environment variables ready  
✅ Project structure organized

Now you can jump straight into development without any setup interruptions!

**[Start with Part 1: Smart Contract Development →](TUTORIAL-CONTRACT.md)**

* Write the SavingsVault contract
* Test the contract
* Deploy to Injective EVM testnet
* Verify your contract

tutorials assume your environment is already set up, so you can focus purely on coding!

Let's build something awesome!
