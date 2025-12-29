import { auth } from "@/firebaseConfig";
import { AuthContext } from "@/utils/authContext";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useContext } from "react";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
    const authState = useContext(AuthContext);
    const router = useRouter();

    // Handles signing out the user
    // Uses Firebase's signOut function and redirects to the login screen
    function signout() {
        signOut(auth)
            .then(() => {
                console.log("Successfully logged out");
                router.replace("/login");
            })
            .catch((error) => {
                console.log("Error signing out: ", error);
            })
    }

    return (
        <SafeAreaView>
            <Text>Settings</Text>
            <Button title="Log out" onPress={signout} />
        </SafeAreaView>
        
    )
}