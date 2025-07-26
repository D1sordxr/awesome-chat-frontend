import styles from './Message.module.css';
import { Message as MessageType, Participant } from "../../../../domain/core/entities/ChatPreview";

interface MessageComponentProps {
    message: MessageType;
    participants: Participant[];
}

const MessageComponent = ({ message, participants }: MessageComponentProps) => {
    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Находим username по sender_id
    const getUsername = (senderId: string) => {
        const participant = participants.find(p => p.user_id === senderId);
        return participant?.username || senderId;
    };

    return (
        <div className={`${styles.message} ${message.isMe ? styles.myMessage : styles.otherMessage}`}>
            <div className={styles.messageContent}>
                {!message.isMe && (
                    <div className={styles.senderName}>
                        {getUsername(message.sender_id)}
                    </div>
                )}
                <div className={styles.messageText}>{message.text}</div>
                <div className={styles.messageTime}>
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    );
};

export default MessageComponent;