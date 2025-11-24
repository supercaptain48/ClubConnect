import { AuthContext } from "@/utils/authContext";
import { useContext } from "react";
import { Button, Text, View } from "react-native";

export default function Settings() {
    const authState = useContext(AuthContext);

    return (
        <View>
            <Text>Settings</Text>
            <Button title="Log out" onPress={authState.logOut} />
        </View>
        
    )
}