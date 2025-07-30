import React, {useEffect, useState} from "react";
import Modal from "react-modal";
import styles from "./CreateChatModal.module.css";
import {User} from "../../../../domain/core/entities/User";
import {useChat} from "../../../../application/hooks/useChat";

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
    const chatUseCase = useChat();
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [participants, setParticipants] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [newChatName, setNewChatName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChatCreate = async (): Promise<void> => {
        const member_ids: string[] = [user_id, ...selectedUsers];
        await chatUseCase.createChat(newChatName, member_ids);
        window.location.reload(); // TODO change to callbacks (must change)
    }

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const fetchedUsers = await chatUseCase.getAllUsers();
                setUsers(fetchedUsers.filter(user => user.id !== user_id));
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
    }, [isNewChatModalOpen, chatUseCase, user_id]);

    const handleUserSelect = (userId: string) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });

        const selected = users.find(user => user.id === userId);
        if (selected) {
            setParticipants(prev => {
                if (prev.some(user => user.id === userId)) {
                    return prev.filter(user => user.id !== userId);
                } else {
                    return [...prev, selected];
                }
            });
        }
    };

    return (
        <Modal
            isOpen={isNewChatModalOpen}
            onRequestClose={() => {
                setIsNewChatModalOpen(false);
                setSelectedUsers([]);
                setParticipants([]);
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
                    {users
                        .filter(user => user.id !== user_id)
                        .map((user) => (
                            <div
                                key={user.id}
                                className={`${styles.userItem} ${
                                    selectedUsers.includes(user.id) ? styles.selected : ''
                                }`}
                                onClick={() => handleUserSelect(user.id)}
                            >
                                <div className={styles.userContent}>
                                    {user.username ? (
                                        <p className={styles.userName}>{user.username}</p>
                                    ) : <p className={styles.userName} style={{
                                        textDecoration: 'underline dotted',
                                        opacity: 0.3
                                    }}>unnamed</p>}
                                    <p className={styles.userId}>{user.id}</p>
                                </div>
                                {selectedUsers.includes(user.id) && (
                                    <span className={styles.checkmark}>✓</span>
                                )}
                            </div>
                        ))}
                </div>
            )}

            <button
                className={styles.startButton}
                onClick={async () => {
                    if (selectedUsers.length > 0) {
                        console.log(`Creating chat "${newChatName}" with users:`, selectedUsers);
                        await handleChatCreate();
                        setIsNewChatModalOpen(false);
                        setSelectedUsers([]);
                        setParticipants([]);
                        setNewChatName('');
                    }
                }}
                disabled={selectedUsers.length === 0 || !newChatName.trim()}
            >
                {selectedUsers.length > 0 ?
                    `Create Chat (${selectedUsers.length} selected)` :
                    'Create Chat'}
            </button>
        </Modal>
    );
};

export default CreateChatModal;