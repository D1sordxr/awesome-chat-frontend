import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "./CreateChatModal.module.css";
import type { User } from "../../../../domain/core/entities/User";
import { useChatContext } from "../../../../application/chat/UseContext.ts";

interface CreateChatModalProps {
    isNewChatModalOpen: boolean;
    setIsNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    user_id: string;
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({
                                                             isNewChatModalOpen,
                                                             setIsNewChatModalOpen,
                                                             user_id,
                                                         }: CreateChatModalProps) => {
    const chatContext = useChatContext();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newChatName, setNewChatName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChatCreate = async (): Promise<void> => {
        if (!newChatName.trim() || selectedUsers.length === 0) return;

        const member_ids: string[] = [user_id, ...selectedUsers];
        try {
            await chatContext.chatUseCase.createChat(newChatName, member_ids);
            setIsNewChatModalOpen(false);
            setSelectedUsers([]);
            setNewChatName('');
            // TODO: Заменить на колбэк или состояние вместо перезагрузки
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create chat');
            console.error('Error creating chat:', err);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedUsers = await chatContext.chatUseCase.getAllUsers();
                setUsers(fetchedUsers.filter(user => user.user_id !== user_id));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load users');
                console.error('Error fetching users:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isNewChatModalOpen) {
            fetchUsers();
        }
    }, [isNewChatModalOpen, chatContext, user_id]);

    const handleUserSelect = (userId: string) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    return (
        <Modal
            isOpen={isNewChatModalOpen}
            onRequestClose={() => {
                setIsNewChatModalOpen(false);
                setSelectedUsers([]);
                setNewChatName('');
            }}
            contentLabel="Start New Chat"
            className={styles.modal}
            overlayClassName={styles.overlay}
        >
            <h2 className={styles.title}>Create New Chat</h2>

            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder="Enter chat name..."
                    className={styles.input}
                />
            </div>

            <h2 className={styles.subtitle}>Select participants</h2>

            {isLoading ? (
                <div className={styles.loading}>Loading users...</div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : (
                <div className={styles.userList}>
                    {users.map((user) => (
                        <div
                            key={user.user_id}
                            className={`${styles.userItem} ${
                                selectedUsers.includes(user.user_id) ? styles.selected : ''
                            }`}
                            onClick={() => handleUserSelect(user.user_id)}
                        >
                            <div className={styles.userContent}>
                                {user.username ? (
                                    <p className={styles.userName}>{user.username}</p>
                                ) : (
                                    <p className={styles.userName} style={{
                                        textDecoration: 'underline dotted',
                                        opacity: 0.3
                                    }}>
                                        unnamed
                                    </p>
                                )}
                                <p className={styles.userId}>{user.user_id}</p>
                            </div>
                            {selectedUsers.includes(user.user_id) && (
                                <span className={styles.checkmark}>✓</span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button
                className={styles.startButton}
                onClick={handleChatCreate}
                disabled={selectedUsers.length === 0 || !newChatName.trim()}
            >
                {selectedUsers.length > 0
                    ? `Create Chat (${selectedUsers.length} selected)`
                    : 'Create Chat'}
            </button>
        </Modal>
    );
};

export default CreateChatModal;