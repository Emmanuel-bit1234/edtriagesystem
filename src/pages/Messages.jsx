import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { Badge } from "primereact/badge";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { TabView, TabPanel } from "primereact/tabview";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import MessagingAPI from "../service/messagingAPI";
import Chat from "../componets/Chat";
import UserSearch from "../componets/UserSearch";
import GroupManagement from "../componets/GroupManagement";

export const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showChatDialog, setShowChatDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [activeConversationTab, setActiveConversationTab] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const toast = useRef(null);
    const messagingAPI = new MessagingAPI();

    useEffect(() => {
        // Check if current user is admin
        const checkAdmin = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setCurrentUser(userData);
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
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await messagingAPI.getConversations();
            setConversations(data.conversations || []);
        } catch (error) {
            console.error('Error loading conversations:', error);
            if (toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.error || 'Failed to load conversations'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConversationClick = (conversation) => {
        setSelectedConversation(conversation);
        setShowChatDialog(true);
    };

    const handleCloseChat = () => {
        setShowChatDialog(false);
        setSelectedConversation(null);
        loadConversations(); // Refresh conversations to update unread counts
    };

    const handleStartNewConversation = () => {
        setActiveTab(1); // Switch to User Search tab
    };

    // Conversation list item template
    const conversationTemplate = (conversation) => {
        const isDirect = conversation.type === 'direct';
        const displayName = isDirect 
            ? conversation.otherParticipant?.name || 'Unknown User'
            : conversation.name;
        const displayEmail = isDirect 
            ? conversation.otherParticipant?.email || ''
            : null;
        const avatarLabel = displayName ? displayName.charAt(0).toUpperCase() : '?';
        const lastMessage = conversation.lastMessage;
        const unreadCount = conversation.unreadCount || 0;

        return (
            <div
                className="flex align-items-center p-3 border-bottom-1 surface-border cursor-pointer hover:surface-hover transition-colors transition-duration-150"
                onClick={() => handleConversationClick(conversation)}
                style={{ minHeight: '80px' }}
            >
                <div className="relative mr-3" style={{ flexShrink: 0 }}>
                    <Avatar 
                        label={avatarLabel} 
                        shape="circle" 
                        size="large"
                        style={{ 
                            backgroundColor: '#2196F3', 
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'visible'
                        }}
                    />
                    {unreadCount > 0 && (
                        <Badge 
                            value={unreadCount > 9 ? '9+' : unreadCount} 
                            severity="danger"
                            className="absolute"
                            style={{ 
                                top: '-5px', 
                                right: '-5px',
                                minWidth: '20px',
                                height: '20px',
                                fontSize: '0.75rem'
                            }}
                        />
                    )}
                </div>
                <div className="flex-1 min-w-0" style={{ overflow: 'hidden' }}>
                    <div className="flex align-items-center justify-content-between mb-1" style={{ gap: '0.5rem' }}>
                        <div className="font-semibold text-900" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1', minWidth: 0 }}>
                            {displayName}
                        </div>
                        {lastMessage && (
                            <div className="text-xs text-500" style={{ flexShrink: 0 }}>
                                {new Date(lastMessage.createdAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </div>
                        )}
                    </div>
                    {displayEmail && (
                        <div className="text-sm text-500 mb-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {displayEmail}
                        </div>
                    )}
                    {!isDirect && (
                        <div className="mb-1">
                            <Tag 
                                value={conversation.type} 
                                severity="info"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            />
                        </div>
                    )}
                    {lastMessage ? (
                        <div className="text-sm text-600" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {lastMessage.content}
                        </div>
                    ) : (
                        <div className="text-sm text-400 italic">No messages yet</div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <div className="grid">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="col-12">
                                    <Skeleton height="80px" className="mb-2" />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                <ConfirmDialog />

                <Card title="Messages" className="mb-4">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <Button
                            label="Start New Conversation"
                            icon="pi pi-plus"
                            onClick={handleStartNewConversation}
                            className="p-button-outlined"
                        />
                        <Button
                            label="Refresh"
                            icon="pi pi-refresh"
                            onClick={loadConversations}
                            className="p-button-text"
                        />
                    </div>

                    <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                        <TabPanel header="Conversations">
                            {conversations.length === 0 ? (
                                <div className="text-center p-4">
                                    <i className="pi pi-inbox text-6xl text-400 mb-3"></i>
                                    <p className="text-600 text-lg">No conversations yet</p>
                                    <p className="text-500">Start a new conversation to begin messaging</p>
                                </div>
                            ) : (
                                <TabView activeIndex={activeConversationTab} onTabChange={(e) => setActiveConversationTab(e.index)}>
                                    <TabPanel header="Direct Messages">
                                        {conversations.filter(c => c.type === 'direct').length === 0 ? (
                                            <div className="text-center p-4">
                                                <i className="pi pi-user text-4xl text-400 mb-2"></i>
                                                <p className="text-600">No direct messages yet</p>
                                            </div>
                                        ) : (
                                            <div className="border-1 surface-border border-round">
                                                {conversations
                                                    .filter(conversation => conversation.type === 'direct')
                                                    .map((conversation) => (
                                                        <div key={conversation.id}>
                                                            {conversationTemplate(conversation)}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </TabPanel>
                                    <TabPanel header="Groups">
                                        {conversations.filter(c => c.type === 'group').length === 0 ? (
                                            <div className="text-center p-4">
                                                <i className="pi pi-users text-4xl text-400 mb-2"></i>
                                                <p className="text-600">No groups yet</p>
                                            </div>
                                        ) : (
                                            <div className="border-1 surface-border border-round">
                                                {conversations
                                                    .filter(conversation => conversation.type === 'group')
                                                    .map((conversation) => (
                                                        <div key={conversation.id}>
                                                            {conversationTemplate(conversation)}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </TabPanel>
                                </TabView>
                            )}
                        </TabPanel>

                        <TabPanel header="Search Users">
                            <UserSearch
                                onUserSelect={async (user) => {
                                    try {
                                        // Try to get or create conversation from API
                                        const data = await messagingAPI.getOrCreateDirectConversation(user.id);
                                        const newConversation = {
                                            ...data.conversation,
                                            type: 'direct',
                                            otherParticipant: user,
                                            lastMessage: null,
                                            unreadCount: 0
                                        };
                                        setSelectedConversation(newConversation);
                                        setShowChatDialog(true);
                                        setActiveTab(0);
                                        loadConversations();
                                    } catch (error) {
                                        console.error('Error starting conversation:', error);
                                        
                                        // If API call fails, create a temporary conversation structure
                                        // This allows the chat to open even if the backend endpoint isn't ready
                                        // The conversation will be created when the first message is sent
                                        const currentUserId = currentUser?.id || currentUser?.userId;
                                        if (currentUserId) {
                                            const tempConversation = {
                                                id: `temp-${currentUserId}-${user.id}`, // Temporary ID
                                                type: 'direct',
                                                otherParticipant: user,
                                                participants: [
                                                    { id: currentUserId, name: currentUser?.name, email: currentUser?.email },
                                                    { id: user.id, name: user.name, email: user.email }
                                                ],
                                                lastMessage: null,
                                                unreadCount: 0,
                                                createdAt: new Date().toISOString(),
                                                isTemporary: true // Flag to know we need to create it on backend
                                            };
                                            setSelectedConversation(tempConversation);
                                            setShowChatDialog(true);
                                            setActiveTab(0);
                                            
                                            if (toast.current) {
                                                toast.current.show({
                                                    severity: 'info',
                                                    summary: 'Note',
                                                    detail: 'Conversation will be created when you send your first message',
                                                    life: 3000
                                                });
                                            }
                                        } else {
                                            if (toast.current) {
                                                toast.current.show({
                                                    severity: 'error',
                                                    summary: 'Error',
                                                    detail: error.response?.data?.error || 'Failed to start conversation. Please try again.'
                                                });
                                            }
                                        }
                                    }
                                }}
                            />
                        </TabPanel>

                        {isAdmin && (
                            <TabPanel header="Groups">
                                <GroupManagement 
                                    onGroupSelected={(group) => {
                                        const conversation = {
                                            id: group.id,
                                            type: 'group',
                                            name: group.name,
                                            description: group.description,
                                            participantCount: group.participants?.length || 0,
                                            lastMessage: null,
                                            unreadCount: 0
                                        };
                                        handleConversationClick(conversation);
                                    }}
                                />
                            </TabPanel>
                        )}
                    </TabView>
                </Card>

                {/* Chat Dialog */}
                <Dialog
                    visible={showChatDialog}
                    style={{ width: '90vw', maxWidth: '800px' }}
                    contentStyle={{ height: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}
                    header={selectedConversation?.type === 'direct' 
                        ? selectedConversation?.otherParticipant?.name || 'Chat'
                        : selectedConversation?.name || 'Group Chat'}
                    modal
                    onHide={handleCloseChat}
                    maximizable
                    className="p-fluid"
                >
                    {selectedConversation && (
                        <Chat
                            conversation={selectedConversation}
                            currentUser={currentUser}
                            onClose={handleCloseChat}
                            onMessageSent={loadConversations}
                        />
                    )}
                </Dialog>
            </div>
        </div>
    );
};

export default Messages;

