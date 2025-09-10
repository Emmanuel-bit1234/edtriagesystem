import React from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import PredictionAPI from "../service/predictionAPI";
import Cookies from "js-cookie";

const ProfileDialog = ({ visible, onHide }) => {
    const predictionAPI = new PredictionAPI();
    
    // Get user data from localStorage
    const getUserData = () => {
        try {
            const userData = JSON.parse(localStorage.getItem("user"));
            return userData || {};
        } catch (error) {
            console.error("Error parsing user data from localStorage:", error);
            return {};
        }
    };

    const userData = getUserData();

    // Logout function
    const handleLogout = () => {
        predictionAPI.logout();
        Cookies.set("LoggedIn", false);
        window.location.reload();
    };

    // Format user details for display
    const getUserDetails = () => {
        return [
            {
                col1: "Name",
                col2: userData.name || userData.firstName || "N/A",
                col3: "Email",
                col4: userData.email || userData.emailAddress || "N/A",
            },
            {
                col1: "Nurse ID",
                col2: userData.id || userData.nurseId || "N/A",
                col3: "",
                col4: "",
            },
        ];
    };

    return (
        <Dialog
            draggable={false}
            onHide={onHide}
            visible={visible}
            style={{ width: "50%", height: "auto" }}
            modal
            header={
                <h6>
                    {`User Profile - ${userData.name || userData.firstName || "User"}`}
                </h6>
            }
        >
            <DataTable
                size="small"
                scrollable={true}
                dataKey="col1"
                className="datatable-responsive"
                responsiveLayout="scroll"
                resizableColumns
                columnResizeMode="expand"
                value={getUserDetails()}
            >
                <Column field="col1" body={(e) => <b>{e.col1}</b>}></Column>
                <Column field="col2"></Column>
                <Column field="col3" body={(e) => <b>{e.col3}</b>}></Column>
                <Column field="col4"></Column>
            </DataTable>
            
            <div className="flex justify-content-end mt-3">
                <Button 
                    label="Logout" 
                    icon="pi pi-sign-out" 
                    className="p-button-danger" 
                    onClick={handleLogout}
                />
            </div>
        </Dialog>
    );
};

export default ProfileDialog;
