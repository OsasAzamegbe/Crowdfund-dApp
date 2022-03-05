import React from "react";
import { Icon, Menu } from "semantic-ui-react";


const Header = () => {
 return (
    <Menu>
        <Menu.Item
            name='logo'
        >
        WAGMI
        </Menu.Item>

        <Menu.Menu position='right'>
            <Menu.Item
                name='campaigns'
            >
                Campaigns
            </Menu.Item>

            <Menu.Item
                name='newCampaign'
            >
                <Icon name="add"/>
            </Menu.Item>
        </Menu.Menu>
    </Menu>
 )   
}

export default Header;