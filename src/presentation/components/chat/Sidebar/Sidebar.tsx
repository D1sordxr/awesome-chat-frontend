import { useState } from 'react';
import styles from './Sidebar.module.css';
import type { ChatPreview } from "../../../../domain/core/entities/ChatPreview";
import CreateChatModal from "../CreateChatModal/CreateChatModal";

interface SidebarProps {
    chats: ChatPreview[];
    setChats: (chats: ChatPreview[]) => void;
    currentChat: ChatPreview | null;
    onSelectChat: (chat: ChatPreview) => void;
    user_id: string;
}

const Sidebar = ({ chats, setChats, currentChat, onSelectChat, user_id }: SidebarProps) => {
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

    return (
        <div className={styles.sidebar}>
            <div className={styles.header}>
                <p className={styles.title}>Chats</p>
                <button
                    className={styles.newChatButton}
                    onClick={() => setIsNewChatModalOpen(true)}
                >New chat</button>
                <CreateChatModal
                    isNewChatModalOpen={isNewChatModalOpen}
                    setIsNewChatModalOpen={setIsNewChatModalOpen}
                    user_id={user_id}
                    chats={chats}
                    setChats={setChats}
                ></CreateChatModal>
            </div>
            <div className={styles.chatList}>
                {chats.map(chat => (
                    <div
                        key={chat.chat_id}
                        className={`${styles.chatItem} ${
                            currentChat?.chat_id === chat.chat_id ? styles.active : ''
                        }`}
                        onClick={() => onSelectChat(chat)}
                    >
                        <div className={styles.chatInfo}>
                            <h3 className={styles.chatName}>{chat.name}</h3>
                            {chat.last_message && (
                                <p className={styles.lastMessage}>
                                    {chat.last_message.content}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;