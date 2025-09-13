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
        <div className="layout-topbar" style={{ display: 'flex', alignItems: 'center' }}>
            <button 
                type="button" 
                className="p-link layout-menu-button layout-topbar-button" 
                onClick={props.onToggleMenuClick}
                style={{ order: 1, marginRight: '1rem' }}
            >
                <i className="pi pi-bars" />
            </button>

            <Link 
                to="/" 
                className="layout-topbar-logo"
                style={{ order: 2, flex: 1, textAlign: 'center', margin: '0 1rem' }}
            >
                <i className="pi pi-shield mr-2" style={{ fontSize: '1.2rem', color: '#ffffff' }}></i>
                <span>EMERGENCY DEPARTMENT</span>
            </Link>

            {/* Profile Button */}
            <button 
                type="button" 
                className="p-link layout-topbar-button" 
                onClick={handleProfileClick}
                style={{ order: 3, marginLeft: '0.5rem' }}
            >
                <i className="pi pi-user" />
                <span className="lg:inline hidden">Profile</span>
            </button>

            {/* Logout Button */}
            <button 
                type="button" 
                className="p-link layout-topbar-button" 
                onClick={Logout}
                style={{ order: 3, marginLeft: '0.5rem' }}
            >
                <i className="pi pi-sign-out" />
                <span className="lg:inline hidden">Logout</span>
            </button>
            
            <ProfileDialog 
                visible={showProfileDialog} 
                onHide={() => setShowProfileDialog(false)} 
            />
        </div>
    );
};
