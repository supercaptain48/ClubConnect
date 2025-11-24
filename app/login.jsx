import { AuthContext } from "@/utils/authContext";
import { useContext } from "react";
import { Button, Text, View } from "react-native";

export default function LoginScreen() {
    const authContext = useContext(AuthContext)

    return (
        <View className="flex-1 justify-center">
            <Text className="text-2xl">Login Screen</Text>
            <Button title="Log in" onPress={authContext.logIn} />
        </View>
    )
}