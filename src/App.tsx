import {useEffect, useState} from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Nav from "./presentation/components/Nav/Nav";
import Home from "./presentation/pages/Home/Home";
import Login from "./presentation/pages/Login/Login";
import Register from "./presentation/pages/Register/Register";
import Chat from "./presentation/pages/Chat/Chat";
import {createAuthServiceImpl} from "./infrastructure/api/AuthServiceImpl.ts";
import {createErrorServiceImpl} from "./infrastructure/errors/Service.ts";
import {createAuthUseCase} from "./application/auth/UseCase.ts";
import {useAuthContext} from "./application/auth/UseContext.ts";
import {createChatServiceImpl} from "./infrastructure/api/ChatServiceImpl.ts";
import {createChatUseCase} from "./application/chat/UseCase.ts";
import type {ChatUseCase} from "./application/chat/Port.ts";
import {ChatProvider} from "./application/chat/Provider.tsx";
import type {AuthUseCase} from "./application/auth/Port.ts";
import {AuthProvider} from "./application/auth/Provider.tsx";
import {WebSocketProvider} from "./application/ws/Provider.tsx";
import {createWebSocketServiceImpl, type WSConfig} from "./infrastructure/ws/WebSocket.ts";
import type {ApiConfig} from "./infrastructure/api/Config.ts";

const AppContent = () => {
    const auth = useAuthContext()

    const [id, setID] = useState<string>("");
    const [name, setName] = useState("");

    useEffect(() => {
        const checkAuth = async ():Promise<void> => {
            try {
                const response = await auth.authUseCase.auth();
                setName(response.username);
                setID(response.user_id);
                console.log(`Name:${response.username}, ID:${response.user_id}`)
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
                        <Route path="/" element={<Home id={id} setID = {setID} name={name} setName={setName} />} />
                        <Route path="/login" element={<Login setName={setName} setID={setID} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/messenger" element={<Chat user_id={id} />} />
                    </Routes>
                </main>
            </BrowserRouter>
        </div>
    );
};

function App() {
    const errorServiceImpl = createErrorServiceImpl();

    const apiConfig = {
        baseUrl: "http://localhost:8080",
        errorService: errorServiceImpl
    } as ApiConfig
    const wsConfig = {
        apiUrl: apiConfig.baseUrl,
        url: "ws://localhost:8081/ws",
        onConnect: ():void => { console.log("WS connected successfully")},
        onDisconnect: ():void => { console.log("WS disconnected successfully") }
    } as WSConfig

    const authServiceImpl = createAuthServiceImpl(apiConfig);
    const chatServiceImpl = createChatServiceImpl(apiConfig);

    const authUseCase:AuthUseCase = createAuthUseCase(authServiceImpl);
    const chatUseCase:ChatUseCase = createChatUseCase(chatServiceImpl);

    const wsClientImpl = createWebSocketServiceImpl(wsConfig);

    return (
        <AuthProvider authUseCase={authUseCase}>
            <ChatProvider chatUseCase={chatUseCase}>
                <WebSocketProvider client={wsClientImpl}>
                    <AppContent />
                </WebSocketProvider>
            </ChatProvider>
        </AuthProvider>
    );
}

export default App;