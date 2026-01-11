import { useRouter } from "expo-router";
import { useContext, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { UserContext } from "@/utils/userContext";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { arrayUnion, collection, doc, getDoc, getDocs, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "@/firebaseConfig";

export default function JoinClubScreen() {
    // State to hold the 6-digit school code
    // It is stored in an array because the code is displayed as 6 separate inputs to the user (like a verification code)
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const router = useRouter();
    const { userData } = useContext(UserContext);
    const [incompleteError, setIncompleteError] = useState(false);
    const [noExistError, setNoExistError] = useState(false);
    const [alreadyjoinedError, setAlreadyJoinedError] = useState(false);
    const [loading, setLoading] = useState(false);
    const db = getFirestore(app);

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

    const handleSubmit = async () => {
        // Reset errors
        setIncompleteError(false);
        setNoExistError(false);
        setAlreadyJoinedError(false);
        const fullCode = code.join("");
        // If the code is not complete, show an error
        if (fullCode.length !== 6) {
            setIncompleteError(true);
            return;
        }

        // If the user has already joined the club, show an error
        if (userData.myClubs?.includes(fullCode) || userData.clubsJoined?.includes(fullCode)) {
            setAlreadyJoinedError(true);
            return;
        }

        setLoading(true);
        const docSnap = await getDoc(doc(db, "clubs", fullCode));
        if (docSnap.exists()) {
            await updateDoc(doc(db, "clubs", fullCode), {
                members: arrayUnion(userData.id)
            })
    
            await updateDoc(doc(db, "users", userData.id), {
                clubsJoined: arrayUnion(fullCode)
            });

            router.back();
        } else {
            setNoExistError(true);
            setLoading(false);
            return;
        }
    }

    return (
        <KeyboardAvoidingView className="bg-white flex-1 pt-8 px-7 items-center justify-center" behavior="padding">
            <Text className="text-xl font-bold mb-4">Enter Join Code</Text>
            {incompleteError && <Text className="text-red-500 font-bold mb-2">Full code required</Text>}
            {noExistError && <Text className="text-red-500 font-bold mb-2">Invalid code</Text>}
            {alreadyjoinedError && <Text className="text-red-500 font-bold mb-2">Club already joined</Text>}
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
                activeOpacity={0.7}
                onPress={handleSubmit}
            >
                {loading ? <ActivityIndicator color="white" /> : 
                    <Text className="font-bold text-lg text-white">Join Club</Text>
                }
            </TouchableOpacity>
        </KeyboardAvoidingView>
    )
}