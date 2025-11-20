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
import UserAPI from "../service/userAPI";
import Chat from "../componets/Chat";
import UserSearch from "../componets/UserSearch";
import GroupManagement from "../componets/GroupManagement";

export const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [showChatDialog, setShowChatDialog] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [activeConversationTab, setActiveConversationTab] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userCache, setUserCache] = useState({}); // Cache for user information
    const fetchingUsersRef = useRef(new Set()); // Track which users are being fetched
    const toast = useRef(null);
    const messagingAPI = new MessagingAPI();
    const userAPI = new UserAPI();

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

    // Poll for new conversations and updates every 5 seconds
    useEffect(() => {
        const pollInterval = setInterval(() => {
            loadConversations(true); // Pass true to skip loading state
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, []);

    const loadConversations = async (silent = false) => {
        try {
            if (!silent) {
                if (conversations.length > 0) {
                    // If conversations already exist, show refreshing state instead of full loading
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }
            }
            const data = await messagingAPI.getConversations();
            const updatedConversations = data.conversations || [];
            setConversations(updatedConversations);
            
            // Pre-fetch user information for all unique sender IDs in group conversations
            const uniqueSenderIds = new Set();
            updatedConversations.forEach(conv => {
                if (conv.type === 'group' && conv.lastMessage?.senderId) {
                    uniqueSenderIds.add(String(conv.lastMessage.senderId));
                }
            });
            
            // Fetch user info for all unique sender IDs that aren't in cache and aren't being fetched
            setUserCache(prevCache => {
                const fetchPromises = Array.from(uniqueSenderIds)
                    .filter(senderId => {
                        const isCurrentUser = senderId === String(currentUser?.id);
                        const inCache = prevCache[senderId];
                        const beingFetched = fetchingUsersRef.current.has(senderId);
                        return !isCurrentUser && !inCache && !beingFetched;
                    })
                    .map(senderId => {
                        fetchingUsersRef.current.add(senderId);
                        return userAPI.getUserById(senderId)
                            .then(response => {
                                // Handle both direct user object and wrapped { user: {...} } response
                                const user = response.user || response;
                                if (user && user.name) {
                                    setUserCache(prev => ({
                                        ...prev,
                                        [senderId]: user
                                    }));
                                }
                                fetchingUsersRef.current.delete(senderId);
                            })
                            .catch(err => {
                                console.error(`Error fetching user ${senderId}:`, err);
                                fetchingUsersRef.current.delete(senderId);
                            });
                    });
                
                // Don't wait for all fetches to complete - let them happen in background
                if (fetchPromises.length > 0) {
                    Promise.all(fetchPromises).catch(console.error);
                }
                
                return prevCache; // Return unchanged cache
            });
            
            return updatedConversations;
        } catch (error) {
            console.error('Error loading conversations:', error);
            if (!silent && toast.current) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.error || 'Failed to load conversations'
                });
            }
            return [];
        } finally {
            if (!silent) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    const handleConversationClick = (conversation) => {
        setSelectedConversation(conversation);
        setShowChatDialog(true);
        // Store currently open conversation ID so App.js can exclude it from unread count
        if (conversation.id) {
            localStorage.setItem('openConversationId', String(conversation.id));
        }
    };

    const handleCloseChat = async () => {
        // Mark conversation as read before closing if it's still open
        if (selectedConversation && selectedConversation.id) {
            const conversationIdStr = String(selectedConversation.id || '');
            if (!selectedConversation.isTemporary && !conversationIdStr.startsWith('temp-')) {
                try {
                    await messagingAPI.markConversationAsRead(selectedConversation.id);
                } catch (error) {
                    console.error('Error marking conversation as read:', error);
                }
            }
        }
        setShowChatDialog(false);
        setSelectedConversation(null);
        // Clear the open conversation ID
        localStorage.removeItem('openConversationId');
        // Refresh conversations to update unread counts after marking as read
        await loadConversations();
    };

    const handleMessageSent = async () => {
        // Refresh conversations to update unread counts
        const updatedConversations = await loadConversations(true); // Silent refresh
        
        // Update selectedConversation with the latest data from conversations list
        if (selectedConversation) {
            const updatedConversation = updatedConversations.find(c => 
                c.id === selectedConversation.id
            );
            if (updatedConversation) {
                setSelectedConversation(updatedConversation);
            }
        }
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
        
        // Get avatar label - handle emojis for group names
        let avatarLabel = '?';
        if (displayName) {
            if (isDirect) {
                // For direct messages, use first letter uppercase
                avatarLabel = displayName.charAt(0).toUpperCase();
            } else {
                // For groups, check if first character is an emoji
                const firstChar = displayName[0];
                // Check if it's an emoji (emoji are typically outside ASCII range or are multi-byte)
                const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(firstChar) || 
                                firstChar.codePointAt(0) > 127;
                if (isEmoji) {
                    // Use the emoji as-is (might need to get more characters for multi-byte emojis)
                    // Get the first emoji character(s) - emojis can be 1-4 code units
                    const emojiMatch = displayName.match(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}][\u{FE00}-\u{FE0F}\u{200D}]*/u);
                    avatarLabel = emojiMatch ? emojiMatch[0] : firstChar;
                } else {
                    // Regular character, use first letter uppercase
                    avatarLabel = firstChar.toUpperCase();
                }
            }
        }
        
        const lastMessage = conversation.lastMessage;
        // Don't show badge if this conversation is currently open
        const isCurrentlyOpen = selectedConversation && selectedConversation.id === conversation.id;
        const unreadCount = isCurrentlyOpen ? 0 : (conversation.unreadCount || 0);

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
                                value={conversation.type ? conversation.type.charAt(0).toUpperCase() + conversation.type.slice(1) : conversation.type} 
                                severity="info"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            />
                        </div>
                    )}
                    {lastMessage ? (
                        <div className="text-sm text-600" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {!isDirect ? (
                                // For groups, show sender name
                                (() => {
                                    const senderId = lastMessage.sender?.id || lastMessage.senderId;
                                    const currentUserId = currentUser?.id;
                                    
                                    const isCurrentUserSender = senderId && currentUserId && (
                                        String(senderId) === String(currentUserId) || 
                                        parseInt(senderId) === parseInt(currentUserId) ||
                                        senderId === currentUserId
                                    );
                                    
                                    let senderName = 'Unknown';
                                    
                                    // First check if it's the current user
                                    if (isCurrentUserSender) {
                                        senderName = currentUser?.name || 'You';
                                    } 
                                    // Check lastMessage.sender.name
                                    else if (lastMessage.sender?.name) {
                                        senderName = lastMessage.sender.name;
                                    } 
                                    // Check lastMessage.senderName
                                    else if (lastMessage.senderName) {
                                        senderName = lastMessage.senderName;
                                    } 
                                    // Check if sender is a string
                                    else if (typeof lastMessage.sender === 'string') {
                                        senderName = lastMessage.sender;
                                    }
                                    // If still unknown and we have senderId, try to find in participants
                                    else if (senderId && conversation.participants) {
                                        const participant = conversation.participants.find(p => {
                                            const pId = p?.id || p?.userId || p;
                                            return String(pId) === String(senderId) || 
                                                   parseInt(pId) === parseInt(senderId) ||
                                                   pId === senderId;
                                        });
                                        if (participant) {
                                            senderName = participant.name || participant.userName || participant.user?.name || 'Unknown';
                                        }
                                    }
                                    // If still unknown and we have senderId, check cache
                                    else if (senderId) {
                                        const cacheKey = String(senderId);
                                        if (userCache[cacheKey]) {
                                            senderName = userCache[cacheKey].name || 'Unknown';
                                        }
                                        // User will be fetched in loadConversations, so it will appear on next render
                                    }
                                    
                                    // If still unknown, try to get from lastMessage.createdBy
                                    if (senderName === 'Unknown') {
                                        if (lastMessage.createdBy?.name) {
                                            senderName = lastMessage.createdBy.name;
                                        } else if (lastMessage.createdBy) {
                                            senderName = typeof lastMessage.createdBy === 'string' 
                                                ? lastMessage.createdBy 
                                                : (lastMessage.createdBy.name || 'Unknown');
                                        }
                                    }
                                    
                                    return `${senderName}: ${lastMessage.content}`;
                                })()
                            ) : (
                                // For direct messages, just show content
                                lastMessage.content
                            )}
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
                                    if (!user || !user.id) {
                                        if (toast.current) {
                                            toast.current.show({
                                                severity: 'error',
                                                summary: 'Error',
                                                detail: 'Invalid user selected. Please try again.'
                                            });
                                        }
                                        return;
                                    }

                                    const currentUserId = currentUser?.id || currentUser?.userId;
                                    if (!currentUserId) {
                                        if (toast.current) {
                                            toast.current.show({
                                                severity: 'error',
                                                summary: 'Error',
                                                detail: 'Unable to identify current user. Please refresh the page.'
                                            });
                                        }
                                        return;
                                    }

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
                                    }
                                }}
                            />
                        </TabPanel>

                        {isAdmin && (
                            <TabPanel header="My Groups">
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
                                    onGroupCreated={() => {
                                        // Refresh conversations when a group is created
                                        loadConversations();
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
                            onMessageSent={handleMessageSent}
                        />
                    )}
                </Dialog>
            </div>
        </div>
    );
};

export default Messages;

