import React, { useState, useEffect, useRef } from "react";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { ScrollPanel } from "primereact/scrollpanel";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import MessagingAPI from "../service/messagingAPI";

const Chat = ({ conversation, currentUser, onClose, onMessageSent }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const messagesEndRef = useRef(null);
    const scrollPanelRef = useRef(null);
    const toast = useRef(null);
    const messagingAPI = new MessagingAPI();
    const isUserScrollingRef = useRef(false);
    const lastMessageCountRef = useRef(0);
    const scrollTimeoutRef = useRef(null);
    const hasScrolledToBottomRef = useRef(false);

    useEffect(() => {
        if (conversation) {
            hasScrolledToBottomRef.current = false; // Reset scroll flag when conversation changes
            loadMessages();
            // Mark conversation as read when opened (skip if temporary)
            const conversationIdStr = String(conversation.id || '');
            if (!conversation.isTemporary && !conversationIdStr.startsWith('temp-')) {
                messagingAPI.markConversationAsRead(conversation.id).catch(console.error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation?.id]);

    // Scroll to bottom when messages are first loaded for a conversation
    useEffect(() => {
        if (!loading && messages.length > 0 && !hasScrolledToBottomRef.current) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                scrollToBottom();
                hasScrolledToBottomRef.current = true;
            }, 200);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, messages.length]);

    // Poll for new messages every 3 seconds
    useEffect(() => {
        if (!conversation) return;
        
        const conversationIdStr = String(conversation.id || '');
        if (conversation.isTemporary || conversationIdStr.startsWith('temp-')) {
            return;
        }

        const pollInterval = setInterval(() => {
            loadMessages(true); // Pass true to skip loading state
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation?.id]);

    useEffect(() => {
        // Only auto-scroll if:
        // 1. New messages were actually added (message count increased)
        // 2. User is not manually scrolling
        // 3. User is already near the bottom
        const currentMessageCount = messages.length;
        const hadNewMessages = currentMessageCount > lastMessageCountRef.current;
        
        if (hadNewMessages && !isUserScrollingRef.current) {
            // Check if user is near bottom before scrolling
            checkAndScrollToBottom();
        }
        
        lastMessageCountRef.current = currentMessageCount;
    }, [messages]);

    const checkAndScrollToBottom = () => {
        if (scrollPanelRef.current) {
            const scrollElement = scrollPanelRef.current?.getElement?.();
            if (scrollElement) {
                const content = scrollElement.querySelector('.p-scrollpanel-content');
                if (content) {
                    const scrollTop = content.scrollTop;
                    const scrollHeight = content.scrollHeight;
                    const clientHeight = content.clientHeight;
                    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
                    
                    // Only scroll if user is within 100px of the bottom
                    if (distanceFromBottom < 100) {
                        scrollToBottom();
                    }
                }
            }
        }
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
        if (scrollPanelRef.current) {
            setTimeout(() => {
                const scrollElement = scrollPanelRef.current?.getElement?.();
                if (scrollElement) {
                    const content = scrollElement.querySelector('.p-scrollpanel-content');
                    if (content) {
                        content.scrollTop = content.scrollHeight;
                    }
                }
            }, 100);
        }
    };

    // Track user scrolling
    useEffect(() => {
        if (!scrollPanelRef.current) return;

        const scrollElement = scrollPanelRef.current?.getElement?.();
        if (!scrollElement) return;

        const content = scrollElement.querySelector('.p-scrollpanel-content');
        if (!content) return;

        const handleScroll = () => {
            isUserScrollingRef.current = true;
            
            // Clear existing timeout
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            
            // Reset scrolling flag after user stops scrolling for 1 second
            scrollTimeoutRef.current = setTimeout(() => {
                isUserScrollingRef.current = false;
            }, 1000);
        };

        content.addEventListener('scroll', handleScroll);

        return () => {
            content.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [conversation?.id]);

    const loadMessages = async (silent = false) => {
        if (!conversation) return;

        // If conversation is temporary, skip loading messages
        const conversationIdStr = String(conversation.id || '');
        if (conversation.isTemporary || conversationIdStr.startsWith('temp-')) {
            setMessages([]);
            setLoading(false);
            lastMessageCountRef.current = 0;
            return;
        }

        try {
            if (!silent) {
                setLoading(true);
            }
            const data = await messagingAPI.getConversationMessages(conversation.id, {
                limit: 50
            });
            const newMessages = data.messages || [];
            
            // Only update if messages actually changed (to avoid unnecessary re-renders)
            setMessages(prevMessages => {
                const prevIds = new Set(prevMessages.map(m => m.id));
                const newIds = new Set(newMessages.map(m => m.id));
                const hasChanges = prevMessages.length !== newMessages.length || 
                                 ![...newIds].every(id => prevIds.has(id));
                
                return hasChanges ? newMessages : prevMessages;
            });
            
            setHasMore(data.hasMore || false);
        } catch (error) {
            console.error('Error loading messages:', error);
            // If conversation doesn't exist yet, just set empty messages
            if (!silent) {
                setMessages([]);
                lastMessageCountRef.current = 0;
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() || sending) {
            return;
        }

        const messageContent = newMessage.trim();
        setNewMessage("");
        setSending(true);

        try {
            let conversationId = conversation.id;
            const conversationIdStr = String(conversation.id || '');
            
            // If conversation is temporary, try to create it first
            if (conversation.isTemporary || conversationIdStr.startsWith('temp-')) {
                try {
                    // Get the other user ID from the temporary conversation
                    const otherParticipant = conversation.otherParticipant;
                    if (otherParticipant && otherParticipant.id) {
                        const createData = await messagingAPI.getOrCreateDirectConversation(otherParticipant.id);
                        conversationId = createData.conversation.id;
                        
                        // Update the conversation object to remove temporary flag
                        conversation.id = conversationId;
                        conversation.isTemporary = false;
                        
                        // Update the conversation ID in the parent component
                        if (onMessageSent) {
                            onMessageSent(); // This will refresh conversations
                        }
                    } else {
                        throw new Error('Other participant ID is missing');
                    }
                } catch (createError) {
                    console.error('Error creating conversation:', createError);
                    // Restore message on error
                    setNewMessage(messageContent);
                    setSending(false);
                    
                    // Show error to user
                    if (toast.current) {
                        toast.current.show({
                            severity: 'error',
                            summary: 'Cannot Send Message',
                            detail: 'The messaging backend is not available yet. Please contact your administrator or try again later.',
                            life: 5000
                        });
                    }
                    return; // Don't try to send message if we can't create conversation
                }
            }

            // Don't try to send if we still have a temporary ID
            const conversationIdStrCheck = String(conversationId || '');
            if (conversationIdStrCheck.startsWith('temp-')) {
                setNewMessage(messageContent);
                setSending(false);
                if (toast.current) {
                    toast.current.show({
                        severity: 'error',
                        summary: 'Cannot Send Message',
                        detail: 'Conversation could not be created. Please try again.',
                        life: 5000
                    });
                }
                return;
            }

            const data = await messagingAPI.sendMessage(
                conversationId,
                messageContent,
                'text'
            );
            
            // Add new message to the list
            setMessages(prev => [...prev, data.message]);
            
            // Mark conversation as read immediately since user just sent a message
            try {
                await messagingAPI.markConversationAsRead(conversationId);
            } catch (error) {
                console.error('Error marking conversation as read:', error);
            }
            
            // Notify parent to refresh conversations
            if (onMessageSent) {
                onMessageSent();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            // Restore message on error
            setNewMessage(messageContent);
            
            // Show error to user
            if (toast.current) {
                const errorMessage = error.response?.status === 404 
                    ? 'The messaging backend endpoint is not available yet. Please contact your administrator.'
                    : error.response?.data?.error || 'Failed to send message. Please try again.';
                
                toast.current.show({
                    severity: 'error',
                    summary: 'Error Sending Message',
                    detail: errorMessage,
                    life: 5000
                });
            }
        } finally {
            setSending(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    };

    const isCurrentUser = (senderId) => {
        return currentUser?.id === senderId || 
               currentUser?.id === parseInt(senderId);
    };

    if (loading) {
        return (
            <div className="flex flex-column" style={{ height: '100%', minHeight: 0 }}>
                <div className="flex-1" style={{ overflow: 'auto', padding: '1rem' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} height="60px" className="mb-2" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-column" style={{ height: '100%', minHeight: 0 }}>
            <Toast ref={toast} />
            {/* Messages Area */}
            <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <ScrollPanel 
                    ref={scrollPanelRef}
                    style={{ 
                        width: '100%', 
                        height: '100%',
                        flex: '1 1 auto',
                        minHeight: 0
                    }}
                    className="border-1 surface-border"
                >
                    <div className="flex flex-column gap-3" style={{ padding: '2.5rem 1rem 1rem 1rem' }}>
                        {messages.length === 0 ? (
                            <div className="text-center p-4">
                                <i className="pi pi-comments text-4xl text-400 mb-2"></i>
                                <p className="text-600">No messages yet</p>
                                <p className="text-500 text-sm">Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const isOwnMessage = isCurrentUser(message.sender?.id || message.senderId);
                                const previousMessage = index > 0 ? messages[index - 1] : null;
                                const previousIsOwnMessage = previousMessage ? isCurrentUser(previousMessage.sender?.id || previousMessage.senderId) : false;
                                const isSameSender = previousMessage && 
                                    (isOwnMessage === previousIsOwnMessage) &&
                                    ((message.sender?.id || message.senderId) === (previousMessage.sender?.id || previousMessage.senderId));
                                
                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${
                                            isOwnMessage ? 'flex-row-reverse' : ''
                                        }`}
                                        style={{ 
                                            alignItems: 'flex-start', 
                                            gap: '0.75rem',
                                            marginTop: isSameSender ? '0.5rem' : '1rem'
                                        }}
                                    >
                                        <div style={{ 
                                            paddingTop: isSameSender ? '0.75rem' : '0.75rem', 
                                            flexShrink: 0,
                                            width: '2.5rem',
                                            display: 'flex',
                                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                                        }}>
                                            {!isSameSender && (
                                                <Avatar
                                                    label={message.sender?.name?.charAt(0).toUpperCase() || '?'}
                                                    shape="circle"
                                                    size="normal"
                                                    style={{ 
                                                        backgroundColor: isOwnMessage ? '#2196F3' : '#6c757d',
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        overflow: 'visible'
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div
                                            className={`flex flex-column ${
                                                isOwnMessage ? 'align-items-end' : 'align-items-start'
                                            }`}
                                            style={{ maxWidth: '70%', minWidth: 0 }}
                                        >
                                            <div
                                                className={`p-3 border-round ${
                                                    isOwnMessage
                                                        ? 'bg-primary text-white'
                                                        : ''
                                                }`}
                                                style={{ 
                                                    wordBreak: 'break-word', 
                                                    overflowWrap: 'break-word',
                                                    backgroundColor: isOwnMessage ? undefined : '#e9ecef',
                                                    color: isOwnMessage ? undefined : '#212529',
                                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                                                }}
                                            >
                                                {!isOwnMessage && (
                                                    <div className="text-xs mb-1 font-semibold">
                                                        {message.sender?.name || 'Unknown User'}
                                                    </div>
                                                )}
                                                <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                                            </div>
                                            <div className="text-xs text-500 px-2" style={{ marginTop: '0.125rem' }}>
                                                {formatMessageTime(message.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollPanel>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex p-2 border-top-1 surface-border" style={{ flexShrink: 0, gap: '0.75rem' }}>
                <InputTextarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={sending}
                    autoFocus
                    rows={2}
                    autoResize
                    style={{ width: '100%', resize: 'none', margin: 0 }}
                />
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.375rem' }}>
                    <Button
                        type="submit"
                        icon="pi pi-send"
                        disabled={!newMessage.trim() || sending}
                        loading={sending}
                        style={{ flexShrink: 0 }}
                        className="p-button-rounded"
                        tooltip="Send"
                        tooltipOptions={{ position: 'top' }}
                    />
                </div>
            </form>
        </div>
    );
};

export default Chat;

