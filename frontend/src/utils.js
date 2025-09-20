// utils.js
export function ipfsToHttp(ipfsUrl) {
  if (!ipfsUrl) return "";
  // ipfs://bafy.../some.json  -> https://ipfs.io/ipfs/bafy.../some.json
  return ipfsUrl.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/");
}
