import { UserContext } from "@/utils/userContext";
import { Stack } from "expo-router";
import { useState } from "react";

export default function ProtectedLayout() {
    const [userData, setUserData] = useState(null);
    const [schoolData, setSchoolData] = useState(null);

    return (
        <UserContext.Provider value={{ userData, setUserData, schoolData, setSchoolData }}>
            <Stack screenOptions={{ headerShown: false }} />
        </UserContext.Provider>
    )
}