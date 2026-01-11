import { useRouter } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function BackButton({ pos }) {
    const router = useRouter();

    return (
        <TouchableOpacity 
            className={`flex-row gap-1 ${pos}`}
            activeOpacity={0.7}
            onPress={() => router.back()}
        >
            <Ionicons name="arrow-back" size={18} color={"black"} />
            <Text className="font-bold">Back</Text>
        </TouchableOpacity>
    )
}