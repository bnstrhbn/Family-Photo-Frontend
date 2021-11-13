import { useState, useEffect } from "react";
import ERC721ABI from '../../abis/ERC721.abi.json'
import { useEthers } from "@usedapp/core";
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from "@ethersproject/contracts"

interface NFTProps {
    address: string;
}
export default function AddChildNFTs(props: NFTProps) {
    const childNFTAddress = props.address;
    const { account } = useEthers();
    const [numberOfNFTs, setNumberOfNFTs] = useState<number>(0);
    const { library } = useEthers();
    const [element, setElement] = useState<JSX.Element[]>();

    var errAddress = false;


    useEffect(() => {
        const getNFTCount = async () => {
            if (!!childNFTAddress) {
                try {
                    const nftContract: Contract = new Contract(childNFTAddress, ERC721ABI, library);
                    if (!!nftContract) {
                        //checking for undefined or null in addition to just seeing if it exists, similar to no !!s.
                        const _numberOfNFTs: BigNumber = await nftContract.tokenCounter();
                        setNumberOfNFTs(Number(_numberOfNFTs));
                    }
                } catch (error) {
                    console.error(error);
                    setNumberOfNFTs(0);
                }
            }
        }
        getNFTCount();
    }, [childNFTAddress])
    const handleImgURIs = async (nftTokenURI: string) => {

        var ipfsHash = nftTokenURI.split("ipfs://")[1];
        var newAddress = "https://ipfs.io/ipfs/" + ipfsHash
        var json = await fetch(newAddress).then(res => res.json())
        if (json.image.startsWith("ipfs://")) {
            var ipfsInsideHash = json.image.split("ipfs://")[1];
            var newInsideAddress = "https://ipfs.io/ipfs/" + ipfsInsideHash
            nftTokenURI = newInsideAddress;
            return nftTokenURI;
        }
        else {
            nftTokenURI = await json.image
            return nftTokenURI;
        }
    };

    useEffect(() => {
        const getChildNFTs = async () => {
            var ownedNFTs = new Array<JSX.Element>();
            if (numberOfNFTs > 0) {
                try {
                    //const nftContract = UseContract<ERC721Abi>(childNFTAddress, ERC721ABI);
                    const nftContract: Contract = new Contract(childNFTAddress, ERC721ABI, library);

                    if (!!nftContract) {
                        //checking for undefined or null in addition to just seeing if it exists, similar to no !!s.
                        for (var index: number = 0; index < numberOfNFTs; index++) {
                            const ownerAcc: String = await nftContract?.ownerOf(index);
                            const nftTokenURI: string = await nftContract["tokenURI(uint256)"](index);
                            if (ownerAcc == account) { //account won't be null at this point?
                                if (nftTokenURI.startsWith("ipfs://")) {
                                    var imgURI = await handleImgURIs(nftTokenURI);
                                    ownedNFTs.push(<div>You own NFT token ID: {index}
                                        <img className={'image'} src={imgURI} alt={imgURI} />
                                    </div>);
                                }
                                else {
                                    ownedNFTs.push(<div>You own NFT token ID: {index}
                                        <img className={'image'} src={nftTokenURI} alt={nftTokenURI} />
                                    </div>);
                                }
                            }
                        }
                        console.log(ownedNFTs)
                        errAddress = false;
                        if (!!ownedNFTs) {
                            setElement(ownedNFTs);
                        }
                    }
                } catch (error) {
                    console.error(error);
                    errAddress = true;
                    setElement(ownedNFTs);
                }
            }
        }
        getChildNFTs();
    }, [numberOfNFTs, childNFTAddress]);
    return <div>{!errAddress ? <div>
        Valid NFTs owned by you for {childNFTAddress} ({numberOfNFTs} total): {element}
    </div >
        : <div> Not valid NFT address
        </div>}
    </div>
}
export function getURI(imgURI: string) {
}