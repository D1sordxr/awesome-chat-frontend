import React from 'react';
import styles from './Home.module.css';
import {useNavigate} from "react-router-dom";
import {useAuthContext} from "../../../application/auth/UseContext.ts";

interface HomeProps {
    id: string;
    setID: (id:string) => void;
    name: string;
    setName: (name: string) => void;
}

const Home: React.FC<HomeProps> = ({ id, setID ,name, setName }) => {
    const auth = useAuthContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.authUseCase.logout();
            setName("");
            setID("");
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className={styles.homeContainer}>
            <div className={styles.content}>
                {name ? (
                    <>
                        <h1 className={styles.greeting}>
                            Welcome back, <span className={styles.username}>{name}</span>!
                        </h1>
                        <p className={styles.subtext}>{id ? (`Your personal ID: ${id}`) : ("Failed to get your id")}</p>
                        <p className={styles.subtext}>You're now authenticated and ready to go</p>
                        <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <h1 className={styles.greeting}>Welcome to our platform</h1>
                        <p className={styles.subtext}>Please sign in to access your account</p>
                        <div className={styles.features}>
                            <div className={styles.featureCard}>
                                <h3>Secure</h3>
                                <p>Your data is protected with encryption</p>
                            </div>
                            <div className={styles.featureCard}>
                                <h3>Fast</h3>
                                <p>Lightning fast performance</p>
                            </div>
                            <div className={styles.featureCard}>
                                <h3>Reliable</h3>
                                <p>99.9% uptime guarantee</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;