import axios from "axios";

const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";

// 🔹 Upload file + metadata to Pinata
export async function uploadToPinata(file, description) {
  try {
    // Step 1: Upload raw file to IPFS
    console.log("📤 Uploading file to Pinata...");
    const formData = new FormData();
    formData.append("file", file);

    const fileRes = await axios.post(`${PINATA_BASE_URL}/pinFileToIPFS`, formData, {
      maxContentLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data`,
        Authorization: `Bearer ${PINATA_JWT}`, // ✅ Use JWT
      },
    });

    const fileHash = fileRes.data.IpfsHash;
    console.log("✅ File uploaded:", fileHash);

    // Step 2: Create metadata JSON
    const metadata = {
      name: file.name || "AI Model",
      description: description || "Decentralized AI Model NFT",
      image: `ipfs://${fileHash}`, // AI model stored as "image"
      properties: {
        fileType: file.type,
        fileSize: file.size,
      },
    };

    // Step 3: Upload metadata JSON
    console.log("📤 Uploading metadata JSON to Pinata...");
    const metaRes = await axios.post(`${PINATA_BASE_URL}/pinJSONToIPFS`, metadata, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`, // ✅ Use JWT
      },
    });

    const metadataHash = metaRes.data.IpfsHash;
    console.log("✅ Metadata uploaded:", metadataHash);

    // Return tokenURI for smart contract
    return `ipfs://${metadataHash}`;
  } catch (err) {
    console.error("❌ Pinata upload error:", err.response?.data || err.message);
    return null;
  }
}
