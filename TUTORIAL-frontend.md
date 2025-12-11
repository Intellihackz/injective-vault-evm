# Part 2: Frontend Development

Welcome to the frontend development section! Your environment is already set up from the main tutorial, so we can jump straight into building the UI and connecting to our smart contracts.

## Table of Contents

* [Building the UI](#building-the-ui)
* [Connecting to MetaMask](#connecting-to-metamask)
* [Implementing INJ Transfers](#implementing-inj-transfers)
* [Working with the wINJ Token Contract](#working-with-the-winj-token-contract)
* [Interacting with the Vault Contract](#interacting-with-the-vault-contract)

---

## Building the UI

We'll start by building the complete user interface with mock data and state management, then add blockchain functionality later.

### Project Structure

Your frontend folder should have this structure:

```
frontend/
├── src/
│   ├── App.tsx         # Main app component (we'll build this)
│   ├── App.css         # Styling
│   └── abis/           # Contract ABIs (we'll create this later)
├── public/
└── package.json
```

### Setting Up TypeScript Interfaces

Open `src/App.tsx` and let's create our state interface first:

```typescript
import { useState } from "react";
import "./App.css";

interface VaultState {
  winjBalance: number;
  address: string;
  amount: string;
}
```

This interface defines the state we'll need to track:

* **winjBalance**: User's wINJ balance
* **address**: Recipient address for transfers
* **amount**: Amount to transfer

### Creating the Main Component

Now let's build the component with all our state and handlers:

```typescript
function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [state, setState] = useState<VaultState>({
    winjBalance: 0,
    address: "",
    amount: "",
  });

  const handleConnect = () => {
    // Simulate wallet connection (we'll implement real connection later)
    setIsConnected(true);
    setWalletAddress("inj1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0");
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-5)}`;
  };

  const [activeTab, setActiveTab] = useState<"INJ" | "wINJ">("INJ");

  const handleDeposit = () => {
    console.log("Deposit clicked");
  };

  const handleWithdraw = () => {
    console.log("Withdraw clicked");
  };

  const handleTransfer = () => {
    console.log("Transfer:", { address: state.address, amount: state.amount });
  };
```

Right now these are just placeholder functions that log to the console. We'll implement the real blockchain interactions later.

### Building the UI Structure

Now let's create the complete UI:

<details>
<summary>Click to view complete App component JSX</summary>

```typescript
  return (
    <div className="vault-container">
      <div className="vault-header">
        <h1 className="vault-title">Vault</h1>
        {!isConnected ? (
          <div className="wallet-info" onClick={handleConnect}>
            Connect
          </div>
        ) : (
          <div className="wallet-info" onClick={handleDisconnect}>
            {truncateAddress(walletAddress)}
          </div>
        )}
      </div>

      <div className="vault-content">
        <div className="left-panel">
          <div className="balance-section">
            <h2 className="total-title">Total in Vault</h2>
            <div className="total-amount">
              0.00 wINJ
            </div>

            <div className="button-group">
              <button className="action-button" onClick={handleDeposit}>
                Deposit
              </button>
              <button className="action-button" onClick={handleWithdraw}>
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="tab-header">
            <button
              className={`tab ${activeTab === "INJ" ? "active" : ""}`}
              onClick={() => setActiveTab("INJ")}
            >
              INJ
            </button>
            <button
              className={`tab ${activeTab === "wINJ" ? "active" : ""}`}
              onClick={() => setActiveTab("wINJ")}
            >
              wINJ
            </button>
          </div>
          
          <div className="transfer-form">
            <label className="form-label">address</label>
            <input
              type="text"
              className="form-input"
              value={state.address}
              onChange={(e) => setState({ ...state, address: e.target.value })}
            />

            <label className="form-label">amount</label>
            <div className="amount-input-container">
              <input
                type="text"
                className="form-input amount-input"
                value={state.amount}
                onChange={(e) => setState({ ...state, amount: e.target.value })}
              />
              <span className="currency-label">{activeTab}</span>
            </div>

            <button className="transfer-button" onClick={handleTransfer}>
              Transfer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

</details>

### Understanding the UI Components

Let's break down what we've built:

**Header Section**

* Displays "Vault" title
* Shows "Connect" button when wallet is not connected
* Shows truncated wallet address when connected (clicking disconnects)

**Left Panel - Vault Operations**

* Displays total balance in the vault
* Has Deposit and Withdraw buttons
* Will add input field for amount later

**Right Panel - Transfer Operations**

* Tab switcher between INJ and wINJ
* Input field for recipient address
* Input field for transfer amount
* Transfer button
* The currency label updates based on active tab

**State Management**

* All form inputs are controlled components
* State updates trigger re-renders
* Mock data shows how the UI will look with real data

### Adding the CSS

Our app needs styling to look good. Copy the complete stylesheet from the repository.

**Copy the CSS from the repository:**

Visit: `https://github.com/Intellihackz/injective-vault-evm/blob/main/frontend/src/App.css`

Copy the entire contents and paste it into your `src/App.css` file.

The CSS includes:

* Responsive layout with grid system
* Clean, minimalist design with dark borders
* Hover effects and transitions
* Mobile-responsive breakpoints
* Styled form inputs and buttons

### Running the UI

Start the development server:

```bash
npm run dev
```

You should see:

* A working UI with mock data
* Clickable connect/disconnect
* Tab switching between INJ and wINJ
* Form inputs that update state
* Buttons that log to console

Everything works visually, but nothing is connected to the blockchain yet. In the next section, we'll add the real wallet connection!

---

## Connecting to MetaMask

Now let's replace our mock wallet connection with real MetaMask integration.

### Adding TypeScript Declaration

MetaMask adds `window.ethereum`, but TypeScript doesn't know about it. Add this declaration at the top of your file (after imports):

```typescript
declare global {
  interface Window {
    ethereum?: any;
  }
}
```

Update the imports in `App.tsx`:

```typescript
import { useState } from "react";
import "./App.css";
import { BrowserProvider } from "ethers";
```

### Network Configuration

Add the network configuration for Injective EVM:

```typescript
const INJECTIVE_EVM_PARAMS = {
  chainId: "0x59f", // 1439 in hexadecimal
  chainName: "Injective EVM",
  rpcUrls: ["https://k8s.testnet.json-rpc.injective.network/"],
  nativeCurrency: {
    name: "Injective",
    symbol: "INJ",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnet.blockscout.injective.network/"],
};
```

This configuration tells MetaMask how to connect to Injective EVM testnet.

### Implementing the Wallet Connection

Now let's write the function that connects to MetaMask and switches to Injective EVM:

<details>
<summary>Click to view complete connectMetaMask function</summary>

```typescript
const connectMetaMask = async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not installed!");
    return;
  }

  const provider = new BrowserProvider(window.ethereum);

  try {
    // Request account access
    const accounts = await provider.send("eth_requestAccounts", []);
    console.log("Connected accounts:", accounts);

    // Check current chain ID
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    // Only switch/add network if not already on Injective EVM
    if (currentChainId !== INJECTIVE_EVM_PARAMS.chainId) {
      try {
        // Try to switch to the network first
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: INJECTIVE_EVM_PARAMS.chainId }],
        });
      } catch (switchError: any) {
        // If network doesn't exist (error code 4902), add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [INJECTIVE_EVM_PARAMS],
          });
        } else {
          throw switchError;
        }
      }
    }

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const actualBalance = Number(balance) / 10 ** 18;

    console.log("Balance:", balance);
    console.log("Actual balance:", actualBalance);
    console.log("Connected address:", address);

    return { provider, signer, address, balance: actualBalance };
  } catch (err) {
    console.error("MetaMask connection failed:", err);
  }
};
```

</details>

### Understanding the Connection Flow

Let's break down what this function does:

**1. Check MetaMask Installation**

```typescript
if (typeof window.ethereum === "undefined") {
  alert("MetaMask not installed!");
  return;
}
```

We first verify that MetaMask is installed by checking for `window.ethereum`.

**2. Create Provider**

```typescript
const provider = new BrowserProvider(window.ethereum);
```

The provider is our connection to the blockchain through MetaMask.

**3. Request Account Access**

```typescript
const accounts = await provider.send("eth_requestAccounts", []);
```

This triggers the MetaMask popup asking the user to connect their wallet.

**4. Check Current Network**

```typescript
const currentChainId = await window.ethereum.request({
  method: "eth_chainId",
});
```

We check which network the user is currently on.

**5. Switch or Add Network**

```typescript
if (currentChainId !== INJECTIVE_EVM_PARAMS.chainId) {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: INJECTIVE_EVM_PARAMS.chainId }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [INJECTIVE_EVM_PARAMS],
      });
    }
  }
}
```

This is the smart part:

* First, try to switch to Injective EVM if the network exists
* If the network doesn't exist (error 4902), add it to MetaMask
* This prevents the annoying "add network" popup every time

**6. Get Account Info**

```typescript
const signer = await provider.getSigner();
const address = await signer.getAddress();
const balance = await provider.getBalance(address);
const actualBalance = Number(balance) / 10 ** 18;
```

We get the signer (for signing transactions), wallet address, and INJ balance.

### Updating the Connection Handlers

Now replace the mock `handleConnect` function with the real implementation:

```typescript
const [balance, setBalance] = useState(0);

const handleConnect = async () => {
  try {
    const result = await connectMetaMask();
    if (result && result.address) {
      setIsConnected(true);
      setWalletAddress(result.address);
      setBalance(result.balance);
    }
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    alert(
      error instanceof Error ? error.message : "Failed to connect wallet"
    );
  }
};
```

### Updating the Header to Show Balance

Update the wallet info display to show the balance:

```typescript
{!isConnected ? (
  <div className="wallet-info" onClick={handleConnect}>
    Connect
  </div>
) : (
  <div className="wallet-info" onClick={handleDisconnect}>
    {balance.toFixed(4)} INJ | {truncateAddress(walletAddress)}
  </div>
)}
```

### Testing the Connection

Save your file and test it:

1. Click "Connect" in your app
2. MetaMask should pop up asking to connect
3. Approve the connection
4. If you're not on Injective EVM, MetaMask will ask to switch/add the network
5. Once connected, you should see your balance and address in the header

You now have a real wallet connection!

---

## Implementing INJ Transfers

Before we connect to our vault contract, let's implement basic INJ transfers. This will help us understand how transactions work and give users feedback on transaction status.

Update your imports to include more ethers functions:

```typescript
import { BrowserProvider, parseEther, formatEther } from "ethers";
```

* **parseEther**: Converts human-readable amounts (like "1.0") to wei
* **formatEther**: Converts wei back to human-readable amounts

### Adding Transaction Status Interface

Create an interface to track transaction status:

```typescript
interface TransactionStatus {
  type: "success" | "error" | "pending" | null;
  message: string;
  txHash?: string;
}
```

This lets us show different states:

* **pending**: Transaction submitted, waiting for confirmation
* **success**: Transaction confirmed
* **error**: Transaction failed
* **null**: No transaction status to display

### Adding State Variables

Add these state variables to track transfers:

```typescript
const [isTransferring, setIsTransferring] = useState(false);
const [txStatus, setTxStatus] = useState<TransactionStatus>({
  type: null,
  message: "",
});
```

### Implementing the Transfer Function

Now replace the mock `handleTransfer` with the real implementation:

<details>
<summary>Click to view complete handleTransfer function</summary>

```typescript
const handleTransfer = async () => {
  if (!isConnected) {
    setTxStatus({ type: "error", message: "Please connect your wallet first" });
    return;
  }

  if (!state.address || !state.amount) {
    setTxStatus({ type: "error", message: "Please enter both address and amount" });
    return;
  }

  try {
    const amount = parseFloat(state.amount);
    if (isNaN(amount) || amount <= 0) {
      setTxStatus({ type: "error", message: "Please enter a valid amount" });
      return;
    }

    if (amount > balance) {
      setTxStatus({ type: "error", message: "Insufficient balance" });
      return;
    }

    setIsTransferring(true);
    setTxStatus({ type: "pending", message: "Transaction pending..." });

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    console.log("Sending transaction...");
    const tx = await signer.sendTransaction({
      to: state.address,
      value: parseEther(state.amount),
    });

    console.log("Transaction sent:", tx.hash);
    setTxStatus({
      type: "pending",
      message: "Waiting for confirmation...",
      txHash: tx.hash,
    });

    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    setTxStatus({
      type: "success",
      message: "Transaction confirmed!",
      txHash: tx.hash,
    });

    const newBalance = await provider.getBalance(await signer.getAddress());
    setBalance(Number(formatEther(newBalance)));

    setState({ ...state, address: "", amount: "" });
  } catch (error: any) {
    console.error("Transfer failed:", error);
    setTxStatus({
      type: "error",
      message: error.message || "Transaction failed",
    });
  } finally {
    setIsTransferring(false);
  }
};
```

</details>

### Understanding the Transfer Flow

**1. Validation with User Feedback**

```typescript
if (!isConnected) {
  setTxStatus({ type: "error", message: "Please connect your wallet first" });
  return;
}
```

Instead of alerts, we now update the transaction status so users see errors inline.

**2. Transaction Submission**

```typescript
setIsTransferring(true);
setTxStatus({ type: "pending", message: "Transaction pending..." });

const tx = await signer.sendTransaction({
  to: state.address,
  value: parseEther(state.amount),
});
```

We show "Transaction pending..." immediately when the user clicks transfer.

**3. Waiting for Confirmation**

```typescript
setTxStatus({
  type: "pending",
  message: "Waiting for confirmation...",
  txHash: tx.hash,
});

const receipt = await tx.wait();
```

Once submitted, we update to "Waiting for confirmation..." and include the transaction hash.

**4. Success State**

```typescript
setTxStatus({
  type: "success",
  message: "Transaction confirmed!",
  txHash: tx.hash,
});
```

When confirmed, we show success with a link to view on the explorer.

### Updating the Transfer UI

Replace the transfer button and add the status display:

```typescript
<button
  disabled={isTransferring || !state.address || !state.amount}
  className="transfer-button"
  onClick={handleTransfer}
>
  {isTransferring ? "Transferring..." : "Transfer"}
</button>

{txStatus.type && (
  <div className={`tx-status tx-status-${txStatus.type}`}>
    <p>{txStatus.message}</p>
    {txStatus.txHash && txStatus.type === "success" && (
      <a
        href={`${INJECTIVE_EVM_PARAMS.blockExplorerUrls[0]}tx/${txStatus.txHash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="tx-link"
      >
        View on Explorer →
      </a>
    )}
  </div>
)}
```

The status display shows:

* Error messages in red
* Pending messages in yellow
* Success messages in green with explorer link

### Testing INJ Transfers

Now test your transfer functionality:

1. **Connect your wallet**
2. **Enter a recipient address** (you can use another address you own)
3. **Enter an amount** (like 0.01)
4. **Click "Transfer"**
5. **Approve in MetaMask**
6. **Watch the status updates**:
   * "Transaction pending..."
   * "Waiting for confirmation..." (with tx hash)
   * "Transaction confirmed!" (with explorer link)

You should see:

* Real-time status updates
* Transaction hash displayed
* Link to view on BlockScout
* Balance updates after confirmation
* Form clears automatically

You now have working INJ transfers with full user feedback!

---

## Working with the wINJ Token Contract

Now let's implement the real blockchain interactions for the wINJ token. We'll learn how to load the contract, approve spending, transfer tokens, and check balances.

### Setting Up Contract ABIs

First, we need the ABI (Application Binary Interface) for the wINJ token contract. Create a new folder `src/abis` and add a file called `wINJ.json`.

Copy the complete wINJ ABI from the repository: `https://github.com/Intellihackz/injective-vault-evm/blob/main/frontend/src/abis/wINJ.json`

The ABI includes all the functions we need:

* **balanceOf**: Get a user's wINJ balance
* **approve**: Approve a contract to spend tokens
* **transfer**: Transfer tokens to another address
* **allowance**: Check how much a contract is approved to spend

### Adding Contract Addresses

At the top of your `App.tsx` file, add the contract addresses as constants:

```typescript
const WINJ_ADDRESS = "0x0000000088827d2d103ee2d9A6b781773AE03FfB";
const VAULT_ADDRESS = "YOUR_DEPLOYED_VAULT_ADDRESS"; // Replace with your deployed vault address
```

Replace `YOUR_DEPLOYED_VAULT_ADDRESS` with the address from when you deployed your SavingsVault contract.

### Importing the ABI and Contract Class

Update your imports to include the Contract class and the wINJ ABI:

```typescript
import { BrowserProvider, parseEther, formatEther, Contract } from "ethers";
import wINJABI from "./abis/wINJ.json";
```

### Loading the wINJ Contract

Create a helper function to load the wINJ contract:

```typescript
const getWINJContract = async () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask not installed");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const wINJContract = new Contract(WINJ_ADDRESS, wINJABI, signer);

  return { wINJContract, signer, provider };
};
```

This function:

* Checks that MetaMask is installed
* Creates a provider to connect to the blockchain
* Gets the signer (your connected wallet) to sign transactions
* Creates a contract instance with the address, ABI, and signer

### Getting wINJ Balance

Now let's create a function to fetch the user's wINJ balance:

```typescript
const getWINJBalance = async (address: string) => {
  try {
    const { wINJContract } = await getWINJContract();
    const balance = await wINJContract.balanceOf(address);
    return Number(formatEther(balance));
  } catch (error) {
    console.error("Failed to get wINJ balance:", error);
    return 0;
  }
};
```

### Understanding Token Approvals

Before we can interact with our vault contract, we need to understand an important concept: **wINJ token approvals**.

#### Why Do We Need to Approve?

When a user wants to deposit into the vault, our vault contract calls `wINJ.transferFrom(msg.sender, address(this), amount)` to move tokens from the user's wallet into the vault.

However, the wINJ token contract won't allow our vault to transfer tokens unless the user has first called `wINJ.approve(vaultAddress, amount)` to give permission.

Think of it like this: You own wINJ tokens, and you're telling the wINJ contract "I give permission for the vault contract to transfer up to X amount of my wINJ tokens." Without this approval step, the wINJ contract will reject any attempt by the vault to move your tokens.

### Checking Current Allowance

Before approving, it's good practice to check if the vault already has an allowance:

```typescript
const checkAllowance = async (ownerAddress: string) => {
  try {
    const { wINJContract } = await getWINJContract();
    const allowance = await wINJContract.allowance(ownerAddress, VAULT_ADDRESS);
    return Number(formatEther(allowance));
  } catch (error) {
    console.error("Failed to check allowance:", error);
    return 0;
  }
};
```

This function checks how much the vault is currently approved to spend from the user's wINJ balance.

### Adding the Approval Modal State

Add new state variables for the approval flow:

```typescript
const [showApprovalModal, setShowApprovalModal] = useState(false);
const [isApproving, setIsApproving] = useState(false);
const [isApproved, setIsApproved] = useState(false);
```

* **showApprovalModal**: Controls whether the modal is visible
* **isApproving**: Tracks if approval transaction is in progress
* **isApproved**: Tracks if user has completed approval

### Creating the Approval Modal UI

Add this modal to your JSX, right before the vault container:

```typescript
return (
  <>
    {showApprovalModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 className="modal-title">Approve wINJ Spending</h2>
          <p className="modal-description">
            To use this vault, you need to approve spending of wINJ tokens.
            This is required to continue.
          </p>
          <div className="modal-buttons">
            <button
              className="modal-button modal-button-primary"
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? "Approving..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    )}

    <div className="vault-container">
      {/* ... rest of your UI ... */}
    </div>
  </>
);
```

The modal:

* Blocks the entire screen (user must approve to continue)
* Explains why approval is needed
* Shows loading state during approval
* Cannot be dismissed (no close button)

### Implementing Real wINJ Approval

Now let's create the approval function:

<details>
<summary>Click to view complete handleApprove function</summary>

```typescript
const handleApprove = async () => {
  if (!walletAddress) {
    setTxStatus({ type: "error", message: "Please connect your wallet first" });
    return;
  }

  setIsApproving(true);
  setTxStatus({ type: "pending", message: "Approving wINJ..." });

  try {
    const { wINJContract } = await getWINJContract();
    
    // Approve a large amount (effectively unlimited for practical purposes)
    const maxAmount = "1000000000000000000000000"; // 1 million wINJ in wei
    
    console.log("Requesting approval...");
    const tx = await wINJContract.approve(VAULT_ADDRESS, maxAmount);
    
    setTxStatus({
      type: "pending",
      message: "Waiting for approval confirmation...",
      txHash: tx.hash,
    });

    await tx.wait();
    
    setTxStatus({
      type: "success",
      message: "wINJ approval successful!",
      txHash: tx.hash,
    });

    setIsApproved(true);
    
    // Close modal after a short delay
    setTimeout(() => {
      setShowApprovalModal(false);
      setTxStatus({ type: null, message: "" });
    }, 2000);

  } catch (error: any) {
    console.error("Approval failed:", error);
    setTxStatus({
      type: "error",
      message: error.message || "Approval failed",
    });
  } finally {
    setIsApproving(false);
  }
};
```

</details>

**Understanding the Approval Amount:**
We approve a large amount (1 million wINJ) so users don't need to approve every time they deposit. This is a common pattern in DApps to improve user experience.

### Updating Connection to Check Approval Status

Update your `handleConnect` function to check if the user has already approved the vault:

```typescript
const handleConnect = async () => {
  try {
    const result = await connectMetaMask();
    if (result && result.address) {
      setIsConnected(true);
      setWalletAddress(result.address);
      setBalance(result.balance);
      
      // Check if vault is already approved
      const allowance = await checkAllowance(result.address);
      if (allowance > 0) {
        setIsApproved(true);
      } else {
        // Show approval modal if not approved
        setShowApprovalModal(true);
      }

      // Get wINJ balance
      const winjBal = await getWINJBalance(result.address);
      setState(prev => ({ ...prev, winjBalance: winjBal }));
    }
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    alert(
      error instanceof Error ? error.message : "Failed to connect wallet"
    );
  }
};
```

Now the modal only shows if the user hasn't approved the vault before!

### Implementing wINJ Transfers

Update your `handleTransfer` function to support wINJ transfers when the wINJ tab is active:

<details>
<summary>Click to view complete handleTransfer with wINJ support</summary>

```typescript
const handleTransfer = async () => {
  if (!isConnected) {
    setTxStatus({ type: "error", message: "Please connect your wallet first" });
    return;
  }

  if (!state.address || !state.amount) {
    setTxStatus({ type: "error", message: "Please enter both address and amount" });
    return;
  }

  try {
    const amount = parseFloat(state.amount);
    if (isNaN(amount) || amount <= 0) {
      setTxStatus({ type: "error", message: "Please enter a valid amount" });
      return;
    }

    setIsTransferring(true);
    setTxStatus({ type: "pending", message: "Transaction pending..." });

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    if (activeTab === "INJ") {
      // INJ transfer (existing code)
      if (amount > balance) {
        setTxStatus({ type: "error", message: "Insufficient INJ balance" });
        setIsTransferring(false);
        return;
      }

      const tx = await signer.sendTransaction({
        to: state.address,
        value: parseEther(state.amount),
      });

      setTxStatus({
        type: "pending",
        message: "Waiting for confirmation...",
        txHash: tx.hash,
      });

      await tx.wait();

      setTxStatus({
        type: "success",
        message: "INJ transfer confirmed!",
        txHash: tx.hash,
      });

      const newBalance = await provider.getBalance(await signer.getAddress());
      setBalance(Number(formatEther(newBalance)));

    } else {
      // wINJ transfer (new code)
      if (amount > state.winjBalance) {
        setTxStatus({ type: "error", message: "Insufficient wINJ balance" });
        setIsTransferring(false);
        return;
      }

      const { wINJContract } = await getWINJContract();
      const tx = await wINJContract.transfer(state.address, parseEther(state.amount));

      setTxStatus({
        type: "pending",
        message: "Waiting for confirmation...",
        txHash: tx.hash,
      });

      await tx.wait();

      setTxStatus({
        type: "success",
        message: "wINJ transfer confirmed!",
        txHash: tx.hash,
      });

      // Update wINJ balance
      const newWinjBalance = await getWINJBalance(walletAddress);
      setState(prev => ({ ...prev, winjBalance: newWinjBalance }));
    }

    setState(prev => ({ ...prev, address: "", amount: "" }));
    
  } catch (error: any) {
    console.error("Transfer failed:", error);
    setTxStatus({
      type: "error",
      message: error.message || "Transaction failed",
    });
  } finally {
    setIsTransferring(false);
  }
};
```

</details>

### Displaying wINJ Balance in the UI

Update your UI to show both INJ and wINJ balances in the header:

```typescript
{!isConnected ? (
  <div className="wallet-info" onClick={handleConnect}>
    Connect
  </div>
) : (
  <div className="wallet-info" onClick={handleDisconnect}>
    {balance.toFixed(4)} INJ | {state.winjBalance.toFixed(4)} wINJ |{" "}
    {truncateAddress(walletAddress)}
  </div>
)}
```

This displays:

* **INJ balance** - Your native INJ tokens
* **wINJ balance** - Your wrapped INJ (ERC20) tokens  
* **Wallet address** - Truncated for readability

### Adding wINJ to MetaMask

To make it easier for users to track their wINJ balance, let's add a button that adds the wINJ token to their MetaMask wallet with one click.

Create a function to add wINJ to the user's wallet:

```typescript
const addWINJToWallet = async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask not installed!");
    return;
  }

  try {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: WINJ_ADDRESS,
          symbol: "wINJ",
          decimals: 18,
        },
      },
    });
  } catch (error) {
    console.error("Failed to add wINJ token:", error);
  }
};
```

This function:
* Uses MetaMask's `wallet_watchAsset` method
* Specifies the token details (address, symbol, decimals)
* Opens MetaMask to let the user confirm adding the token

### Adding the Button to the UI

Update your header to include the "Add wINJ" button:

```typescript
<div className="vault-header">
  <div className="header-left">
    <h1 className="vault-title">Vault</h1>
  </div>
  <div className="header-right">
    {isConnected && (
      <button className="add-token-button" onClick={addWINJToWallet}>
        + Add wINJ
      </button>
    )}
    {!isConnected ? (
      <div className="wallet-info" onClick={handleConnect}>
        Connect
      </div>
    ) : (
      <div className="wallet-info" onClick={handleDisconnect}>
        {balance.toFixed(4)} INJ | {state.winjBalance.toFixed(4)} wINJ |{" "}
        {truncateAddress(walletAddress)}
      </div>
    )}
  </div>
</div>
```

The button only shows when the wallet is connected, and clicking it prompts MetaMask to add the wINJ token to the user's wallet for easy tracking.

### Testing wINJ Functionality

Now test all the wINJ features:

1. **Connect Wallet**
   * If first time: Approval modal appears
   * If previously approved: Modal is skipped

2. **Approve wINJ** (if modal shows)
   * Click "Approve"
   * Approve in MetaMask
   * Wait for confirmation
   * Modal closes automatically

3. **Check Balances**
   * See both INJ and wINJ balances displayed

4. **Transfer wINJ**
   * Switch to wINJ tab
   * Enter recipient address
   * Enter amount
   * Click "Transfer"
   * Approve in MetaMask
   * Watch status updates

You should see:

* Automatic approval status check on connect
* Real blockchain approval transaction
* wINJ balance displayed and updated
* wINJ transfers work correctly
* Different behavior for INJ vs wINJ tabs

---

## Interacting with the Vault Contract

Now that we can work with wINJ tokens, let's connect to our deployed SavingsVault contract to enable deposits and withdrawals.

### Getting the Vault Contract ABI

When we compiled our SavingsVault contract with Hardhat, it automatically generated an ABI file. This ABI is located at:

```
contract/artifacts/contracts/SavingsVault.sol/SavingsVault.json
```

**To get the ABI:**

1. Navigate to your contract folder: `cd contract`
2. Open the file: `contract/artifacts/contracts/SavingsVault.sol/SavingsVault.json`
3. Copy the entire `abi` array from this file
4. Create a new file in your frontend: `frontend/src/abis/SavingsVault.json`
5. Paste the ABI array there

Alternatively, you can copy the ABI from the repository: `https://github.com/Intellihackz/injective-vault-evm/blob/main/frontend/src/abis/SavingsVault.json`

The SavingsVault ABI includes these key functions:

* **deposit(uint256 amount)** - Deposit wINJ into the vault
* **withdraw(uint256 amount)** - Withdraw wINJ from the vault
* **myBalance()** - Get your deposited balance in the vault

### Importing the Vault ABI

Update your imports to include the Vault ABI:

```typescript
import { BrowserProvider, parseEther, formatEther, Contract } from "ethers";
import wINJABI from "./abis/wINJ.json";
import vaultABI from "./abis/SavingsVault.json";
```

### Adding Vault Balance State

Add a state variable to track the user's vault balance:

```typescript
const [vaultBalance, setVaultBalance] = useState(0);
const [vaultAmount, setVaultAmount] = useState("");
```

### Getting Vault Balance

Create a function to fetch the user's balance in the vault:

```typescript
const getVaultBalance = async () => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const vaultContract = new Contract(VAULT_ADDRESS, vaultABI, signer);
    
    const balance = await vaultContract.myBalance();
    const formattedBalance = Number(formatEther(balance));
    
    setVaultBalance(formattedBalance);
    console.log("Vault Balance:", formattedBalance);
    
    return formattedBalance;
  } catch (error) {
    console.error("Error getting vault balance:", error);
    return 0;
  }
};
```

This function:

* Creates a contract instance connected to your vault
* Calls `myBalance()` to get the user's deposited amount
* Formats it from wei to human-readable format
* Updates the state to display in the UI

### Updating Connection to Load Vault Balance

Update your `handleConnect` function to also load the vault balance:

```typescript
// Add this after getting wINJ balance
await getVaultBalance();
```

Your complete `handleConnect` should now fetch:

1. INJ balance
2. wINJ balance  
3. Vault balance
4. Approval status

### Implementing the Deposit Function

Now let's implement the real deposit functionality:

<details>
<summary>Click to view complete handleDeposit function</summary>

```typescript
const handleDeposit = async () => {
  if (!vaultAmount) {
    setTxStatus({ type: "error", message: "Please enter an amount" });
    return;
  }

  const amount = parseFloat(vaultAmount);
  if (isNaN(amount) || amount <= 0) {
    setTxStatus({ type: "error", message: "Please enter a valid amount" });
    return;
  }

  if (amount > state.winjBalance) {
    setTxStatus({ type: "error", message: "Insufficient wINJ balance" });
    return;
  }

  try {
    setTxStatus({ type: "pending", message: "Depositing to vault..." });
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const vaultContract = new Contract(VAULT_ADDRESS, vaultABI, signer);

    console.log("Depositing:", amount, "wINJ");
    const tx = await vaultContract.deposit(parseEther(vaultAmount));
    
    setTxStatus({
      type: "pending",
      message: "Waiting for confirmation...",
      txHash: tx.hash,
    });

    await tx.wait();
    
    setTxStatus({
      type: "success",
      message: "Deposit successful!",
      txHash: tx.hash,
    });

    // Update balances
    const address = await signer.getAddress();
    const winjBal = await getWINJBalance(address);
    setState(prev => ({ ...prev, winjBalance: winjBal }));
    await getVaultBalance();

    // Clear input
    setVaultAmount("");
    
  } catch (error: any) {
    console.error("Deposit failed:", error);
    setTxStatus({
      type: "error",
      message: error.message || "Deposit failed",
    });
  }
};
```

</details>

### Implementing the Withdraw Function

Similarly, implement the withdraw functionality:

<details>
<summary>Click to view complete handleWithdraw function</summary>

```typescript
const handleWithdraw = async () => {
  if (!vaultAmount) {
    setTxStatus({ type: "error", message: "Please enter an amount" });
    return;
  }

  const amount = parseFloat(vaultAmount);
  if (isNaN(amount) || amount <= 0) {
    setTxStatus({ type: "error", message: "Please enter a valid amount" });
    return;
  }

  if (amount > vaultBalance) {
    setTxStatus({ type: "error", message: "Insufficient balance in vault" });
    return;
  }

  try {
    setTxStatus({ type: "pending", message: "Withdrawing from vault..." });
    
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const vaultContract = new Contract(VAULT_ADDRESS, vaultABI, signer);

    console.log("Withdrawing:", amount, "wINJ");
    const tx = await vaultContract.withdraw(parseEther(vaultAmount));
    
    setTxStatus({
      type: "pending",
      message: "Waiting for confirmation...",
      txHash: tx.hash,
    });

    await tx.wait();
    
    setTxStatus({
      type: "success",
      message: "Withdrawal successful!",
      txHash: tx.hash,
    });

    // Update balances
    const address = await signer.getAddress();
    const winjBal = await getWINJBalance(address);
    setState(prev => ({ ...prev, winjBalance: winjBal }));
    await getVaultBalance();

    // Clear input
    setVaultAmount("");
    
  } catch (error: any) {
    console.error("Withdraw failed:", error);
    setTxStatus({
      type: "error",
      message: error.message || "Withdrawal failed",
    });
  }
};
```

</details>

### Updating the UI for Vault Operations

Update the left panel to show vault balance and amount input:

```typescript
<div className="left-panel">
  <div className="balance-section">
    <h2 className="total-title">Total in Vault</h2>
    <div className="total-amount">
      {vaultBalance.toFixed(4)} wINJ
    </div>

    <input
      type="text"
      className="vault-input"
      placeholder="0.0"
      value={vaultAmount}
      onChange={(e) => setVaultAmount(e.target.value)}
      disabled={!isConnected || !isApproved}
    />

    <div className="button-group">
      <button
        className="action-button"
        onClick={handleDeposit}
        disabled={!isConnected || !isApproved}
      >
        Deposit
      </button>
      <button
        className="action-button"
        onClick={handleWithdraw}
        disabled={!isConnected || !isApproved}
      >
        Withdraw
      </button>
    </div>
  </div>
</div>
```

The buttons are disabled until:

1. Wallet is connected
2. wINJ spending is approved

### Testing Vault Functionality

Now test the complete vault flow:

1. **Connect Wallet & Approve**
   * Connect your wallet
   * Approve wINJ spending (if needed)
   * See your vault balance (should be 0 initially)

2. **Deposit wINJ**
   * Enter an amount (e.g., 0.01)
   * Click "Deposit"
   * Approve transaction in MetaMask
   * Wait for confirmation
   * See vault balance update

3. **Withdraw wINJ**
   * Enter an amount to withdraw
   * Click "Withdraw"
   * Approve transaction in MetaMask
   * Wait for confirmation
   * See vault balance decrease and wINJ balance increase

You should see:

* Real-time vault balance updates
* Deposit transactions work correctly
* Withdraw transactions work correctly
* Transaction status feedback
* Balance updates after each operation
* Input field clears after successful operations

---

## Congratulations! 🎉

You've successfully built a complete savings vault DApp on Injective EVM!

### Resources

* **Injective Documentation**: [https://docs.injective.network](https://docs.injective.network)
* **Ethers.js Docs**: [https://docs.ethers.org](https://docs.ethers.org)
* **React Documentation**: [https://react.dev](https://react.dev)
* **Solidity Docs**: [https://docs.soliditylang.org](https://docs.soliditylang.org)

Thank you for following along with this tutorial. Happy building! 🚀
