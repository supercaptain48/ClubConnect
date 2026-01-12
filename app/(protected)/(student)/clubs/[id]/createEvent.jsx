import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { LoginInput } from "@/components/LoginInput";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useState } from "react";
import DatePicker from "react-native-date-picker";
import { addDoc, arrayUnion, collection, doc, getFirestore, updateDoc } from "firebase/firestore";
import app from "@/firebaseConfig";

export default function CreateEventScreen() {
    const params = useLocalSearchParams();
    const [startDate, setStartDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState(false);
    const db = getFirestore(app);
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Date input component
    // Reusable component for date and time input
    const DateInput = ({ open, setOpen, value, mode, date, setDate, text }) => {
        return (
            <>
                <TouchableOpacity onPress={() => setOpen(true)}>
                    <LoginInput 
                        text={text} 
                        value={value}
                        editable={false}
                        pointerEvents="none"
                    />
                </TouchableOpacity>
                <DatePicker 
                    modal
                    open={open}
                    date={date}
                    mode={mode}
                    onConfirm={(date) => {
                        setOpen(false);
                        setDate(date);
                    }}
                    onCancel={() => {
                        setOpen(false);
                    }}
                />
            </>
        )
    }

    // Generates a random 6 character code
    const generateRandomCode = () => {
        // characters to choose from
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            // Pick a random character and append to result
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // Create check-in window 10 minutes before and 30 minutes after event start time
    const createCheckInWindow = (date) => {
        const d = new Date(date);
        const opensAt = new Date(d.getTime() - 10 * 60 * 1000);
        const closesAt = new Date(d.getTime() + 30 * 60 * 1000);

        return { opensAt, closesAt };
    }

    const handleSubmit = async () => {
        let errorExists = false;
        setNameError(false);

        if (!name) {
            errorExists = true;
            setNameError(true);
        }

        if (errorExists) {
            return;
        }

        setLoading(true);

        const { opensAt, closesAt } = createCheckInWindow(startDate);

        await addDoc(collection(db, "clubs", params.id, "events"), {
            name: name,
            startDate: startDate,
            checkInOpensAt: opensAt, 
            checkInClosesAt: closesAt,
            code: generateRandomCode(),
            createdAt: new Date(),
            clubId: params.id
        })

        router.back();
        setLoading(false);
    }

    return (
        <View className="bg-white flex-1 justify-center px-7">
            <KeyboardAvoidingView className="flex-1 justify-center" behavior="padding">
                {nameError && <Text className="text-center font-bold text-red-500 mb-1">Event name is required</Text>}
                <LoginInput text="Event Name" onChangeText={setName} />
                <DateInput 
                    open={showDatePicker} 
                    setOpen={setShowDatePicker} 
                    value={startDate.toDateString()} 
                    mode="date" 
                    date={startDate}
                    setDate={setStartDate}
                    text="Date"
                />
                <View className="flex-row gap-2">
                    <View className="flex-1">
                        <DateInput 
                            open={showStartTimePicker} 
                            setOpen={setShowStartTimePicker} 
                            value={startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                            mode="time" 
                            date={startDate}
                            setDate={setStartDate}
                            text="Start Time"
                        />
                    </View>
                </View>
                <TouchableOpacity 
                    className="bg-green-500 rounded-xl px-4 py-3 items-center justify-center mt-6" 
                    activeOpacity={0.7}
                    onPress={handleSubmit}
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Create Event</Text>}
                </TouchableOpacity>
            </KeyboardAvoidingView>
            
        </View>
    )
}