// Little button displayed above a component
// Used for creating new announcement, seeing full list of clubs, and more

import { AntDesign } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

export function LittleButton({ text, before, after, onPress }) {
    return (
        <TouchableOpacity 
            className="bg-green-500 rounded-xl px-4 py-1 flex-row gap-1 justify-center items-center"
            activeOpacity={0.7}
            onPress={onPress}
        >
            {before && <AntDesign name={before} size={16} color="white" />}
            <Text className="text-white font-bold text-sm">{text}</Text>
            {after && <AntDesign name={after} size={16} color="white" />}
        </TouchableOpacity>
    )
}