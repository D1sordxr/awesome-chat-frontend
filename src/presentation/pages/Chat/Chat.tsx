import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/chat/Sidebar/Sidebar';
import MessageList from '../../components/chat/MessageList/MessageList';
import ChatInput from '../../components/chat/ChatInput/ChatInput';
import styles from './Chat.module.css';
import {useChatContext} from "../../../application/chat/UseContext.ts";
import type { ChatPreview, Message } from "../../../domain/core/entities/ChatPreview.ts";
import {useWebSocketContext} from "../../../application/ws/UseContext.ts";
import type {WSMessage, WsMessageData} from "../../../domain/core/entities/WSClient.ts";

interface ChatProps {
    user_id: string;
}

const Chat: React.FC<ChatProps> = ({ user_id }) => {
    const chatContext = useChatContext();
    const wsContext = useWebSocketContext();

    const [currentChat, setCurrentChat] = useState<ChatPreview | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [loading, setLoading] = useState({
        chats: true,
        messages: false
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadChats = async () => {
            try {
                setLoading(prev => ({ ...prev, chats: true }));
                setError(null);

                const response = await chatContext.chatUseCase.getUserChatPreview(user_id);
                let previews = response.chat_previews

                    if (response.chat_previews.length > 1) {
                    previews = response.chat_previews.sort((a, b) => {
                        const getSafeTime = (msg: Message) => {
                            if (!msg?.timestamp) return 0;
                            const date = new Date(msg.timestamp);
                            return isNaN(date.getTime()) ? 0 : date.getTime();
                        };

                        const timeA = getSafeTime(a.last_message as Message);
                        const timeB = getSafeTime(b.last_message as Message);

                        return timeB - timeA;
                    });
                }

                setChats(previews);

                if (response.chat_previews.length > 0 && !currentChat) {
                    setCurrentChat(response.chat_previews[0]);
                }
            } catch (err) {
                console.error('Failed to load chats:', err);
                setError('Не удалось загрузить список чатов');
            } finally {
                setLoading(prev => ({ ...prev, chats: false }));
            }
        };

        loadChats();
    }, [user_id, chatContext, currentChat]);

    useEffect(() => {
        if (!currentChat) return;

        const loadMessages = async () => {
            try {
                setLoading(prev => ({ ...prev, messages: true }));
                setError(null);

                const messages: Message[] = await chatContext.chatUseCase.getChatAllMessages(currentChat.chat_id);
                const processedMessages: Message[] = messages.map(message => ({
                    ...message,
                    isMe: message.user_id === user_id
                })).reverse();

                setMessages(processedMessages);
            } catch (err) {
                console.error('Failed to load messages:', err);
                setError('Не удалось загрузить сообщения');
            } finally {
                setLoading(prev => ({ ...prev, messages: false }));
            }
        };

        loadMessages();
    }, [currentChat, user_id, chatContext]);

    useEffect(() => {
        if (!user_id || !currentChat) return;

        wsContext.client.connect(user_id);

        const handleNewMessage = (msg: WSMessage) => {
            console.log('New WS message:', msg);

            try {
                const messageData = msg as unknown as WsMessageData;

                if (messageData.chat_id !== currentChat?.chat_id) {
                    console.log('Message for another chat, ignoring');
                    setChats(prevChats => {
                        const updatedChats = prevChats.map(chat =>
                            chat.chat_id === messageData.chat_id
                                ? {
                                    ...chat,
                                    last_message: {
                                        content: messageData.content,
                                        user_id: messageData.user_id,
                                        timestamp: new Date().toISOString(),
                                    },
                                }
                                : chat
                        );

                        const sortedChats = [...updatedChats].sort((a, b) => {
                            const getTime = (chat: ChatPreview) =>
                                chat.last_message?.timestamp
                                    ? new Date(chat.last_message.timestamp).getTime()
                                    : 0;
                            return getTime(b) - getTime(a);
                        });

                        if (sortedChats[0]?.chat_id !== currentChat?.chat_id) {
                            setCurrentChat(sortedChats[0]);
                        }

                        return sortedChats;
                    });
                    return;
                }

                const newMessage: Message = {
                    user_id: messageData.user_id,
                    content: messageData.content,
                    timestamp: new Date().toISOString(),
                    isMe: user_id === messageData.user_id,
                };

                if (user_id === newMessage.user_id) {
                    console.log('Skipping message', newMessage);
                } else {
                    console.log('Adding new message', newMessage);
                    setMessages(prev => [...prev, newMessage]);
                }

                setChats(prevChats => {
                    const updatedChats = prevChats.map(chat =>
                        chat.chat_id === currentChat.chat_id
                            ? {
                                ...chat,
                                last_message: {
                                    content: messageData.content,
                                    user_id: messageData.user_id,
                                    timestamp: new Date().toISOString(),
                                },
                            }
                            : chat
                    );

                    const sortedChats = [...updatedChats].sort((a, b) => {
                        const getTime = (chat: ChatPreview) =>
                            chat.last_message?.timestamp
                                ? new Date(chat.last_message.timestamp).getTime()
                                : 0;
                        return getTime(b) - getTime(a);
                    });

                    // if (sortedChats[0]?.chat_id !== currentChat.chat_id) {
                    //     setCurrentChat(sortedChats[0]);
                    // }

                    return sortedChats;
                });
            } catch (err) {
                console.error('Error processing WS message:', err);
            }
        };

        wsContext.client.onMessage(handleNewMessage);

        wsContext.client.connect(user_id).catch((err) => {
            console.error("WebSocket connection error:", err);
        });

        return () => {
            wsContext.client.disconnect();
        };
    }, [user_id, currentChat, wsContext.client]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !currentChat) return;

        try {
            const newMessage: Message = {
                content: text,
                user_id: user_id,
                timestamp: new Date().toISOString(),
                isMe: true
            };

            setMessages(prev => [...prev, newMessage]);

            setChats(prev => prev.map(chat =>
                chat.chat_id === currentChat.chat_id
                    ? {
                        ...chat,
                        last_message: {
                            content: text,
                            user_id: user_id,
                            timestamp: new Date().toISOString()
                        }
                    }
                    : chat
            ));

            await chatContext.chatUseCase.sendSync(newMessage, currentChat.chat_id);
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessages(prev => prev.slice(0, -1));
            setError('Не удалось отправить сообщение');
        }
    };

    return (
        <div className={styles.app}>
            <Sidebar
                chats={chats}
                setChats={setChats}
                currentChat={currentChat}
                onSelectChat={setCurrentChat}
                user_id={user_id}
                // isLoading={loading.chats}
            />

            <div className={styles.chatContainer}>
                {loading.chats && chats.length === 0 ? (
                    <div className={styles.loadingRight}>
                        <p>Загрузка чатов...</p>
                    </div>
                ) : error && chats.length === 0 ? (
                    <div className={styles.errorRight}>
                        {error}
                    </div>
                ) : currentChat ? (
                    <>
                        <div className={styles.chatHeader}>
                            <p className={styles.chatName}>{currentChat.name}</p>
                            <p className={styles.participantsInfo}>{currentChat.participants.length} members</p>
                        </div>

                        {loading.messages ? (
                            <div className={styles.loadingMessages}>
                                <p>Загрузка сообщений...</p>
                            </div>
                        ) : error ? (
                            <div className={styles.errorMessages}>
                                {error}
                            </div>
                        ) : (
                            <MessageList
                                messages={messages}
                                currentUserId={user_id}
                                participants={currentChat.participants}
                            />
                        )}

                        <ChatInput
                            onSend={handleSendMessage}
                            currentChat={currentChat}
                        />
                    </>
                ) : (
                    <div className={styles.noChatSelected}>
                        <p>Выберите чат для начала общения</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;