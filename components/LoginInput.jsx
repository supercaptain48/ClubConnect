import { Text, TextInput, View } from "react-native";

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