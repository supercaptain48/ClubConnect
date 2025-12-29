import { Text, TextInput, View } from "react-native";

// A reusable input component for login and signup screens
// This component is also used in other forms like creating a club
// It displays a label and a text input together
export const LoginInput = ({ text, label, ...props }) => {
    return (
        <View>
            <Text className="font-bold">{label ?? `Enter ${text}`}</Text>
            <View className="flex-row items-center justify-center">
                <TextInput 
                    className="flex-1 border border-gray-400 rounded-xl px-4 py-4 mb-6" 
                    placeholder={text} 
                    {...props}
                />
            </View>
            
        </View>
    )
}