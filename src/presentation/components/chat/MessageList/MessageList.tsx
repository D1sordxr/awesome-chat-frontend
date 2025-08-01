import styles from './MessageList.module.css';
import MessageComponent from "../Message/Message";
import type { Message, Participant } from "../../../../domain/core/entities/ChatPreview";

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    participants: Participant[];
}

const MessageList = ({ messages, currentUserId, participants }: MessageListProps) => {
    return (
        <div className={styles.messageList}>
            {messages.map((message, index) => (
                <MessageComponent
                    key={`${message.user_id}-${index}`}
                    message={{
                        ...message,
                        isMe: message.user_id === currentUserId
                    }}
                    participants={participants}
                />
            ))}
        </div>
    );
};

export default MessageList;