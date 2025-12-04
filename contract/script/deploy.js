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
