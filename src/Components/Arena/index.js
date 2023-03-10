import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import LoadingIndicator from '../LoadingIndicator'
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';

/*
 * We pass in our characterNFT metadata so we can show a cool card in our UI
 */
const Arena = ({ characterNFT, setCharacterNFT }) => {
    // State
    const [currentAccount, setCurrentAccount] = useState(null);
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState('');
    const [showToast, setShowToast] = useState(false);

      // Actions
    const checkIfWalletIsConnected = async () => {
        try {
        const { ethereum } = window;

        if (!ethereum) {
            console.log('Make sure you have MetaMask!');
            return;
        } else {
            console.log('We have the ethereum object', ethereum);

            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length !== 0) {
            const account = accounts[0];
            console.log('Found an authorized account:', account);
            setCurrentAccount(account);
            } else {
            console.log('No authorized account found');
            }
        }
        } catch (error) {
        console.log(error);
        }
    };


    // UseEffects
    useEffect(() => {
        checkIfWalletIsConnected()
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );

            setGameContract(gameContract);
        } else {
            console.log('Ethereum object not found');
        }
    }, []);

    useEffect(() => {

        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            console.log('Boss:', bossTxn);
            setBoss(transformCharacterData(bossTxn));
        };

        const onAttackComplete = (from, newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();
            const sender = from.toString();

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

            /*
            * If player is our own, update both player and boss Hp
            */
            if (currentAccount === sender.toLowerCase()) {

              setBoss((prevState) => {
                  return { ...prevState, hp: bossHp };
              });
              setCharacterNFT((prevState) => {
                  return { ...prevState, hp: playerHp };
              });
            }
            /*
            * If player isn't ours, update boss Hp only
            */
            else {
              setBoss((prevState) => {
                  return { ...prevState, hp: bossHp };
              });
            }
        }

        if (gameContract) {
            /*
             * gameContract is ready to go! Let's fetch our boss
             */
            fetchBoss();
            gameContract.on('AttackComplete', onAttackComplete);

        }

        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
            }
        }
    }, [gameContract]);

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAttackState('attacking');
                console.log('Attacking boss...');
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait();
                console.log('attackTxn:', attackTxn);
                setAttackState('hit');
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                }, 5000);
            }
        } catch (error) {
            console.error('Error attacking boss:', error);
            setAttackState('');
        }
    };

    return (
        <div className="arena-container">
            {boss && characterNFT && (
                <div id="toast" className={showToast ? 'show' : ''}>
                    <div id="desc">{`???? ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
                </div>
            )}

            {/* Boss */}
            {boss && (
                <div className="boss-container">
                    {/* Add attackState to the className! After all, it's just class names */}
                    <div className={`boss-content ${attackState}`}>
                    <h2>???? {boss.name} ????</h2>
                    <div className="image-content">
                        <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                        <div className="health-bar">
                        <progress value={boss.hp} max={boss.maxHp} />
                        <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
                        </div>
                    </div>
                    </div>
                    <div className="attack-container">
                    <button className="cta-button" onClick={runAttackAction}>
                        {`???? Attack ${boss.name}`}
                    </button>
                    </div>
                </div>
            )}

            {characterNFT && (
                <div className="players-container">
                    <div className="player-container">
                        <h2>Your Character</h2>
                        <div className="player">
                            <div className="image-content">
                                <h2>{characterNFT.name}</h2>
                                <img
                                    src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
                                    alt={`Character ${characterNFT.name}`}
                                />
                                <div className="health-bar">
                                    <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                                    <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                                </div>
                            </div>
                            <div className="stats">
                                <h4>{`?????? Attack Damage: ${characterNFT.attackDamage}`}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {attackState === 'attacking' && (
                <div className="loading-indicator">
                <LoadingIndicator />
                <p>Attacking ??????</p>
                </div>
            )}
        </div>
    );
};

export default Arena;