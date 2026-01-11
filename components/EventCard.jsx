import { View, Text } from 'react-native';

export const EventCard = ({ e }) => {
    return (
        <View key={e.name} className="mb-4 p-4 border border-gray-200 rounded-lg">
            <Text className="text-lg font-semibold mb-1 text-green-500">{e.clubName}</Text>
            <Text className="text-2xl font-bold mb-2">{e.name}</Text>
            <Text className="text-gray-600">{e.startDate.toDate().toLocaleDateString([], { weekday: 'short' })}, {e.startDate.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })} · {e.startDate.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
    )
}

export const MiniEventCard = ({ e }) => {
    return (
        <View key={e.name} className="mb-2 py-2 px-4 border border-gray-200 rounded-lg">
            <Text className="text-sm font-semibold text-green-500">{e.clubName}</Text>
            <Text className="text-lg font-bold">{e.name}</Text>
            <Text className="text-gray-600 text-sm">{e.startDate.toDate().toLocaleDateString([], { weekday: 'short' })}, {e.startDate.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })} · {e.startDate.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
    )
}