import { ChainId } from "@usedapp/core";

export type AddressMap = { [ChainId: number]: string }
//mapping chainid to contract address

export const NFT_ADDRESSES: AddressMap = {
    [ChainId.Kovan]: `0xf7FEB6D989b74c47E0DeB54aC6eFD1aB3412e8cb` //where my parent NFT contract is deployed
}