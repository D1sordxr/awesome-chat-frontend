import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import styles from './Nav.module.css';
import {useAuthContext} from "../../../application/auth/UseContext.ts";

interface NavProps {
    name: string;
    setName: (name: string) => void;
}

const Nav: React.FC<NavProps> = ({ name, setName }) => {
    const auth = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.authUseCase.logout();
            setName("");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className={styles.navContainer}>
            <nav className={styles.nav}>
                <div className={styles.navLeft}>
                    <Link to="/" className={styles.defaultButton}>Home</Link>
                </div>

                <div className={styles.navRight}>
                    {name ? (
                        <>
                            <span className={styles.userGreeting}>Hello, {name}</span>
                            <Link to="/messenger" className={styles.defaultButton}>Messenger</Link>
                            <button
                                onClick={handleLogout}
                                className={styles.defaultButton}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={styles.defaultButton}>Login</Link>
                            <Link to="/register" className={styles.defaultButton}>Register</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Nav;