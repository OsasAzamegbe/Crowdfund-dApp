import React from "react";
import Header from "./Header";


const Layout = (props) => {
    return (
        <div>
            <link
                async
                rel="stylesheet"
                href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css"
            />
            <Header/>
            {props.children}
        </div>
    )
}

export default Layout;