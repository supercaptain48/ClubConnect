import { View } from "react-native"

// Component that displays items in a clean box layout with a shadow
export const Box = ({ children, height }) => {
    return (
        <View className={`bg-white shadow-xl h-64 rounded-2xl items-center justify-center mt-2`}>
            {children}
        </View>
    )
}