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