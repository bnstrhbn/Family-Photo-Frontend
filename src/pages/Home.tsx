import { useEthers } from '@usedapp/core'
import React from 'react'
import Account from '../components/Account/Account'
import "./Home.css"

export default function Home() {
    const { active } = useEthers();
    return (<div className='home'>
        {!active ? <h1>Error: Connect to Kovan</h1> : <Account />}</div>);


}