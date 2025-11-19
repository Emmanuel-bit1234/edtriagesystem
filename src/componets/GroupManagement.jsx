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

const GroupManagement = ({ onGroupSelected, onGroupCreated }) => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const toast = useRef(null);
    const messagingAPI = new MessagingAPI();
    const userAPI = new UserAPI();

    // Form state
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [usersToAdd, setUsersToAdd] = useState([]);
    const [showAllMembers, setShowAllMembers] = useState(false);

    useEffect(() => {
        // Get current user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setCurrentUser(userData);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (currentUser) {
            loadGroups();
        }
        loadAllUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const data = await messagingAPI.getAllGroups();
            const allGroups = data.groups || [];
            
            // Filter to show groups where user is creator OR member
            if (currentUser) {
                const currentUserId = currentUser.id || currentUser.userId;
                const userGroups = allGroups.filter(group => {
                    // Check if user is the creator
                    const creatorId = group.creatorId || group.createdBy?.id || group.createdBy;
                    const isCreator = creatorId === currentUserId || creatorId === String(currentUserId);
                    
                    // Check if user is a member/participant
                    const participants = group.participants || [];
                    const isMember = participants.some(participant => {
                        const participantId = participant.id || participant;
                        return participantId === currentUserId || participantId === String(currentUserId);
                    });
                    
                    return isCreator || isMember;
                });
                
                // Use groups as-is from API - creator should already be in participants
                // since we now explicitly add them when creating groups
                const groupsWithParticipants = userGroups.map(group => ({
                    ...group,
                    participants: group.participants || []
                }));
                
                setGroups(groupsWithParticipants);
            } else {
                // If no current user, show empty array
                setGroups([]);
            }
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
            const response = await messagingAPI.createGroup(
                groupName.trim(),
                groupDescription.trim() || null,
                selectedUserIds
            );

            // Get the created group ID
            const createdGroup = response.group || response;
            const groupId = createdGroup.id;

            // Ensure creator is added as participant if not already included
            // Check if creator is in the selected users first
            if (currentUser && groupId) {
                const currentUserId = currentUser.id || currentUser.userId;
                if (currentUserId) {
                    const creatorInSelected = selectedUserIds.some(id => 
                        String(id) === String(currentUserId)
                    );
                    
                    // Only add creator if they weren't already selected
                    if (!creatorInSelected) {
                        try {
                            // Try to add creator - if they're already a participant, this should be a no-op
                            await messagingAPI.addUsersToGroup(groupId, [currentUserId]);
                        } catch (addError) {
                            // If error is because user is already a participant, that's fine
                            // Otherwise log the error but continue
                            if (addError.response?.status !== 400 && addError.response?.status !== 409) {
                                console.error('Error adding creator to group:', addError);
                            }
                            // Continue even if this fails - backend might have already added creator
                        }
                    }
                }
            }

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

            // Notify parent to refresh conversations
            if (onGroupCreated) {
                onGroupCreated();
            }
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
            const groupData = data.group;
            
            // Ensure creator is included in participants list
            const creatorId = groupData.creatorId || groupData.createdBy?.id || groupData.createdBy;
            const participants = groupData.participants || [];
            
            // Check if creator is already in participants
            const creatorInParticipants = participants.some(p => {
                const pId = p.id || p;
                return pId === creatorId || pId === String(creatorId);
            });
            
            // If creator is not in participants, add them
            if (creatorId && !creatorInParticipants) {
                // Try to get creator info from userAPI or use placeholder
                try {
                    const creatorData = await userAPI.getUserById(creatorId);
                    groupData.participants = [
                        { id: creatorId, name: creatorData.user?.name || 'Creator', email: creatorData.user?.email || '' },
                        ...participants
                    ];
                } catch (error) {
                    // If we can't fetch creator details, add a placeholder
                    groupData.participants = [
                        { id: creatorId, name: 'Creator', email: '' },
                        ...participants
                    ];
                }
            }
            
            setSelectedGroup(groupData);
            setShowAllMembers(false); // Reset expansion state when viewing a new group
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
            setUsersToAdd([]); // Clear selection after adding
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
        const participants = rowData.participants || [];
        const apiCount = rowData.participantCount;
        const creatorId = rowData.creatorId || rowData.createdBy?.id || rowData.createdBy;
        
        let count = 0;
        
        // Priority 1: Use API participantCount if available (most reliable from backend)
        if (apiCount !== undefined && apiCount !== null) {
            count = apiCount;
        }
        // Priority 2: If we have a participants array with items, use it (deduplicated)
        else if (participants.length > 0) {
            const uniqueParticipantIds = new Set();
            participants.forEach(p => {
                const pId = p?.id || p;
                if (pId) {
                    uniqueParticipantIds.add(String(pId));
                }
            });
            count = uniqueParticipantIds.size;
        }
        // Fallback: if we have a creator, count is at least 1
        else if (creatorId) {
            count = 1;
        }
        
        return (
            <Tag 
                value={count} 
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
                        maxSelectedLabels={2}
                        selectedItemsLabel="{0} +"
                        filter
                        filterPlaceholder="Search by name or email"
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
                        setUsersToAdd([]); // Clear selection when dialog closes
                        setShowAllMembers(false); // Reset expansion state
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
                                <>
                                    <div style={{ 
                                        maxHeight: showAllMembers ? '400px' : 'none',
                                        overflowY: showAllMembers ? 'auto' : 'visible'
                                    }}>
                                        <DataTable
                                            value={showAllMembers || selectedGroup.participants.length <= 5 
                                                ? selectedGroup.participants 
                                                : selectedGroup.participants.slice(0, 5)}
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
                                            <Column 
                                                field="name" 
                                                header="Name"
                                                body={(rowData) => {
                                                    const creatorId = selectedGroup.creatorId || selectedGroup.createdBy?.id || selectedGroup.createdBy;
                                                    const isCreator = rowData.id === creatorId || String(rowData.id) === String(creatorId);
                                                    return (
                                                        <span>
                                                            {rowData.name || 'Unknown'}
                                                            {isCreator && <span className="text-500 ml-2">(Creator)</span>}
                                                        </span>
                                                    );
                                                }}
                                            />
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
                                    </div>
                                    {selectedGroup.participants.length > 5 && (
                                        <div className="mt-2 text-center">
                                            <Button
                                                label={showAllMembers ? "Show Less" : `Show All (${selectedGroup.participants.length})`}
                                                icon={showAllMembers ? "pi pi-chevron-up" : "pi pi-chevron-down"}
                                                className="p-button-text p-button-sm"
                                                onClick={() => setShowAllMembers(!showAllMembers)}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-500">No members</p>
                            )}
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="addUsers">Add More Users</label>
                        <div className="flex align-items-center" style={{ minWidth: 0, width: '100%', gap: '1rem' }}>
                            <div style={{ flex: '1 1 auto', minWidth: 0, maxWidth: 'calc(100% - 4.5rem)' }}>
                                <MultiSelect
                                    id="addUsers"
                                    value={usersToAdd}
                                    options={allUsers.filter(u => 
                                        !selectedGroup.participants?.some(p => p.id === u.value)
                                    )}
                                    onChange={(e) => setUsersToAdd(e.value)}
                                    placeholder="Select users to add"
                                    display="chip"
                                    maxSelectedLabels={2}
                                    selectedItemsLabel="{0} +"
                                    filter
                                    filterPlaceholder="Search by name or email"
                                    loading={loadingUsers}
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <Button
                                icon="pi pi-plus"
                                onClick={() => handleAddUsers(usersToAdd)}
                                disabled={usersToAdd.length === 0}
                                className="p-button-success p-button-rounded"
                                tooltip="Add Users"
                                tooltipOptions={{ position: 'top' }}
                                style={{ flexShrink: 0, width: '2.5rem', height: '2.5rem', minWidth: '2.5rem' }}
                            />
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default GroupManagement;

