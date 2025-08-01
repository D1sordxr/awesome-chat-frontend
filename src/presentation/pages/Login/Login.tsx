import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from './Login.module.css';
import {useAuthContext} from "../../../application/auth/UseContext.ts";

interface LoginProps {
    setName: (name: string) => void;
    setID: (id: string) => void;
}

const Login: React.FC<LoginProps> = ({ setName, setID }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shouldRedirect, setShouldRedirect] = useState(false);

    const auth = useAuthContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const user = await auth.authUseCase.login({
                email:formData.email, password:formData.password
            });
            setName(user.username);
            setID("Если вы по какой либо воле случая увидели это сообщение, сделайте втык разработчику")
            setShouldRedirect(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (shouldRedirect) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
                <h1 className={styles.loginTitle}>Sign in</h1>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className={styles.formControl}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className={styles.formControl}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    );
};

export default Login;