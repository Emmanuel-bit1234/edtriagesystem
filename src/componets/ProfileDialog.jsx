import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

const ProfileDialog = ({ visible, onHide }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (visible) {
            loadUserProfile();
        }
    }, [visible]);

    const loadUserProfile = () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    return (
        <Dialog
            header="User Profile"
            visible={visible}
            style={{ width: '90vw', maxWidth: '400px' }}
            onHide={onHide}
            modal
            className="p-fluid"
        >
            {user ? (
                <div className="grid">
                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="name">Name</label>
                            <InputText
                                id="name"
                                value={user.name || ''}
                                disabled
                                placeholder="User name"
                            />
                        </div>
                    </div>
                    
                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <InputText
                                id="email"
                                value={user.email || ''}
                                disabled
                                placeholder="User email"
                            />
                        </div>
                    </div>
                    
                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="role">Role</label>
                            <InputText
                                id="role"
                                value={user.role || 'Nurse'}
                                disabled
                                placeholder="User role"
                            />
                        </div>
                    </div>
                    
                    <div className="col-12">
                        <div className="field">
                            <label htmlFor="id">User ID</label>
                            <InputText
                                id="id"
                                value={user.id || ''}
                                disabled
                                placeholder="User ID"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center p-4">
                    <i className="pi pi-user text-4xl text-gray-400 mb-3"></i>
                    <p className="text-gray-500">No profile information available</p>
                </div>
            )}
            
            <div className="flex justify-content-end mt-4">
                <Button
                    label="Close"
                    icon="pi pi-times"
                    onClick={onHide}
                    className="p-button-secondary"
                />
            </div>
        </Dialog>
    );
};

export default ProfileDialog;
