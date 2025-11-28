import { UserContext } from "@/utils/userContext";
import { Stack } from "expo-router";
import { useState } from "react";

export default function ProtectedLayout() {
    const [userData, setUserData] = useState(null);


    return (
        <UserContext.Provider value={{ userData, setUserData }}>
            <Stack screenOptions={{ headerShown: false }} />
        </UserContext.Provider>
    )
}