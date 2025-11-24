import { useRouter } from "expo-router";
import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    const logIn = () => {
        setIsLoggedIn(true);
        router.replace("/");
    }

    const logOut = () => {
        setIsLoggedIn(false);
        router.replace("/login");
    }

    return (
        <AuthContext.Provider value={{ isLoggedIn, logIn, logOut }}>
            {children}
        </AuthContext.Provider>
    )
}