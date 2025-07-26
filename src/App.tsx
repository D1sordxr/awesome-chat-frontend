import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./application/context/AuthContext";
import Nav from "./presentation/components/Nav/Nav";
import Home from "./presentation/pages/Home/Home";
import Login from "./presentation/pages/Login/Login";
import Register from "./presentation/pages/Register/Register";
import {useAuth} from "./application/hooks/useAuth";
import Chat from "./presentation/pages/Chat/Chat";
import {ChatProvider} from "./application/context/ChatContext";

const AppContent = () => {
    const [id, setID] = useState<string>("");
    const [name, setName] = useState("");
    const auth = useAuth();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await auth.auth();
                setName(user.username);
                setID(user.id);
            } catch (error) {
                console.error('Auth check failed:', error);
                setName("");
                setID("");
            }
        };

        checkAuth();
    }, [auth]);

    return (
        <div className="App">
            <BrowserRouter>
                <header>
                    <Nav name={name} setName={setName} />
                </header>
                <main className="form-signin">
                    <Routes>
                        <Route path="/" element={<Home name={name} setName={setName} />} />
                        <Route path="/login" element={<Login setName={setName} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/messenger" element={<Chat user_id={id} />} />
                    </Routes>
                </main>
            </BrowserRouter>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <ChatProvider>
                <AppContent />
            </ChatProvider>
        </AuthProvider>
    );
}

export default App;