import React, { useState, useEffect } from "react";
import Button from "../Button/Button";
import { Input } from "@material-ui/core"
import './MakeNewGroup.css'
import image from '../../assets/images/dungeons-and-dragons.jpeg'
import { NFT_ADDRESSES } from "../constants/addresses";
import ABI from '../../abis/parent-nft.abi.json'
import ERC721ABI from '../../abis/ERC721.abi.json'
import { JsonRpcSigner } from '@ethersproject/providers'
import { getExplorerTransactionLink, useEthers } from "@usedapp/core";
import useContract from "../hooks/useContract";
import { ParentNftAbi } from '../../abis/types';
import { ERC721Abi } from '../../abis/types';
import { BigNumber } from '@ethersproject/bignumber';
import { ERC20Interface } from "@usedapp/core";
import AddChildNFTs from "../AddChildNFTs/AddChildNFTs";
import DisplayChildNFTs from "../DisplayChildNFTs/DisplayChildNFTs";


export default function MakeNewGroup() {
    const contract = useContract<ParentNftAbi>('0xf7FEB6D989b74c47E0DeB54aC6eFD1aB3412e8cb', ABI);
    //const [contract, setContract] = useState<ParentNftAbi>();
    const { library, chainId, account } = useEthers();
    const [txHash, setTxHash] = useState<string | undefined>(undefined);
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [nftId, setnftNum] = useState<number>(0) //for use with our statehook!\
    const [childNFTAddress, setchildNFTAddress] = useState<string>("") //for use with our statehook!\
    const [invalidNFT, setinvalidNFT] = useState<boolean>(false) //for use with our statehook!\
    const [numberOfParentNFTs, setNumberOfNFTs] = useState<number>(0);
    const [curtokenID, setcurtokenID] = useState<number>(0) //for use with our statehook!\
    const [parentNFTOwner, setparentNFTOwner] = useState<string>("");


    //<img src="https://<your_domain>/ipfs/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/cat.jpg" />

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nftId = event.target.value === "" ? 0 : Number(event.target.value) //if statement - if the input box is null, ignore otherwise cast it as a number
        if (nftId < 0) {
            setnftNum(0)
            setinvalidNFT(false)
        }
        else if (nftId >= numberOfParentNFTs) {
            //do nothing for now
            console.log("err selection out of bounds")
            setinvalidNFT(true)
        }
        else {
            setnftNum(nftId)
            setinvalidNFT(false)
        }
        //then setamount to new amount

        //console.log(newAmount) //note this DOES change in realtime
    }
    const handleChildNFTAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
        const childNFTAddress = event.target.value === "" ? "Invalid address" : String(event.target.value) //if statement - if the input box is null, ignore otherwise cast it as a number
        setchildNFTAddress(childNFTAddress)
    }
    const handleChildNFTTokenID = (event: React.ChangeEvent<HTMLInputElement>) => {
        const curtokenID = event.target.value === "" ? 0 : Number(event.target.value) //if statement - if the input box is null, ignore otherwise cast it as a number
        setcurtokenID(curtokenID)
    }


    const [nftTokenURI, setnftTokenURI] = useState<string>("");

    useEffect(() => {
        const getNFTURI = async () => {
            setnftTokenURI("")
            if ((!!contract) && !invalidNFT) {
                //checking for undefined or null in addition to just seeing if it exists, similar to no !!s.
                const _nftURI = await contract.tokenURI(nftId);
                setnftTokenURI(_nftURI)
                const _nftOwner = await contract.ownerOf(nftId);
                setparentNFTOwner(_nftOwner)
            }
        }
        getNFTURI();
    }, [contract, nftId])
    useEffect(() => {
        const refreshContract = async () => {
            //const contract = useContract<ParentNftAbi>('0xf7FEB6D989b74c47E0DeB54aC6eFD1aB3412e8cb', ABI);
            if (contract) {
                //setContract(contract);
            }
        }
        refreshContract();
    }, [txHash])

    useEffect(() => {
        const getParentNFTCount = async () => {
            if (!!contract) {
                //checking for undefined or null in addition to just seeing if it exists, similar to no !!s.
                const _numberOfNFTs: BigNumber = await contract.tokenCounter();
                setNumberOfNFTs(_numberOfNFTs.toNumber())
            }
        }
        getParentNFTCount();
    }, [contract])
    const makeNewGroup = async () => {
        //const signer: JsonRpcSigner | undefined = library?.getSigner();
        const signer = library?.getSigner();

        if (signer) {
            const tx = await contract
                ?.connect(signer)
                .makeNewGroup();

            if (chainId && tx) {
                setIsDisabled(true);
                const link = getExplorerTransactionLink(tx?.hash, chainId);
                setTxHash(link);
            }

            await tx?.wait();
            //props.handleUpdate(tx?.hash);

            setIsDisabled(false);
            setTxHash(undefined);
        }
    };
    const finalizeThisOne = async () => {
        //const signer: JsonRpcSigner | undefined = library?.getSigner();
        const signer = library?.getSigner();
        console.log("finalizing " + nftId)
        if (signer) {
            const tx = await contract
                ?.connect(signer)
                .finalizeAndCreateFamilyPhoto(nftId);

            if (chainId && tx) {
                setIsDisabled(true);
                const link = getExplorerTransactionLink(tx?.hash, chainId);
                setTxHash(link);
            }

            await tx?.wait();
            //props.handleUpdate(tx?.hash);

            setIsDisabled(false);
            setTxHash(undefined);
        }
    };
    const addMyNFT = async () => {
        //const signer: JsonRpcSigner | undefined = library?.getSigner();
        const signer = library?.getSigner();

        if (signer) {
            const tx = await contract
                ?.connect(signer)
                .addMyToken(nftId, childNFTAddress, curtokenID);
            //test child token address - need inputs for address and ids. select from wallet...is owner already being checked in SOL. if not owner, UI also just doesn't work
            if (chainId && tx) {
                setIsDisabled(true);
                const link = getExplorerTransactionLink(tx?.hash, chainId);
                setTxHash(link);
            }

            await tx?.wait();
            //props.handleUpdate(tx?.hash);

            setIsDisabled(false);
            setTxHash(undefined);
        }
    };
    return (
        < div >
            <div>
                Number of ParentNFTs: {numberOfParentNFTs}
            </div>
            <label>View Parent Token ID: </label>
            <Input type="number"
                onChange={handleInputChange} />
            <br />
            {!!nftTokenURI ? <div>
                <p>
                    Currently viewing Token URI: {nftTokenURI}
                    <img className={'imageLG'} src={nftTokenURI} alt='nft' />
                </p>
            </div> :
                <div>
                    {!!invalidNFT ? "This guy doesn't exist" : "You can add your guy to this Fam!"}<br /><br /><br />
                    {!invalidNFT ?
                        <div>
                            <br />
                            {(account == parentNFTOwner) ? <Button text='Finalize this one' onClick={finalizeThisOne} isDisabled={isDisabled} /> : <div>Only {parentNFTOwner} can finalize this one</div>}
                            <br />
                            <DisplayChildNFTs tokenId={nftId} />
                            <br />
                            My NFT address: <Input type="string"
                                onChange={handleChildNFTAddress} />
                            <br />
                            My owned token ID: <Input type="number"
                                onChange={handleChildNFTTokenID} />
                            <br /><br />
                            <Button text='Add my NFT' onClick={addMyNFT} isDisabled={isDisabled} />
                            <br />
                            <AddChildNFTs address={childNFTAddress} />
                        </div> :
                        <Button text='Make New Family Foto (Parent NFT)' onClick={makeNewGroup} isDisabled={isDisabled} />
                        //should set NFTID to TokenCounter to add to the new one if a new one is minted
                    }
                </div >
            }
            <div>
                <a href={txHash} target='_blank' rel='noreferrer'>
                    {txHash}
                </a>
            </div>

        </div >

    )
}
