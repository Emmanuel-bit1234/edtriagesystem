import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import UserAPI from "../service/userAPI";

const UserSearch = ({ onUserSelect }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const searchTimeoutRef = useRef(null);
    const userAPI = new UserAPI();

    useEffect(() => {
        // Clear timeout on unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSearch = async (query) => {
        if (!query || query.trim().length < 2) {
            setUsers([]);
            setSearched(false);
            return;
        }

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                setLoading(true);
                setSearched(true);
                const data = await userAPI.searchUsers({ 
                    query: query.trim(),
                    limit: 20 
                });
                setUsers(data.users || []);
            } catch (error) {
                console.error('Error searching users:', error);
                setUsers([]);
                // Log error details for debugging
                if (error.response) {
                    console.error('Response error:', error.response.data);
                }
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        handleSearch(value);
    };

    const roleBodyTemplate = (rowData) => {
        const getRoleSeverity = (role) => {
            switch (role) {
                case 'Admin':
                    return 'danger';
                case 'Doctor':
                    return 'warning';
                case 'Nurse':
                    return 'info';
                case 'User':
                    return 'success';
                default:
                    return null;
            }
        };

        return <Tag value={rowData.role} severity={getRoleSeverity(rowData.role)} />;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <Button
                label="Message"
                icon="pi pi-send"
                className="p-button-sm p-button-outlined"
                onClick={() => onUserSelect(rowData)}
            />
        );
    };

    const avatarBodyTemplate = (rowData) => {
        const label = rowData.name ? rowData.name.charAt(0).toUpperCase() : '?';
        return (
            <Avatar
                label={label}
                shape="circle"
                style={{ backgroundColor: '#2196F3', color: '#ffffff' }}
            />
        );
    };

    return (
        <div>
            <div className="flex align-items-center gap-2 mb-3">
                <span className="p-input-icon-left flex-1">
                    <i className="pi pi-search" />
                    <InputText
                        value={searchQuery}
                        onChange={handleInputChange}
                        placeholder="Search by name or email (minimum 2 characters)"
                        className="w-full"
                    />
                </span>
            </div>

            {loading ? (
                <div>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height="60px" className="mb-2" />
                    ))}
                </div>
            ) : searched && users.length === 0 ? (
                <div className="text-center p-4">
                    <i className="pi pi-search text-4xl text-400 mb-2"></i>
                    <p className="text-600">No users found</p>
                    <p className="text-500 text-sm">Try a different search term</p>
                </div>
            ) : users.length > 0 ? (
                <div className="border-1 surface-border border-round">
                    <DataTable
                        value={users}
                        className="p-datatable-sm"
                        emptyMessage="No users found"
                    >
                        <Column
                            body={avatarBodyTemplate}
                            header=""
                            style={{ width: '4rem' }}
                        />
                        <Column
                            field="name"
                            header="Name"
                            sortable
                        />
                        <Column
                            field="email"
                            header="Email"
                            sortable
                        />
                        <Column
                            field="role"
                            header="Role"
                            body={roleBodyTemplate}
                            sortable
                        />
                        <Column
                            body={actionBodyTemplate}
                            header="Action"
                            exportable={false}
                            style={{ width: '8rem' }}
                        />
                    </DataTable>
                </div>
            ) : (
                <div className="text-center p-4">
                    <i className="pi pi-users text-4xl text-400 mb-2"></i>
                    <p className="text-600">Search for users to message</p>
                    <p className="text-500 text-sm">Enter at least 2 characters to search</p>
                </div>
            )}
        </div>
    );
};

export default UserSearch;

