import { useState, useEffect } from "react";
import ERC721ABI from '../../abis/ERC721.abi.json'
import { useEthers } from "@usedapp/core";
import UseContract from "../hooks/useContract";
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from "@ethersproject/contracts"
import { ParentNftAbi } from '../../abis/types';
import ABI from '../../abis/parent-nft.abi.json'

interface NFTProps {
    tokenId: number;
}
export type ownerTuple = [string, string, BigNumber]
export default function DisplayChildNFTs(props: NFTProps) {
    const tokenId = props.tokenId;
    const { account } = useEthers();
    const [numberOfChildNFTs, setNumberOfChildNFTs] = useState<number>(0);
    const { library, chainId } = useEthers();
    const [element, setElement] = useState<JSX.Element[]>();
    const contract = UseContract<ParentNftAbi>('0xf7FEB6D989b74c47E0DeB54aC6eFD1aB3412e8cb', ABI);
    var errAddress = false;
    const parentAddedNFTs = new Array<JSX.Element>();



    useEffect(() => {
        const getChildNFTCount = async () => {
            if (!!tokenId) {
                try {
                    if (!!contract) {
                        //checking for undefined or null in addition to just seeing if it exists, similar to no !!s.
                        const _numberOfNFTs: BigNumber = await contract.childTokenCount(tokenId);
                        setNumberOfChildNFTs(Number(_numberOfNFTs));
                    }
                } catch (error) {
                    console.error(error);
                    setNumberOfChildNFTs(0);
                }
            }
        }
        getChildNFTCount();
    }, [tokenId])

    useEffect(() => {
        const getChildNFTs = async () => {
            if (numberOfChildNFTs > 0) {
                try {
                    if (!!contract) {
                        for (var index: number = 0; index < numberOfChildNFTs; index++) {
                            const tokenMap: ownerTuple = await contract.tokenMapping(tokenId, index);
                            const owner: string = await tokenMap[0];
                            const childNFTAddress: string = await tokenMap[1];
                            const childTokenID: number = await Number(tokenMap[2]);
                            const childContract: Contract = new Contract(childNFTAddress, ERC721ABI, library);
                            const childTokenURI: string = await childContract["tokenURI(uint256)"](childTokenID);

                            if (childTokenURI.startsWith("ipfs://")) {
                                var ipfsHash = childTokenURI.split("ipfs://")[1];
                                var newAddress = "https://ipfs.io/ipfs/" + ipfsHash
                                var json = await fetch(newAddress).then(res => res.json());
                                if (json.image.startsWith("ipfs://")) {
                                    var ipfsInsideHash = await json.image.split("ipfs://")[1];
                                    var newInsideAddress = await "https://ipfs.io/ipfs/" + ipfsInsideHash
                                    parentAddedNFTs.push(<div>NFT token ID: {childTokenID} from address: {childNFTAddress} by owner: {owner}
                                        <img className={'image'} src={newInsideAddress} alt={newInsideAddress} />
                                    </div>);
                                }
                                else {
                                    var imgURI = await json.image;
                                    parentAddedNFTs.push(<div>NFT token ID: {childTokenID} from address: {childNFTAddress} by owner: {owner}
                                        <img className={'image'} src={imgURI} alt={imgURI} />
                                    </div>);
                                }
                            }
                            else {
                                parentAddedNFTs.push(<div>NFT token ID: {childTokenID} from address: {childNFTAddress} by owner: {owner}
                                    <img className={'image'} src={childTokenURI} alt={childTokenURI} />
                                </div>);
                            }
                        }
                    }
                    errAddress = false;
                    setElement(parentAddedNFTs);
                } catch (error) {
                    errAddress = true;
                    setElement(parentAddedNFTs);
                }
            }
        }
        getChildNFTs();
    }, [numberOfChildNFTs, tokenId]);
    return <div>{!errAddress ? <div>
        Tokens in this NFT already are ({numberOfChildNFTs} total): {element}
    </div >
        : <div> Not valid NFT address
        </div>}
    </div>
}
