import { Contract } from "@ethersproject/contracts"
import { useEthers } from "@usedapp/core"
import { useMemo } from "react"
import { AddressMap } from "../constants/addresses"

const UseContract = <T extends Contract = Contract>(
    //addressMap: AddressMap,
    address: string,
    ABI: any
): T | null => {    //Making a custom hook that serves as a stand-in implementation of {Contracts} from ethers
    //this is an efficient function to create/instantiate SmartContracts
    //scalable, better than a single line importing Contract
    const { library, chainId } = useEthers();

    return useMemo(() => {
        if (!ABI || !chainId) return null;
        //const address: string = addressMap[chainId];!addressMap || and addressMap below
        if (!address) return null;
        try {
            const contract: Contract = new Contract(address, ABI, library);
            return contract;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, [address, ABI, library, chainId]) as T;
};

export default UseContract;