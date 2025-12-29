import { Text, TouchableOpacity } from "react-native"

// Selector component for forms (creating an account, creating a club)
export const Selector = ({ title, selected, setSelected, description }) => {
    return (
        <TouchableOpacity 
            className={`border-2 rounded-xl flex-1 px-3 py-6 justify-center ${selected != title ? "border-gray-300" : ""}`}
            onPress={() => setSelected(title)}
            activeOpacity={1}
        >
            <Text className="text-center font-bold">{title}</Text>
            {description && <Text className="mt-1 text-sm text-gray-500 text-center">{description}</Text>}
        </TouchableOpacity>
    )
}