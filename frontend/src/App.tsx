import { useState } from "react";
import "./App.css";
import { BrowserProvider, formatEther, parseEther, Contract, MaxUint256 } from "ethers";
import WINJ_ABI from "./abis/wINJ.json";
import VAULT_ABI from "./abis/SavingsVault.json";
import injectiveLogo from "./assets/logo.png";
// Contract addresses
const WINJ_CONTRACT_ADDRESS = "0x0000000088827d2d103ee2d9A6b781773AE03FfB";
const VAULT_CONTRACT_ADDRESS = "0x26292356C2b29291B46DdEB18C6B8973026933bF";


interface VaultState {
  totalBalance: number;
  injBalance: number;
  winjBalance: number;
  address: string;
  amount: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface TransactionStatus {
  type: "success" | "error" | "pending" | null;
  message: string;
  txHash?: string;
}

const INJECTIVE_EVM_PARAMS = {
  chainId: "0x59f",
  chainName: "Injective EVM",
  rpcUrls: ["https://k8s.testnet.json-rpc.injective.network/"],
  nativeCurrency: {
    name: "Injective",
    symbol: "INJ",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnet.blockscout.injective.network/"],
};

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [winjBalance, setWinjBalance] = useState(0);
  const [isTransferring, setIsTransferring] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    type: null,
    message: "",
  });
  const [state, setState] = useState<VaultState>({
    totalBalance: 0,
    injBalance: 0,
    winjBalance: 0,
    address: "",
    amount: "",
  });
  const [vaultAmount, setVaultAmount] = useState("");
  const [vaultBalance, setVaultBalance] = useState(0);

  // Get wINJ balance
  const getWINJBalance = async (address: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const winjContract = new Contract(
        WINJ_CONTRACT_ADDRESS,
        WINJ_ABI,
        provider
      );
      const balance = await winjContract.balanceOf(address);
      const formattedBalance = Number(formatEther(balance));
      setWinjBalance(formattedBalance);
      console.log("wINJ Balance:", formattedBalance);
    } catch (error) {
      console.error("Error getting wINJ balance:", error);
    }
  };

  // Get vault balance
  const getVaultBalance = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vaultContract = new Contract(
        VAULT_CONTRACT_ADDRESS,
        VAULT_ABI,
        signer
      );
      const balance = await vaultContract.myBalance();
      const formattedBalance = Number(formatEther(balance));
      setVaultBalance(formattedBalance);
      console.log("Vault Balance:", formattedBalance);
    } catch (error) {
      console.error("Error getting vault balance:", error);
    }
  };

  // Check allowance (will be used for checking if vault is approved)
  const checkAllowance = async (address: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const winjContract = new Contract(
        WINJ_CONTRACT_ADDRESS,
        WINJ_ABI,
        provider
      );
      const allowance = await winjContract.allowance(
        address,
        VAULT_CONTRACT_ADDRESS
      );
      console.log("Current allowance:", formatEther(allowance));

      // If allowance is greater than 0, consider it approved
      const isApproved = Number(allowance) > 0;
      setIsApproved(isApproved);

      return allowance;
    } catch (error) {
      console.error("Error checking allowance:", error);
      return 0;
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const winjContract = new Contract(
        WINJ_CONTRACT_ADDRESS,
        WINJ_ABI,
        signer
      );

      // Approve maximum uint256 amount for unlimited approval
      console.log("Approving wINJ spending for vault...");
      
      const tx = await winjContract.approve(VAULT_CONTRACT_ADDRESS, MaxUint256);
      console.log("Approval transaction sent:", tx.hash);

      setIsApproving(false);
      setShowApprovalModal(false);
      setIsApproved(true);
    } catch (error) {
      console.error("Approval failed:", error);
      setIsApproving(false);
      alert(error instanceof Error ? error.message : "Approval failed");
    }
  };

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
            address: WINJ_CONTRACT_ADDRESS,
            symbol: "wINJ",
            decimals: 18,
          },
        },
      });
    } catch (error) {
      console.error("Failed to add wINJ token:", error);
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask not installed!");
      return;
    }

    const provider = new BrowserProvider(window.ethereum);

    try {
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Connected accounts:", accounts);

      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });

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
          } else {
            throw switchError;
          }
        }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const actualbalance = Number(balance) / 10 ** 18;

      setBalance(actualbalance);
      console.log("Balance:", balance);
      console.log("Actual balance:", actualbalance);
      console.log("Connected address:", address);

      return { provider, signer, address };
    } catch (err) {
      console.error("MetaMask connection failed:", err);
    }
  };

  const handleConnect = async () => {
    try {
      const result = await connectMetaMask();
      if (result && result.address) {
        setIsConnected(true);
        setWalletAddress(result.address);

        // Get wINJ balance
        await getWINJBalance(result.address);

        // Get vault balance
        await getVaultBalance();

        // Check if already approved
        const allowance = await checkAllowance(result.address);

        // Only show approval modal if not already approved
        if (Number(allowance) === 0) {
          setShowApprovalModal(true);
        } else {
          console.log("Already approved, skipping approval modal");
          setIsApproved(true);
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert(
        error instanceof Error ? error.message : "Failed to connect wallet"
      );
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
    setIsApproved(false);
    setBalance(0);
    setWinjBalance(0);
    setVaultBalance(0);
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-5)}`;
  };

  const [activeTab, setActiveTab] = useState<"INJ" | "wINJ">("INJ");

  const handleDeposit = async () => {
    if (!vaultAmount) {
      alert("Please enter an amount");
      return;
    }

    const amount = parseFloat(vaultAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount > winjBalance) {
      alert("Insufficient wINJ balance");
      return;
    }

    try {
      console.log("Depositing:", amount, "wINJ");
      
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vaultContract = new Contract(
        VAULT_CONTRACT_ADDRESS,
        VAULT_ABI,
        signer
      );

      const tx = await vaultContract.deposit(parseEther(vaultAmount));
      console.log("Deposit transaction sent:", tx.hash);

      // Update balances immediately (optimistically)
      const address = await signer.getAddress();
      await getWINJBalance(address);
      await getVaultBalance();

      // Clear input after successful deposit
      setVaultAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
      alert(error instanceof Error ? error.message : "Deposit failed");
    }
  };

  const handleWithdraw = async () => {
    if (!vaultAmount) {
      alert("Please enter an amount");
      return;
    }

    const amount = parseFloat(vaultAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (amount > vaultBalance) {
      alert("Insufficient wINJ balance in vault");
      return;
    }

    try {
      console.log("Withdrawing:", amount, "wINJ");
      
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const vaultContract = new Contract(
        VAULT_CONTRACT_ADDRESS,
        VAULT_ABI,
        signer
      );

      const tx = await vaultContract.withdraw(parseEther(vaultAmount));
      console.log("Withdraw transaction sent:", tx.hash);

      // Update balances immediately (optimistically)
      const address = await signer.getAddress();
      await getWINJBalance(address);
      await getVaultBalance();

      // Clear input after successful withdrawal
      setVaultAmount("");
    } catch (error) {
      console.error("Withdraw failed:", error);
      alert(error instanceof Error ? error.message : "Withdraw failed");
    }
  };

  const handleTransfer = async () => {
    if (!isConnected) {
      setTxStatus({
        type: "error",
        message: "Please connect your wallet first",
      });
      return;
    }

    if (!state.address || !state.amount) {
      setTxStatus({
        type: "error",
        message: "Please enter both address and amount",
      });
      return;
    }

    try {
      const amount = parseFloat(state.amount);
      if (isNaN(amount) || amount <= 0) {
        setTxStatus({ type: "error", message: "Please enter a valid amount" });
        return;
      }

      // Check balance based on active tab
      if (activeTab === "INJ" && amount > balance) {
        setTxStatus({ type: "error", message: "Insufficient INJ balance" });
        return;
      }

      if (activeTab === "wINJ" && amount > winjBalance) {
        setTxStatus({ type: "error", message: "Insufficient wINJ balance" });
        return;
      }

      setIsTransferring(true);
      setTxStatus({ type: "pending", message: "Transaction pending..." });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      let tx;

      if (activeTab === "INJ") {
        // Transfer native INJ
        console.log("Sending INJ transaction...");
        tx = await signer.sendTransaction({
          to: state.address,
          value: parseEther(state.amount),
        });
      } else {
        // Transfer wINJ token
        console.log("Sending wINJ transaction...");
        const winjContract = new Contract(
          WINJ_CONTRACT_ADDRESS,
          WINJ_ABI,
          signer
        );
        tx = await winjContract.transfer(state.address, parseEther(state.amount));
      }

      console.log("Transaction sent:", tx.hash);
      setTxStatus({
        type: "success",
        message: "Transaction sent!",
        txHash: tx.hash,
      });

      // Update balances immediately (optimistically)
      const address = await signer.getAddress();
      if (activeTab === "INJ") {
        const newBalance = await provider.getBalance(address);
        setBalance(Number(formatEther(newBalance)));
      } else {
        await getWINJBalance(address);
      }

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

  // Check if buttons should be disabled
  const buttonsDisabled = !isConnected || !isApproved;

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
        <div className="vault-header">
          <div className="header-left">
            <img src={injectiveLogo} alt="Injective" className="injective-logo" />
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
                {balance.toFixed(4)} INJ | {winjBalance.toFixed(4)} wINJ |{" "}
                {truncateAddress(walletAddress)}
              </div>
            )}
          </div>
        </div>

        <div className="vault-content">
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
                disabled={buttonsDisabled}
                style={{
                  opacity: buttonsDisabled ? 0.5 : 1,
                  cursor: buttonsDisabled ? "not-allowed" : "text",
                }}
              />

              <div className="button-group">
                <button
                  className="action-button"
                  onClick={handleDeposit}
                  disabled={buttonsDisabled}
                  style={{
                    opacity: buttonsDisabled ? 0.5 : 1,
                    cursor: buttonsDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M8 3L8 13M8 3L4 7M8 3L12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Deposit
                </button>
                <button
                  className="action-button"
                  onClick={handleWithdraw}
                  disabled={buttonsDisabled}
                  style={{
                    opacity: buttonsDisabled ? 0.5 : 1,
                    cursor: buttonsDisabled ? "not-allowed" : "pointer",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                    <path d="M8 13L8 3M8 13L12 9M8 13L4 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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
                disabled={buttonsDisabled}
                style={{
                  opacity: buttonsDisabled ? 0.5 : 1,
                  cursor: buttonsDisabled ? "not-allowed" : "pointer",
                }}
              >
                INJ
              </button>
              <button
                className={`tab ${activeTab === "wINJ" ? "active" : ""}`}
                onClick={() => setActiveTab("wINJ")}
                disabled={buttonsDisabled}
                style={{
                  opacity: buttonsDisabled ? 0.5 : 1,
                  cursor: buttonsDisabled ? "not-allowed" : "pointer",
                }}
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
                onChange={(e) =>
                  setState({ ...state, address: e.target.value })
                }
                disabled={buttonsDisabled}
                style={{
                  opacity: buttonsDisabled ? 0.5 : 1,
                  cursor: buttonsDisabled ? "not-allowed" : "text",
                }}
              />

              <label className="form-label">amount</label>
              <div className="amount-input-container">
                <input
                  type="text"
                  className="form-input amount-input"
                  value={state.amount}
                  onChange={(e) =>
                    setState({ ...state, amount: e.target.value })
                  }
                  disabled={buttonsDisabled}
                  style={{
                    opacity: buttonsDisabled ? 0.5 : 1,
                    cursor: buttonsDisabled ? "not-allowed" : "text",
                  }}
                />
                <span className="currency-label">{activeTab}</span>
              </div>

              <button
                disabled={
                  buttonsDisabled ||
                  isTransferring ||
                  !state.address ||
                  !state.amount
                }
                className="transfer-button"
                onClick={handleTransfer}
                style={{
                  opacity:
                    buttonsDisabled ||
                    isTransferring ||
                    !state.address ||
                    !state.amount
                      ? 0.5
                      : 1,
                  cursor:
                    buttonsDisabled ||
                    isTransferring ||
                    !state.address ||
                    !state.amount
                      ? "not-allowed"
                      : "pointer",
                }}
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
