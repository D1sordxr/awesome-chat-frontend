import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/chat/Sidebar/Sidebar';
import MessageList from '../../components/chat/MessageList/MessageList';
import ChatInput from '../../components/chat/ChatInput/ChatInput';
import styles from './Chat.module.css';
import { useChat } from "../../../application/hooks/useChat";
import { ChatPreview, Message } from '../../../domain/core/entities/ChatPreview';
import { WSClientImpl } from "../../../infrastructure/api/ChatWS";
import {WSClient, WSMessage, WsMessageData} from "../../../domain/core/entities/WSClient";

interface ChatProps {
    user_id: string;
}

const Chat: React.FC<ChatProps> = ({ user_id }) => {
    const chatUseCase = useChat();
    const [currentChat, setCurrentChat] = useState<ChatPreview | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [loading, setLoading] = useState({
        chats: true,
        messages: false
    });
    const [error, setError] = useState<string | null>(null);
    const [chatIds, setChatIds] = useState<string[]>([]);
    const [wsClient, setWsClient] = useState<WSClient | null>(null);

    useEffect(() => {
        const loadChats = async () => {
            try {
                setLoading(prev => ({ ...prev, chats: true }));
                setError(null);

                const response = await chatUseCase.getUserChatPreview(user_id);
                setChats(response.chat_previews);
                setChatIds(response.chat_previews.map(chat => chat.chat_id));

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
    }, [user_id, chatUseCase]);

    // Загрузка сообщений при смене чата
    useEffect(() => {
        if (!currentChat) return;

        const loadMessages = async () => {
            try {
                setLoading(prev => ({ ...prev, messages: true }));
                setError(null);

                const messages: Message[] = await chatUseCase.getChatAllMessages(currentChat.chat_id);
                const processedMessages: Message[] = messages.map(message => ({
                    ...message,
                    isMe: message.sender_id === user_id
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
    }, [currentChat, user_id]);

    // Инициализация WebSocket
    useEffect(() => {
        if (!user_id || !currentChat) return;

        const client = new WSClientImpl(`ws://localhost:8081/ws/${user_id}`);
        setWsClient(client);

        const handleNewMessage = (msg: WSMessage) => {
            console.log('New WS message:', msg);

            try {
                // 1. Используем сообщение как данные
                const messageData = msg as unknown as WsMessageData;

                // 2. Проверяем, что сообщение относится к текущему чату
                if (messageData.chat_id !== currentChat.chat_id) {
                    console.log('Message for another chat, ignoring');
                    return;
                }

                // 3. Создаем новое сообщение
                const newMessage: Message = {
                    sender_id: messageData.user_id,
                    text: messageData.content,
                    timestamp: new Date().toISOString(),
                    isMe: user_id === messageData.user_id
                };

                if (user_id === newMessage.sender_id) {
                    console.log('Skipping message', newMessage);
                } else {
                    console.log('Adding new message', newMessage);
                    setMessages(prev => [...prev, newMessage]);
                }

                setChats(prev => prev.map(chat =>
                    chat.chat_id === currentChat.chat_id
                        ? {
                            ...chat,
                            last_message: {
                                text: messageData.content,
                                sender_id: messageData.user_id,
                                timestamp: new Date().toISOString()
                            }
                        }
                        : chat
                ));
            } catch (err) {
                console.error('Error processing WS message:', err);
            }
        };

        client.onMessage(handleNewMessage);

        client.connect().catch((err) => {
            console.error("WebSocket connection error:", err);
        });

        return () => {
            client.disconnect();
        };
    }, [user_id, currentChat]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || !currentChat) return;

        try {
            const newMessage: Message = {
                text,
                sender_id: user_id,
                timestamp: new Date().toISOString(),
                isMe: true
            };

            setMessages(prev => [...prev, newMessage]);

            setChats(prev => prev.map(chat =>
                chat.chat_id === currentChat.chat_id
                    ? {
                        ...chat,
                        last_message: {
                            text,
                            sender_id: user_id,
                            timestamp: new Date().toISOString()
                        }
                    }
                    : chat
            ));

            await chatUseCase.sendSync(newMessage, currentChat.chat_id);
        } catch (err) {
            console.error('Failed to send message:', err);
            setMessages(prev => prev.slice(0, -1));
            setError('Не удалось отправить сообщение');
        }
    };

    if (loading.chats && chats.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <p>Загрузка чатов...</p>
            </div>
        );
    }

    if (error && chats.length === 0) {
        return (
            <div className={styles.errorContainer}>
                <>{error}</>
            </div>
        );
    }

    return (
        <div className={styles.app}>
            <Sidebar
                chats={chats}
                currentChat={currentChat}
                onSelectChat={setCurrentChat}
                user_id={user_id}
            />

            <div className={styles.chatContainer}>
                {currentChat ? (
                    <>
                        <div className={styles.chatHeader}>
                            <p className={styles.chatName}>{currentChat.name}</p>
                            <p className={styles.participantsInfo}>{currentChat.participants.length} members</p>
                        </div>

                        {loading.messages ? (
                            <></>
                        ) : error ? (
                            <> {error} </>
                        ) : (
                            <MessageList
                                messages={messages}
                                currentUserId={user_id}
                                participants={currentChat.participants}
                            />
                        )}

                        <ChatInput
                            onSend={handleSendMessage}
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