import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { MultiSelect } from "primereact/multiselect";
import MessagingAPI from "../service/messagingAPI";
import UserAPI from "../service/userAPI";

const GroupManagement = ({ onGroupSelected }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const toast = useRef(null);
    const messagingAPI = new MessagingAPI();
    const userAPI = new UserAPI();

    // Form state
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        loadGroups();
        loadAllUsers();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const data = await messagingAPI.getAllGroups();
            setGroups(data.groups || []);
        } catch (error) {
            console.error('Error loading groups:', error);
            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.error || 'Failed to load groups'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadAllUsers = async () => {
        try {
            setLoadingUsers(true);
            const data = await userAPI.getAllUsers({ limit: 100 });
            const userOptions = (data.users || []).map(user => ({
                label: `${user.name} (${user.email})`,
                value: user.id
            }));
            setAllUsers(userOptions);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleCreateGroup = async () => {
        setSubmitted(true);

        if (!groupName.trim() || selectedUserIds.length === 0) {
            return;
        }

        try {
            await messagingAPI.createGroup(
                groupName.trim(),
                groupDescription.trim() || null,
                selectedUserIds
            );

            if (toast.current) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Group created successfully'
                });
            }

            // Reset form
            setGroupName("");
            setGroupDescription("");
            setSelectedUserIds([]);
            setSubmitted(false);
            setShowCreateDialog(false);

            // Reload groups
            loadGroups();
        } catch (error) {
            console.error('Error creating group:', error);
            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.error || 'Failed to create group'
                });
            }
        }
    };

    const handleViewGroupDetails = async (group) => {
        try {
            const data = await messagingAPI.getGroupDetails(group.id);
            setSelectedGroup(data.group);
            setShowDetailsDialog(true);
        } catch (error) {
            console.error('Error loading group details:', error);
            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.error || 'Failed to load group details'
                });
            }
        }
    };

    const handleDeleteGroup = (group) => {
        confirmDialog({
            message: `Are you sure you want to delete the group "${group.name}"? This will delete all messages in this group.`,
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await messagingAPI.deleteGroup(group.id);
                    if (toast.current) {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Group deleted successfully'
                        });
                    }
                    loadGroups();
                } catch (error) {
                    console.error('Error deleting group:', error);
                    if (toast.current) {
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.response?.data?.error || 'Failed to delete group'
                        });
                    }
                }
            }
        });
    };

    const handleAddUsers = async (userIds) => {
        if (!selectedGroup || userIds.length === 0) return;

        try {
            await messagingAPI.addUsersToGroup(selectedGroup.id, userIds);
            if (toast.current) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Users added to group successfully'
                });
            }
            handleViewGroupDetails({ id: selectedGroup.id });
            loadGroups();
        } catch (error) {
            console.error('Error adding users:', error);
            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.error || 'Failed to add users'
                });
            }
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!selectedGroup) return;

        confirmDialog({
            message: 'Are you sure you want to remove this user from the group?',
            header: 'Confirm Removal',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    await messagingAPI.removeUserFromGroup(selectedGroup.id, userId);
                    if (toast.current) {
                        toast.current.show({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'User removed from group successfully'
                        });
                    }
                    handleViewGroupDetails({ id: selectedGroup.id });
                    loadGroups();
                } catch (error) {
                    console.error('Error removing user:', error);
                    if (toast.current) {
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.response?.data?.error || 'Failed to remove user'
                        });
                    }
                }
            }
        });
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded mr-2"
                    onClick={() => handleViewGroupDetails(rowData)}
                    tooltip="View Details"
                />
                <Button
                    icon="pi pi-comments"
                    className="p-button-rounded mr-2 p-button-info"
                    onClick={() => onGroupSelected(rowData)}
                    tooltip="Open Chat"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded mr-2 p-button-danger"
                    onClick={() => handleDeleteGroup(rowData)}
                    tooltip="Delete Group"
                />
            </div>
        );
    };

    const participantCountTemplate = (rowData) => {
        return (
            <Tag 
                value={rowData.participantCount || 0} 
                severity="info"
            />
        );
    };

    // Create Group Dialog Footer
    const createDialogFooter = (
        <React.Fragment>
            <Button
                label="Cancel"
                icon="pi pi-times"
                className="p-button-text"
                onClick={() => {
                    setShowCreateDialog(false);
                    setGroupName("");
                    setGroupDescription("");
                    setSelectedUserIds([]);
                    setSubmitted(false);
                }}
            />
            <Button
                label="Create"
                icon="pi pi-check"
                onClick={handleCreateGroup}
            />
        </React.Fragment>
    );

    return (
        <div>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex justify-content-between align-items-center mb-3">
                <Button
                    label="Create Group"
                    icon="pi pi-plus"
                    onClick={() => setShowCreateDialog(true)}
                    className="p-button-success"
                />
                <Button
                    label="Refresh"
                    icon="pi pi-refresh"
                    onClick={loadGroups}
                    className="p-button-text"
                />
            </div>

            {loading ? (
                <div>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height="60px" className="mb-2" />
                    ))}
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center p-4">
                    <i className="pi pi-users text-4xl text-400 mb-2"></i>
                    <p className="text-600">No groups yet</p>
                    <p className="text-500 text-sm">Create a group to start group messaging</p>
                </div>
            ) : (
                <div className="border-1 surface-border border-round">
                    <DataTable
                        value={groups}
                        className="p-datatable-sm"
                        emptyMessage="No groups found"
                    >
                        <Column
                            field="name"
                            header="Group Name"
                            sortable
                            style={{ minWidth: '200px' }}
                        />
                        <Column
                            field="description"
                            header="Description"
                            style={{ minWidth: '250px' }}
                        />
                        <Column
                            field="participantCount"
                            header="Members"
                            body={participantCountTemplate}
                            sortable
                            style={{ minWidth: '100px' }}
                        />
                        <Column
                            field="createdAt"
                            header="Created"
                            body={(rowData) => new Date(rowData.createdAt).toLocaleDateString()}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column
                            body={actionBodyTemplate}
                            header="Actions"
                            exportable={false}
                            style={{ minWidth: '150px' }}
                        />
                    </DataTable>
                </div>
            )}

            {/* Create Group Dialog */}
            <Dialog
                visible={showCreateDialog}
                style={{ width: '500px' }}
                header="Create Group"
                modal
                className="p-fluid"
                footer={createDialogFooter}
                onHide={() => {
                    setShowCreateDialog(false);
                    setGroupName("");
                    setGroupDescription("");
                    setSelectedUserIds([]);
                    setSubmitted(false);
                }}
            >
                <div className="field">
                    <label htmlFor="groupName">Group Name *</label>
                    <InputText
                        id="groupName"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                        className={submitted && !groupName ? 'p-invalid' : ''}
                    />
                    {submitted && !groupName && (
                        <small className="p-error">Group name is required.</small>
                    )}
                </div>
                <div className="field">
                    <label htmlFor="groupDescription">Description</label>
                    <InputTextarea
                        id="groupDescription"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        rows={3}
                    />
                </div>
                <div className="field">
                    <label htmlFor="users">Add Users *</label>
                    <MultiSelect
                        id="users"
                        value={selectedUserIds}
                        options={allUsers}
                        onChange={(e) => setSelectedUserIds(e.value)}
                        placeholder="Select users"
                        display="chip"
                        loading={loadingUsers}
                        className={submitted && selectedUserIds.length === 0 ? 'p-invalid' : ''}
                    />
                    {submitted && selectedUserIds.length === 0 && (
                        <small className="p-error">At least one user is required.</small>
                    )}
                </div>
            </Dialog>

            {/* Group Details Dialog */}
            {selectedGroup && (
                <Dialog
                    visible={showDetailsDialog}
                    style={{ width: '600px' }}
                    header={`Group: ${selectedGroup.name}`}
                    modal
                    onHide={() => {
                        setShowDetailsDialog(false);
                        setSelectedGroup(null);
                    }}
                    maximizable
                >
                    {selectedGroup.description && (
                        <div className="mb-3">
                            <strong>Description:</strong>
                            <p className="mt-1">{selectedGroup.description}</p>
                        </div>
                    )}

                    <div className="mb-3">
                        <strong>Members ({selectedGroup.participants?.length || 0}):</strong>
                        <div className="mt-2">
                            {selectedGroup.participants && selectedGroup.participants.length > 0 ? (
                                <DataTable
                                    value={selectedGroup.participants}
                                    className="p-datatable-sm"
                                >
                                    <Column
                                        body={(rowData) => (
                                            <Avatar
                                                label={rowData.name?.charAt(0).toUpperCase() || '?'}
                                                shape="circle"
                                                style={{ backgroundColor: '#2196F3', color: '#ffffff' }}
                                            />
                                        )}
                                        header=""
                                        style={{ width: '3rem' }}
                                    />
                                    <Column field="name" header="Name" />
                                    <Column field="email" header="Email" />
                                    <Column
                                        body={(rowData) => (
                                            <Button
                                                icon="pi pi-times"
                                                className="p-button-rounded p-button-text p-button-danger p-button-sm"
                                                onClick={() => handleRemoveUser(rowData.id)}
                                                tooltip="Remove User"
                                            />
                                        )}
                                        header="Action"
                                        style={{ width: '5rem' }}
                                    />
                                </DataTable>
                            ) : (
                                <p className="text-500">No members</p>
                            )}
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="addUsers">Add More Users</label>
                        <MultiSelect
                            id="addUsers"
                            options={allUsers.filter(u => 
                                !selectedGroup.participants?.some(p => p.id === u.value)
                            )}
                            onChange={(e) => handleAddUsers(e.value)}
                            placeholder="Select users to add"
                            display="chip"
                            loading={loadingUsers}
                        />
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default GroupManagement;

