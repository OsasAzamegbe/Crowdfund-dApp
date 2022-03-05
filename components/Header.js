import Link from "next/link";
import React from "react";
import { Icon, Menu } from "semantic-ui-react";


const Header = () => {
 return (
    <Menu style={{marginTop: '10px'}}>
        <Link href="/">
            <Menu.Item
                name='logo'
            >
                WAGMI
                <Icon name="heartbeat" />
            </Menu.Item>
        </Link>

        <Menu.Menu position='right'>
            <Link href="/">
                <Menu.Item
                    name='campaigns'
                >
                    Campaigns
                </Menu.Item>
            </Link>
            <Link href="/campaigns/create">
                <Menu.Item
                    name='newCampaign'
                >
                    <Icon name="add"/>
                </Menu.Item>
            </Link>
            
        </Menu.Menu>
    </Menu>
 )   
}

export default Header;