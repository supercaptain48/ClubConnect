import { UserContext } from "@/utils/userContext";
import { useContext } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    const { userData, setUserData } = useContext(UserContext);

    return (
        <SafeAreaView className="px-6 bg-white flex-1">
                <Text className="font-bold text-red-500 text-3xl">Hello, {userData.firstName}</Text>
        </SafeAreaView>
    )
}