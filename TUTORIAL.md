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

## Project Setup

Before we dive into smart contracts or frontend code, let's set up our project structure properly. We'll create a parent folder that contains both our contracts and frontend as separate packages.

### Creating the Project Structure

First, create a new directory for the entire project:

```bash
mkdir injective-vault
cd injective-vault
```

Your project will eventually have this structure:

```bash
injective-vault/
├── contract/          # Smart contracts (Part 1)
└── frontend/          # React app (Part 2)
```

## Next Steps

Now that your project is set up, you're ready to start building:

1. **[Continue to Part 1: Smart Contract Development →](TUTORIAL-CONTRACT.md)**
   * Write the Vault contract
   * Test the contract
   * Deploy to testnet

2. **[Skip to Part 2: Frontend Development →](TUTORIAL-FRONTEND.md)**
   * Build the React UI
   * Connect to MetaMask
   * Interact with contracts

Choose where you want to start, and let's build something awesome!
