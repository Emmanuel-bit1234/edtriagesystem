import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toolbar } from "primereact/toolbar";
import { Skeleton } from "primereact/skeleton";
import UserAPI from "../service/userAPI";

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userDialog, setUserDialog] = useState(false);
    const [roleDialog, setRoleDialog] = useState(false);
    const [user, setUser] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const toast = useRef(null);
    const userAPI = new UserAPI();

    // Available roles
    const roles = [
        { label: 'Admin', value: 'Admin' },
        { label: 'Doctor', value: 'Doctor' },
        { label: 'Nurse', value: 'Nurse' },
        { label: 'User', value: 'User' }
    ];

    useEffect(() => {
        // Check if current user is admin
        const checkAdmin = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setCurrentUser(userData);
                    // Check if user has Admin role
                    const adminCheck = userData.role === 'Admin' || 
                                     userData.name === 'Admin' || 
                                     userData.username === 'Admin' || 
                                     userData.email === 'Admin@edtriage.co.za';
                    setIsAdmin(adminCheck);
                } catch (error) {
                    console.error("Error parsing user data:", error);
                }
            }
        };

        checkAdmin();
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {};
            if (roleFilter) {
                params.role = roleFilter;
            }
            const data = await userAPI.getAllUsers(params);
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error loading users:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.error || 'Failed to load users'
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter users when role filter changes
    useEffect(() => {
        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter]);

    const hideDialog = () => {
        setSubmitted(false);
        setUserDialog(false);
        setUser({});
    };

    const hideRoleDialog = () => {
        setRoleDialog(false);
        setUser({});
    };

    const saveUser = async () => {
        setSubmitted(true);

        if (!user.name || !user.email) {
            return;
        }

        try {
            if (user.id) {
                // Update existing user
                const updateData = {};
                if (user.name) updateData.name = user.name;
                if (user.email) updateData.email = user.email;

                await userAPI.updateUser(user.id, updateData);
                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'User updated successfully'
                });
            } else {
                toast.current.show({
                    severity: 'warn',
                    summary: 'Info',
                    detail: 'Please use the Register page to create new users'
                });
                return;
            }

            hideDialog();
            loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.error || 'Failed to save user'
            });
        }
    };

    const editUser = (user) => {
        // Only allow editing own profile or if admin
        if (!isAdmin && user.id !== currentUser?.id) {
            toast.current.show({
                severity: 'error',
                summary: 'Access Denied',
                detail: 'You can only edit your own profile'
            });
            return;
        }

        setUser({ ...user });
        setUserDialog(true);
    };

    const confirmDeleteUser = (user) => {
        if (!isAdmin) {
            toast.current.show({
                severity: 'error',
                summary: 'Access Denied',
                detail: 'Admin access required to delete users'
            });
            return;
        }

        setUser(user);
        confirmDialog({
            message: `Are you sure you want to delete ${user.name}?`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteUser(user.id),
            reject: () => setUser({})
        });
    };

    const deleteUser = async (id) => {
        try {
            await userAPI.deleteUser(id);
            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'User deleted successfully'
            });
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.error || 'Failed to delete user'
            });
        }
    };

    const confirmRoleChange = (user) => {
        if (!isAdmin) {
            toast.current.show({
                severity: 'error',
                summary: 'Access Denied',
                detail: 'Admin access required to change user roles'
            });
            return;
        }

        setUser({ ...user, newRole: user.role });
        setRoleDialog(true);
    };

    const updateUserRole = async () => {
        if (!user.newRole) {
            toast.current.show({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Please select a role'
            });
            return;
        }

        try {
            await userAPI.updateUserRole(user.id, user.newRole);
            toast.current.show({
                severity: 'success',
                summary: 'Success',
                detail: 'User role updated successfully'
            });
            hideRoleDialog();
            loadUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.response?.data?.error || 'Failed to update user role'
            });
        }
    };

    // Role tag template
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

        return <Tag value={rowData.role} severity={getRoleSeverity(rowData.role)} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }} />;
    };

    // Actions template
    const actionBodyTemplate = (rowData) => {
        const canEdit = isAdmin || rowData.id === currentUser?.id;
        const canDelete = isAdmin;
        const canChangeRole = isAdmin;

        return (
            <div className="flex gap-1">
                {canEdit && (
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-rounded mr-2"
                        onClick={() => editUser(rowData)}
                        tooltip="Edit User"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
                {canChangeRole && (
                    <Button
                        icon="pi pi-key"
                        className="p-button-rounded mr-2"
                        onClick={() => confirmRoleChange(rowData)}
                        tooltip="Change Role"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
                {canDelete && (
                    <Button
                        icon="pi pi-trash"
                        className="p-button-rounded mr-2 p-button-danger"
                        onClick={() => confirmDeleteUser(rowData)}
                        tooltip="Delete User"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
            </div>
        );
    };

    // Date format template
    const dateBodyTemplate = (rowData) => {
        if (!rowData.createdAt) return '-';
        return new Date(rowData.createdAt).toLocaleDateString();
    };

    // Left toolbar
    const leftToolbarTemplate = () => {
        return (
            <div className="flex gap-3">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Search by name or email"
                    />
                </span>
                <Dropdown
                    value={roleFilter}
                    options={[{ label: 'All Roles', value: null }, ...roles]}
                    onChange={(e) => setRoleFilter(e.value)}
                    placeholder="Filter by Role"
                    style={{ width: '200px', marginLeft: '1rem' }}
                />
            </div>
        );
    };

    // Right toolbar
    const rightToolbarTemplate = () => {
        return (
            <Button
                label="Refresh"
                icon="pi pi-refresh"
                className="p-button-outlined"
                onClick={loadUsers}
            />
        );
    };

    // Filter users locally when search changes
    const filteredUsers = users.filter((user) => {
        if (!globalFilter) return true;
        const search = globalFilter.toLowerCase();
        return (
            user.name?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search)
        );
    });

    // User dialog footer
    const userDialogFooter = (
        <React.Fragment>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialog}
            />
            <Button
                label="Save"
                icon="pi pi-check"
                onClick={saveUser}
            />
        </React.Fragment>
    );

    // Role dialog footer
    const roleDialogFooter = (
        <React.Fragment>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideRoleDialog}
            />
            <Button
                label="Update Role"
                icon="pi pi-check"
                onClick={updateUserRole}
            />
        </React.Fragment>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <Card title="User Management" className="mb-4">
                    <Toolbar
                        className="mb-4"
                        left={leftToolbarTemplate}
                        right={rightToolbarTemplate}
                    />

                    {loading ? (
                        <div className="grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="col-12">
                                    <Skeleton height="50px" className="mb-2" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <DataTable
                            value={filteredUsers}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            emptyMessage="No users found"
                            globalFilterFields={['name', 'email']}
                            responsiveLayout="scroll"
                            className="p-datatable-sm"
                        >
                            <Column
                                field="name"
                                header="Name"
                                sortable
                                style={{ minWidth: '12rem' }}
                            />
                            <Column
                                field="email"
                                header="Email"
                                sortable
                                style={{ minWidth: '16rem' }}
                            />
                            <Column
                                field="role"
                                header="Role"
                                body={roleBodyTemplate}
                                sortable
                                style={{ minWidth: '10rem' }}
                            />
                            <Column
                                field="createdAt"
                                header="Created At"
                                body={dateBodyTemplate}
                                sortable
                                style={{ minWidth: '10rem' }}
                            />
                            <Column
                                body={actionBodyTemplate}
                                header="Actions"
                                exportable={false}
                                style={{ minWidth: '10rem' }}
                            />
                        </DataTable>
                    )}
                </Card>

                {/* Edit User Dialog */}
                <Dialog
                    visible={userDialog}
                    style={{ width: '450px' }}
                    header={user.id ? 'Edit User' : 'New User'}
                    modal
                    className="p-fluid"
                    footer={userDialogFooter}
                    onHide={hideDialog}
                >
                    <div className="field">
                        <label htmlFor="name">Name *</label>
                        <InputText
                            id="name"
                            value={user.name || ''}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                            required
                            autoFocus
                            className={submitted && !user.name ? 'p-invalid' : ''}
                        />
                        {submitted && !user.name && (
                            <small className="p-error">Name is required.</small>
                        )}
                    </div>
                    <div className="field">
                        <label htmlFor="email">Email *</label>
                        <InputText
                            id="email"
                            value={user.email || ''}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            required
                            className={submitted && !user.email ? 'p-invalid' : ''}
                        />
                        {submitted && !user.email && (
                            <small className="p-error">Email is required.</small>
                        )}
                    </div>
                    {!user.id && (
                        <div className="field">
                            <small className="p-text-secondary">
                                <i className="pi pi-info-circle mr-1"></i>
                                Please use the Register page to create new users.
                            </small>
                        </div>
                    )}
                </Dialog>

                {/* Change Role Dialog */}
                <Dialog
                    visible={roleDialog}
                    style={{ width: '450px' }}
                    header="Change User Role"
                    modal
                    className="p-fluid"
                    footer={roleDialogFooter}
                    onHide={hideRoleDialog}
                >
                    <div className="field mb-4">
                        <label htmlFor="userName">User</label>
                        <InputText
                            id="userName"
                            value={user.name || ''}
                            disabled
                        />
                    </div>
                    <div className="field mb-4">
                        <label htmlFor="currentRole">Current Role</label>
                        <InputText
                            id="currentRole"
                            value={user.role || ''}
                            disabled
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="newRole">New Role *</label>
                        <Dropdown
                            id="newRole"
                            value={user.newRole}
                            options={roles}
                            onChange={(e) => setUser({ ...user, newRole: e.value })}
                            placeholder="Select a role"
                        />
                    </div>
                    <small className="p-text-secondary mt-3">
                        <i className="pi pi-exclamation-triangle mr-1"></i>
                        Role changes will take effect immediately. Admin roles have full system access.
                    </small>
                </Dialog>
            </div>
        </div>
    );
};

export default UserManagement;

