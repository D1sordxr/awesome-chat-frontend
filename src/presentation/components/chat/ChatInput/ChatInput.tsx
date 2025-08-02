import { useState, type FormEvent, useRef, useEffect } from 'react';
import styles from './ChatInput.module.css';
import type {ChatPreview} from "../../../../domain/core/entities/ChatPreview.ts";

interface ChatInputProps {
    onSend: (text: string) => void;
    currentChat: ChatPreview;
}

const ChatInput = ({ onSend, currentChat }: ChatInputProps) => {
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentChat?.chat_id]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
            inputRef.current?.focus();
        }
    };

    return (
        <form className={styles.chatInput} onSubmit={handleSubmit}>
            <input
                ref={inputRef} // Привязываем ref
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                className={styles.input}
                autoFocus
            />
            <button type="submit" className={styles.button}>Send</button>
        </form>
    );
};

export default ChatInput;