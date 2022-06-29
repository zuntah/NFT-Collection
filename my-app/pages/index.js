import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [presaleStarted, setPresaleStarted] = useState(false)
  const [presaleEnded, setPresaleEnded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0")
  const web3ModalRef = useRef()

  const getProviderOrSigner = async (needSigner = false) => {

    // Get Provider Pbject
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider)

    // Check if Ropsten is connected
    const { chainId } = await web3Provider.getNetwork()
    if (chainId !== 3) {
      window.alert("Change the network to Ropsten")
      throw new Error("Change network to Ropsten")
    }

    if (needSigner) {
      const signer = web3Provider.getSigner()
      return signer
    }
    return web3Provider
  }

  const connectWallet = async () => {
    try {
      await getProviderOrSigner()
      setWalletConnected(true)
    } catch (err) {
      console.error(err)
      return false
    }
  }

  const mint = async (saleType) => {
    try {

      const signer = await getProviderOrSigner(true)

      const NFTContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx = null
      if (saleType == "presale") {
        tx = await NFTContract.presaleMint({
          value: utils.parseEther("0.01"),
        })
      } else if (saleType == "public") {
        tx = await NFTContract.mint({
          value: utils.parseEther("0.01"),
        })
      } else {
        window.alert("Wrong sale type!")
        return false;
      }

      setLoading(true)

      await tx.wait()
      setLoading(false)
      window.alert("You successfully minted a JohnnyTime NFT!");

    } catch (err) {
      console.log(err.message)
      return false
    }
  }

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true)

      const NFTContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const tx = await NFTContract.startPresale()
      setLoading(true)

      await tx.wait()
      setLoading(false);
      await checkIfPresaleStarted()

    } catch (err) {
      console.log(err.message)
      return false
    }
  }

  const checkIfPresaleStarted = async () => {
    try {
      const signer = await getProviderOrSigner(true)

      const NFTContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      )

      const _presaleStarted = await NFTContract.presaleStarted()

      if (!_presaleStarted) {
        await getOwner()
      }
      setPresaleStarted(_presaleStarted)
      return _presaleStarted
      
    } catch (err) {
      console.log(err.message)
      return false
    }
  }

  const checkIfPresaleEnded = async () => {
    try {
      const provider = await getProviderOrSigner()
      const NFTContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
      const _presaleEnded = await NFTContract.presaleEndTime()

      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000))
      if (hasEnded) {
        setPresaleEnded(true)
      } else {
        setPresaleEnded(false)
      }
      return hasEnded

    } catch (err) {
      console.log(err.message)
      return false
    }
  }
  
  const getOwner = async () => {
    try {
      const signer = await getProviderOrSigner(true)
      const NFTContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer)
      const _owner = await NFTContract.owner()

      const signerAddress = await signer.getAddress()
      
      if(signerAddress.toLowerCase() == _owner.toLowerCase()){
        setIsOwner(true)
      } else {
        setIsOwner(false)
      }

    } catch (err) {
      console.log(err.message)
      setIsOwner(false)
      return false
    }
  }

  const getTokenIdsMinted = async () => {
    try {

      const provider = await getProviderOrSigner()
      const NFTContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider)
      const _tokenIds = await NFTContract.tokenIds()
      setTokenIdsMinted(_tokenIds.toString())

    } catch (err) {
      console.log(err.message)
      return false
    }
  }

  useEffect(() => {
    if(!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "ropsten",
        providerOptions: {},
        disableInjectedProvider: false,
      })
      connectWallet()

      const _presaleStarted = checkIfPresaleStarted()
      if (_presaleStarted) {
        checkIfPresaleEnded()
      }

      getTokenIdsMinted()
      
      const _presaleEndedInterval = setInterval(async () => {
        const _presaleStarted = await checkIfPresaleStarted()
        if(_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded()
          if(_presaleEnded) {
            clearInterval(_presaleEndedInterval)
          }
        }
      }, 5 * 1000);

      setInterval(async () => {
        await getTokenIdsMinted()
      }, 5 * 1000);

    }
  }, [walletConnected])

  const renderButton = () => {
    if(!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect Wallet
        </button>
      )
    }

    if(loading) {
      return <button className={styles.button}>Loading...</button>
    }

    if(isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      )
    }

    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }

    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a
            JohnnyTime NFT 🥳
          </div>
          <button className={styles.button} onClick={() => mint("presale")}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={() => mint("public")}>
          Public Mint 🚀
        </button>
      );
    }
  }



  return (
    <div>
      <Head>
        <title>JohnnyTime NFTs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to JohnnyTime Community!</h1>
          <div className={styles.description}>
            Its an NFT collection for JohnnyTime Youtube subscribers
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by JohnnyTime
      </footer>
    </div>
  )
}
