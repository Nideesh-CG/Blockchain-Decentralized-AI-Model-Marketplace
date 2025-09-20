import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import AIModelNFT from "./AIModelNFT.json";

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

export async function connectWallet() {
  const provider = await detectEthereumProvider();
  if (provider) {
    await provider.request({ method: "eth_requestAccounts" });
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    const contract = new ethers.Contract(contractAddress, AIModelNFT.abi, signer);
    return { contract, signer, provider: ethersProvider };
  } else {
    alert("Please install MetaMask!");
  }
}
