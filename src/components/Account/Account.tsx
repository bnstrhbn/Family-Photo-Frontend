import Button from '../Button/Button'
import { shortenIfAddress, useEthers } from "@usedapp/core"
import MakeNewGroup from '../MakeNewGroup/MakeNewGroup';

export default function Account() {
    const { activateBrowserWallet, account, library } = useEthers();
    return <div>
        {!account ? (
            <Button text="Connect Wallet" onClick={activateBrowserWallet} />
        ) : (
            <>
                <p>Connected: {shortenIfAddress(account)}</p>
                <MakeNewGroup />
            </>
        )}
    </div>
}