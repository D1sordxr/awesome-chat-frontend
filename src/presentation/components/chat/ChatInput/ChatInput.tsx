import { useState, FormEvent } from 'react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
    onSend: (text: string) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <form className={styles.chatInput} onSubmit={handleSubmit}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className={styles.input}
            />
            <button type="submit" className={styles.button}>Send</button>
        </form>
    );
};

export default ChatInput;