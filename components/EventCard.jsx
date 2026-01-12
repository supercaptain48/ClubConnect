import { View, Text, TouchableOpacity } from 'react-native';

export const EventCard = ({ e, onPress }) => {
    return (
        <TouchableOpacity key={e.name} className="mb-4 p-4 border border-gray-200 rounded-lg" activeOpacity={0.7} onPress={onPress}>
            <Text className="text-lg font-semibold mb-1 text-green-500">{e.clubName}</Text>
            <Text className="text-2xl font-bold mb-2">{e.name}</Text>
            <Text className="text-gray-600 mb-1">{e.startDate.toDate().toLocaleDateString([], { weekday: 'short' })}, {e.startDate.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })} · {e.startDate.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text className="text-gray-600 text-sm font-bold">Check-in opens at {e.checkInOpensAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
    )
}

export const MiniEventCard = ({ e, closes }) => {
    return (
        <View key={e.name} className="mb-2 py-2 px-4 border border-gray-200 rounded-lg">
            <Text className="text-sm font-semibold text-green-500">{e.clubName}</Text>
            <Text className="text-lg font-bold">{e.name}</Text>
            <Text className="text-gray-600 text-sm mb-1">{e.startDate.toDate().toLocaleDateString([], { weekday: 'short' })}, {e.startDate.toDate().toLocaleDateString([], { month: 'short', day: 'numeric' })} · {e.startDate.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            {closes ? 
                <Text className="text-gray-600 text-xs font-bold">Check-in closes at {e.checkInClosesAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                : <Text className="text-gray-600 text-xs font-bold">Check-in opens at {e.checkInOpensAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            }
        </View>
    )
}