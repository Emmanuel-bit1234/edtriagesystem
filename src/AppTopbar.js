import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";
import Cookies from "js-cookie";
import PredictionAPI from "./service/predictionAPI";
import ProfileDialog from "./componets/ProfileDialog";

export const AppTopbar = (props) => {
    const predictionAPI = new PredictionAPI();
    const [showProfileDialog, setShowProfileDialog] = useState(false);
    
    function Logout() {
        predictionAPI.logout();
        Cookies.set("LoggedIn", false);
        window.location.reload();
    }

    const handleProfileClick = () => {
        setShowProfileDialog(true);
    };

    return (
        <div className="layout-topbar custom-topbar">
            <div className="topbar-left">
                <button 
                    type="button" 
                    className="p-link layout-menu-button layout-topbar-button" 
                    onClick={props.onToggleMenuClick}
                >
                    <i className="pi pi-bars" />
                </button>
            </div>

            <div className="topbar-center">
                <Link to="/" className="layout-topbar-logo">
                    <i className="pi pi-shield mr-2" style={{ fontSize: '1.2rem', color: '#ffffff' }}></i>
                    <span>EMERGENCY DEPARTMENT</span>
                </Link>
            </div>

            <div className="topbar-right">
                <button 
                    type="button" 
                    className="p-link layout-topbar-button" 
                    onClick={handleProfileClick}
                >
                    <i className="pi pi-user" />
                    <span className="lg:inline hidden">Profile</span>
                </button>

                <button 
                    type="button" 
                    className="p-link layout-topbar-button" 
                    onClick={Logout}
                >
                    <i className="pi pi-sign-out" />
                    <span className="lg:inline hidden">Logout</span>
                </button>
            </div>
            
            <ProfileDialog 
                visible={showProfileDialog} 
                onHide={() => setShowProfileDialog(false)} 
            />
        </div>
    );
};
