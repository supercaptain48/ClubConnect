import { useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { useContext, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { app } from "@/firebaseConfig";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { UserContext } from "@/utils/userContext";

export default function CheckInScreen() {
    const params = useLocalSearchParams();
    const db = getFirestore(app);
    const [event, setEvent] = useState({});
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [incompleteError, setIncompleteError] = useState(false);
    const { userData } = useContext(UserContext);
    const [invalidError, setInvalidError] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [screenLoaded, setScreenLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const docSnap = await getDoc(doc(db, "clubs", params.clubId, "events", params.eventId));
            const e = docSnap.data();
            setEvent(e);

            // Check if user has already checked in
            const snapshot = await getDocs(collection(db, "clubs", params.clubId, "events", params.eventId, "attendance"));
            const attendance = snapshot.docs.map(doc => doc.id);
            if (attendance.includes(userData.id)) {
                setCheckedIn(true);
            }

            setScreenLoaded(true);
        } 

        fetchData();
    }, []);

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
        setIncompleteError(false);
        setInvalidError(false);

        const fullCode = code.join("");
        // If the code is not complete, show an error
        if (fullCode.length !== 6) {
            setIncompleteError(true);
            return;
        }

        if (fullCode === event.code) {
            setLoading(true);
            await setDoc(doc(db, "clubs", params.clubId, "events", params.eventId, "attendance", userData.id), {
                checkedInAt: serverTimestamp()
            });
            setLoading(false);
            setCheckedIn(true);
        } else {
            setInvalidError(true);
            return;
        }
        
    }

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-white px-7" edges={['left', 'right']}>
            {screenLoaded && 
            <KeyboardAvoidingView className="flex-1 w-full items-center justify-center" behavior="padding">
                <Text className="text-2xl font-bold text-green-500 text-center">{event.name}</Text>

                {checkedIn ? <Text className="font-bold mt-4 text-xl">You have been checked in</Text> : 
                    <>
                        <Text className="font-bold mt-4 mb-2 text-lg">Check-in with code</Text>

                        {incompleteError && <Text className="text-red-500 font-bold mb-2">Full code required</Text>}
                        {invalidError && <Text className="text-red-500 font-bold mb-2">Invalid code</Text>}
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
                                <Text className="font-bold text-lg text-white">Check-In</Text>
                            }
                        </TouchableOpacity>
                    </>
                }
            </KeyboardAvoidingView>}
        </SafeAreaView>
    )
}