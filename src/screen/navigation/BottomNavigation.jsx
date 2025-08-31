import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Home, User } from 'lucide-react-native'
import { useSelector } from 'react-redux'
import { useNavigation, useRoute } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'

export const BottomNavigation = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const user = useSelector((state) => state.auth.user)

    if (!user) return null

    return (
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
            <View style={styles.container}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, route.name === 'Dashboard' && styles.activeButton]}
                    onPress={() => navigation.navigate('Dashboard')}
                >
                    <Home size={24} color={route.name === 'Dashboard' ? '#2563EB' : '#4B5563'} />
                    <Text style={[styles.label, route.name === 'Dashboard' && styles.activeLabel]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={1}
                    style={[styles.button, route.name === 'Profile' && styles.activeButton]}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <User size={24} color={route.name === 'Profile' ? '#2563EB' : '#4B5563'} />
                    <Text style={[styles.label, route.name === 'Profile' && styles.activeLabel]}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: 'white', // Bottom nav background
    },
    container: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        color: '#4B5563',
        marginTop: 2,
    },
    activeButton: {
        backgroundColor: '#EFF6FF',
    },
    activeLabel: {
        color: '#2563EB',
        fontWeight: '600',
    },
})
