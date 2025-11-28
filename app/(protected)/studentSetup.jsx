import { app } from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";
import { useRouter } from "expo-router";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useContext, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function StudentSetupScreen() {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const router = useRouter();
    const { userData } = useContext(UserContext);
    const [incompleteError, setIncompleteError] = useState(false);
    const [noExistError, setNoExistError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDigitChange = (value, index) => {
        const newCode = [...code];

        if (value) {
            // Handle pasting a full code
            if (value.length === 6 && index === 0) {
                const newValues = value.toUpperCase().split("");
                setCode(newValues);
                // Focus the last input
                inputRefs.current[5]?.focus();
                return;
            }

            // Handle normal typing
            newCode[index] = value.slice(-1).toUpperCase(); // Use only the last char
            setCode(newCode);

            // Auto-focus next input if not the last field
            if (index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        } 
        
        // Backspace on nonempty field
        else {
            newCode[index] = "";
            setCode(newCode);
        }
    }

    const handleKeyPress = ({ nativeEvent: { key } }, index) => {
        if (key === "Backspace") {
            if (code[index] === "" && index > 0) {
                const newCode = [...code];
                newCode[index - 1] = ""; // Clear previous field
                setCode(newCode);
                
                // Move focus to previous field
                inputRefs.current[index - 1]?.focus();
            }
        }
    }

    const handleFocus = (index) => {
        // Find the first empty field
        const firstEmptyIndex = code.findIndex(digit => !digit);
        
        // If the user tries to tap on a field that is after the first empty one,
        // redirect them back to the first empty one.
        if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
            inputRefs.current[firstEmptyIndex]?.focus();
        }
    }

    const handleSubmit = async () => {
        setIncompleteError(false);
        setNoExistError(false);
        const fullCode = code.join("");
        if (fullCode.length !== 6) {
            setIncompleteError(true);
            return;
        }

        setLoading(true);
        const db = getFirestore(app);
        const docSnap = await getDoc(doc(db, "schools", fullCode));
        if (docSnap.exists()) {
            await updateDoc(doc(db, "users", userData.id), {
                schoolID: fullCode,
                clubsJoined: []
            });
            router.replace("(tabs)");
        } else {
            setNoExistError(true);
            setLoading(false);
            return;
        }
    }

    return (
        <KeyboardAvoidingView className="flex-1 justify-center items-center px-8 bg-white" behavior="padding">
            <Text className="text-3xl text-green-500 font-bold mb-10">Welcome, {userData.firstName}</Text>
            <Text className="text-xl font-bold mb-4">Enter your school code to continue</Text>
            {incompleteError && <Text className="text-red-500 font-bold mb-2">Full code required</Text>}
            {noExistError && <Text className="text-red-500 font-bold mb-2">Invalid code</Text>}
            <View className="flex-row gap-2">
                {code.map((digit, index) => (
                    <TextInput 
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        className="flex-1 border-2 rounded-xl font-bold text-3xl h-20 text-center justify-center" 
                        value={digit}
                        caretHidden={true} 
                        autoCapitalize="none"
                        maxLength={1}
                        onChangeText={(value) => (handleDigitChange(value, index))}
                        onKeyPress={(e) => handleKeyPress(e, index)} // Handles backspace
                        onFocus={() => (handleFocus(index))} // Handles manual taps
                    />
                ))}
            </View>
            
            <TouchableOpacity 
                className="bg-green-500 justify-center items-center py-3 rounded-2xl mt-8 w-full" 
                onPress={handleSubmit}
                activeOpacity={0.7}
            >
                {loading ? <ActivityIndicator color="white" /> : 
                    <Text className="font-bold text-lg text-white">Join School</Text>
                }
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}