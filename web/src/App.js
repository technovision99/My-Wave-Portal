import React, { useEffect, useState } from "react";
import {Helmet} from 'react-helmet';
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

const App = () => {
  const contractAddress = "0x52b473927B9Fe9B6c5401a35149c61ACd3410Fc9";
  const contractABI = abi.abi;
  const [currentAccount,setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [msg, setMsg] = useState("");

   const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    try{
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    
    const accounts = await ethereum.request({method: 'eth_accounts'});

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      getAllWaves();
      } else {
      console.log("No authorized account found")

    } 
    }catch(error) {
      console.log(error);
    }
  
  

  }
  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }
      const accounts = await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      } catch (error) {
        console.log(error)
      }
    }
    const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(msg, {gasLimit: 300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        let waveNumber = await wavePortalContract.getSenderWaves();
        console.log("Wave number from account: ", currentAccount, "is" , waveNumber.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }
  

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    
    <div className="mainContainer">
      <Helmet>
                <style>{'body { background-color: RoyalBlue; }'}</style>
            </Helmet>
      <div className="dataContainer">
        <div className="header">
        👋 Hi!
        </div>

        <div className="bio">
          <p style={{color: "black"}}>I am an aspiring full stack web3 developer and Defi enthusiast. Wave if you want :)</p>
          
        </div>
        {
          currentAccount ? (<textarea name="msgArea"
            placeholder="type your message:"
            type="text"
            id="msg"
            value={msg}
            onChange={e => setMsg(e.target.value)} />) : null
        }
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "RoyalBlue", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App