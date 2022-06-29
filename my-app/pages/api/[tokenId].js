export default function handler(req, res) {
    
    const tokenId = req.query.tokenId
    
    const image_url = "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/"

    res.status(200).json({
      name: "JohnnyTime #" + tokenId,
      description: "JohnnyTime is the collection of the JohnnyTime community",
      image: image_url + tokenId + ".svg",
    });
  }