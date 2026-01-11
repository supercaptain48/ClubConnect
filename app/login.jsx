import { LoginInput } from "@/components/LoginInput";
import { auth } from "@/firebaseConfig";
import { AuthContext } from "@/utils/authContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useContext, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function LoginScreen() {
    const authContext = useContext(AuthContext);
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    // Function to handle login
    // After logging in, redirect to the protected area
    // If there's an error, set the error state to true to display an error message
    function login() {
        setLoading(true);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                router.replace("/")
            })
            .catch((error) => {
                setError(true);
                setLoading(false);
            })
    }

    return (
        // KeyboardAvoidingView is used instead of regular View to prevent the keyboard from covering inputs when it pops up
        <KeyboardAvoidingView className="flex-1 justify-center bg-white px-8" behavior="padding">
            <Text className="text-center font-bold text-3xl">Welcome to</Text>
            <Text className="text-5xl font-bold text-center text-green-500 mb-8">ClubConnect</Text>

            {error && <Text className="text-center font-bold text-red-500 mb-1">Email or password is incorrect</Text>}
            <LoginInput text="Email" onChangeText={setEmail} autoCapitalize="none" inputMode="email" />
            <View>
                <LoginInput text="Password" onChangeText={setPassword} autoCapitalize="none" secureTextEntry={!showPassword} />
                <TouchableOpacity 
                    className="absolute inset-y-0 right-3 z-10 items-center justify-center" 
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons 
                        name={showPassword ? "eye-off" : "eye"}
                        size={24}
                        color={"#aaa"}
                    />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/forgotPassword")}
            >
                <Text className="font-bold text-green-500 -mt-3 mb-6">Forgot password?</Text>
            </TouchableOpacity>
            
            

            <TouchableOpacity 
                className="bg-green-500 justify-center items-center py-3 rounded-2xl"
                activeOpacity={0.7}
                onPress={login}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text className="font-bold text-lg text-white">Login</Text>}
            </TouchableOpacity>

            <Text className="text-center font-bold text-2xl my-4">or</Text>

            <TouchableOpacity 
                className="bg-black justify-center items-center py-3 rounded-2xl"
                activeOpacity={0.7}
                onPress={() => router.push("/signup")}
            >
                <Text className="font-bold text-lg text-white">Create your account</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}