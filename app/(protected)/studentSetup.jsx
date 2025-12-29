import { app } from "@/firebaseConfig";
import { UserContext } from "@/utils/userContext";
import { useRouter } from "expo-router";
import { arrayUnion, doc, getDoc, getFirestore, increment, updateDoc } from "firebase/firestore";
import { useContext, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function StudentSetupScreen() {
    // State to hold the 6-digit school code
    // It is stored in an array because the code is displayed as 6 separate inputs to the user (like a verification code)
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const router = useRouter();
    const { userData } = useContext(UserContext);
    const [incompleteError, setIncompleteError] = useState(false);
    const [noExistError, setNoExistError] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handles the changes to each input
    const handleDigitChange = (value, index) => {
        // Create a copy of the array
        const newCode = [...code];

        // If user typed something
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

    // Handles backspace key presses to move focus back (since it is 6 separate inputs)
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

    // This function ensure that if the user taps on an input and there are inputs before it that are empty,
    // it redirects the focus to the first empty input
    const handleFocus = (index) => {
        // Find the first empty field
        const firstEmptyIndex = code.findIndex(digit => !digit);
        
        // If the user tries to tap on a field that is after the first empty one,
        // redirect them back to the first empty one.
        if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
            inputRefs.current[firstEmptyIndex]?.focus();
        }
    }

    // Handles submission of the school code
    const handleSubmit = async () => {
        // Reset errors
        setIncompleteError(false);
        setNoExistError(false);
        const fullCode = code.join("");
        // If the code is not complete, show an error
        if (fullCode.length !== 6) {
            setIncompleteError(true);
            return;
        }

        // If the code is complete, check if it exists in the database
        // Since it is loading data, show a loading symbol to the user
        setLoading(true);
        const db = getFirestore(app);
        const docSnap = await getDoc(doc(db, "schools", fullCode));
        if (docSnap.exists()) {
            // If the school exists, update the user's schoolID field in the database
            await updateDoc(doc(db, "users", userData.id), {
                schoolID: fullCode,
                clubsJoined: []
            });
            // Add the user to the school's list of students
            await updateDoc(doc(db, "schools", fullCode), {
                totalStudents: increment(1),
                students: arrayUnion(userData.id)
            })
            // Redirect to the protected area
            router.replace("(protected)");
        } else {
            // If the school does not exist, show an error
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
                {/* Go through each digit of the code and display it in a separate textInput in a row */}
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