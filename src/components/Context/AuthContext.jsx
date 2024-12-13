import React, { createContext, useContext, useEffect, useState } from 'react'; // Hooks y utilidades de React
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'; // Métodos de autenticación de Firebase

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        const auth = getAuth();
        await signOut(auth);
        setUser(null);
    };

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
