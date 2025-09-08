import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Connect to socket server
            const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';
            const newSocket = io(socketUrl, {
                transports: ['websocket'],
                autoConnect: true,
            });

            newSocket.on('connect', () => {
                console.log('Connected to socket server');
                setConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from socket server');
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
                setConnected(false);
            }
        }
    }, [user]);

    // Join house room when user has a house
    useEffect(() => {
        if (socket && user?.house?._id) {
            socket.emit('join-house', user.house._id);
        }
    }, [socket, user?.house?._id]);

    const joinHouse = (houseId) => {
        if (socket) {
            socket.emit('join-house', houseId);
        }
    };

    const leaveHouse = (houseId) => {
        if (socket) {
            socket.emit('leave-house', houseId);
        }
    };

    const value = {
        socket,
        connected,
        joinHouse,
        leaveHouse,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

