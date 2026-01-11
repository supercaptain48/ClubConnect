import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LoginInput } from "@/components/LoginInput";
import { useState } from "react";
import { auth } from "@/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Toast from "react-native-toast-message";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emptyError, setEmptyError] = useState(false);
    const [invalidError, setInvalidError] = useState(false);

    const handleSubmit = () => {
        setInvalidError(false);
        setLoading(true);
        if (!email) {
            setEmptyError(true);
            setLoading(false);
            return;
        }
        setEmptyError(false);

        sendPasswordResetEmail(auth, email)
            .then(() => {
                showLinkSentToast();
                setLoading(false);
            })
            .catch((error) => {
                setInvalidError(true);
                setLoading(false);
            });
    }

    const showLinkSentToast = () => {
        Toast.show({
            text1: "Password reset email sent successfully"
        })
    }

    return (
        <SafeAreaView className="bg-white flex-1 px-7 justify-center" edges={['left', 'right']}>
            <KeyboardAvoidingView className="flex-1 justify-center" behavior="padding">
                <Text className="text-4xl font-bold text-center mb-8">Forgot your password?</Text>

                {emptyError && <Text className="text-center font-bold text-red-500 mb-1">Email required</Text>}
                {invalidError && <Text className="text-center font-bold text-red-500 mb-1">No account found with this email</Text>}
                <LoginInput text="Email" onChangeText={setEmail} autoCapitalize="none" inputMode="email" />
                <TouchableOpacity 
                    className="bg-green-500 justify-center items-center py-3 rounded-2xl"
                    activeOpacity={0.7}
                    onPress={handleSubmit}
                >
                    {loading? <ActivityIndicator color="white" /> : <Text className="font-bold text-lg text-white">Send Reset Link</Text>}
                </TouchableOpacity>
            </KeyboardAvoidingView>
            
        </SafeAreaView>
    )
}