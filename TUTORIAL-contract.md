# Part 1: Smart Contract Development

Welcome to the smart contract development section! Your environment is already set up from the main tutorial, so we can jump straight into writing code.

## Table of Contents

* [Writing the Vault Contract](#writing-the-vault-contract)
* [Testing Our Contracts](#testing-our-contracts)
* [Deploying to Testnet](#deploying-to-testnet)

---

## Writing the Vault Contract

Navigate to the `contract/contracts` folder and create a new file called `SavingsVault.sol`.

Here's our complete vault contract:

<details>
<summary>Click to view complete SavingsVault.sol</summary>

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

</details>

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

---

## Testing Our Contracts

Now let's write tests to make sure our vault works correctly. Create a new file `test/SavingsVault.test.js`:

<details>
<summary>Click to view complete test file</summary>

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

</details>

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

### What the Tests Verify

Our test suite confirms that:

* Users can approve and deposit wINJ tokens
* The vault correctly tracks user balances
* Events are emitted with correct parameters
* Users can withdraw their deposited tokens
* Balances update correctly after withdrawals

These tests give us confidence that our contract works as expected before we deploy it for real users.

---

## Deploying to Testnet

Now that our contract is tested and working, let's deploy it to Injective EVM testnet so we can interact with it from our frontend.

### Creating the Deployment Script

Create a new file `scripts/deploy.js`:

<details>
<summary>Click to view complete deploy.js</summary>

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

</details>

### Understanding the Deployment Script

Let's break down what this script does:

#### Network Information

```javascript
const network = await ethers.provider.getNetwork();
console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);
```

This confirms which network we're deploying to - important to avoid accidental mainnet deployments!

#### wINJ Address Configuration

```javascript
const WINJ_ADDRESS = process.env.WINJ_ADDRESS || '0x0000000088827d2d103ee2d9A6b781773AE03FfB';
```

We load the wINJ address from environment variables, with a fallback to the known testnet address.

#### Deployer Information

```javascript
const [deployer] = await ethers.getSigners();
console.log(`Deploying contracts with account: ${deployer.address}`);

const balance = await ethers.provider.getBalance(deployer.address);
console.log(`Account balance: ${ethers.formatEther(balance)} INJ`);
```

This shows which account is deploying and checks if you have enough INJ for gas fees.

#### Contract Deployment

```javascript
const SavingsVault = await ethers.getContractFactory('SavingsVault');
const savingsVault = await SavingsVault.deploy(WINJ_ADDRESS, {
    gasPrice: 160e6,
    gasLimit: 2e6,
});
```

We specify:

* **gasPrice**: 160 Gwei - appropriate for Injective EVM testnet
* **gasLimit**: 2 million gas - plenty for our contract deployment

#### Deployment Confirmation

```javascript
await savingsVault.waitForDeployment();
const address = await savingsVault.getAddress();
```

We wait for the transaction to be mined and get the deployed contract address.

### Running the Deployment

Make sure you have:

1. Testnet INJ for gas fees
2. Your private key in `.env`
3. The RPC URL in `.env`
4. The wINJ address in `.env`

Deploy the contract:

```bash
npx hardhat run scripts/deploy.js --network inj_testnet
```

You should see output like:

```bash
Deploying to network: inj_testnet (chainId: 1439)
Using wINJ token address: 0x0000000088827d2d103ee2d9A6b781773AE03FfB
Deploying contracts with account: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Account balance: 5.0 INJ

Deploying SavingsVault...

✅ SavingsVault deployed successfully!
Contract address: 0x...
wINJ token: 0x0000000088827d2d103ee2d9A6b781773AE03FfB

Verify with: npx hardhat verify --network inj_testnet <YOUR_CONTRACT_ADDRESS> 0x0000000088827d2d103ee2d9A6b781773AE03FfB

✅ Deployment script executed successfully.
```

**Save your contract address!** You'll need it for the frontend.

### Verifying the Contract

After deployment, verify your contract on BlockScout using the command provided in the output:

```bash
npx hardhat verify --network inj_testnet <YOUR_CONTRACT_ADDRESS> 0x0000000088827d2d103ee2d9A6b781773AE03FfB
```

Replace `<YOUR_CONTRACT_ADDRESS>` with the address from your deployment output.

You should see:

```bash
Successfully verified contract SavingsVault on BlockScout.
https://testnet.blockscout.injective.network/address/<YOUR_CONTRACT_ADDRESS>#code
```

### Viewing Your Contract

Visit BlockScout to see your deployed contract:

```bash
https://testnet.blockscout.injective.network/address/<YOUR_CONTRACT_ADDRESS>
```

You should see:

* Contract verified (green checkmark)
* Source code visible under "Code" tab
* Read/Write contract functions available

**Congratulations!** Your vault contract is now live on Injective EVM testnet. 

---

## Next Steps

Now that your smart contract is deployed and verified, you're ready to build the frontend!

**[Continue to Part 2: Frontend Development →](TUTORIAL-FRONTEND.md)**

In Part 2, we'll:
* Build the React UI
* Connect to MetaMask
* Interact with your deployed vault contract
* Create a complete user interface

Let's make this vault accessible to users!
