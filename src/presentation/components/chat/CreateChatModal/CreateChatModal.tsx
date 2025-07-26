import React, { useState } from "react";
import Modal from "react-modal";
import styles from "./CreateChatModal.module.css";

interface CreateChatModalProps {
    isNewChatModalOpen: boolean;
    setIsNewChatModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({
                                                             isNewChatModalOpen,
                                                             setIsNewChatModalOpen
                                                         }: CreateChatModalProps) => {
    const [selectedUser, setSelectedUser] = useState('');
    const [participants, setParticipants] = useState<string[]>([]);
    const users = [
        'User1', 'User2', 'User3','User1', 'User2', 'User3','User1', 'User2', 'User3'
    ];
    const [newChatName, setNewChatName] = useState('');

    return (
        <Modal
            isOpen={isNewChatModalOpen}
            onRequestClose={() => {
                    setIsNewChatModalOpen(false)
                    setSelectedUser('');
                    setParticipants([]);
                    setNewChatName('');
                }
            }
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

            <div className={styles.userList}>
                {users.map((user, index) => (
                    <div
                        key={`${user}-${index}`}
                        className={`${styles.userItem} ${
                            selectedUser === user ? styles.selected : ''
                        }`}
                        onClick={() => setSelectedUser(user)}
                    >
                        {user}
                        {selectedUser === user && (
                            <span className={styles.checkmark}>✓</span>
                        )}
                    </div>
                ))}
            </div>

            <button
                className={styles.startButton}
                onClick={() => {
                    if (selectedUser) {
                        console.log(`Creating chat "${newChatName}" with ${selectedUser}`);
                        setIsNewChatModalOpen(false);
                    }
                }}
                disabled={!selectedUser || !newChatName.trim()}
            >
                Create Chat
            </button>
        </Modal>
    );
};

export default CreateChatModal;