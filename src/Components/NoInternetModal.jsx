import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import RBSheet from 'react-native-raw-bottom-sheet'
import { useTheme } from 'react-native-paper'

const NoInternetModal = () => {
    const [isOffline, setOfflineStatus] = useState(false)
    const refRBSheet = useRef(null)
    const { colors } = useTheme() // Get theme colors

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const offline = !(state.isConnected && state.isInternetReachable)
            setOfflineStatus(offline)

            if (offline) {
                refRBSheet.current?.open() // Open modal if offline
            }
        })

        return () => unsubscribe()
    }, [])

    const handleTryAgain = async () => {
        const state = await NetInfo.fetch();
        const offline = !(state.isConnected && state.isInternetReachable);
        setOfflineStatus(offline);

        if (!offline) {
            refRBSheet.current?.close(); // Only close if internet is restored
        }
    }

    return (
        <RBSheet
            ref={refRBSheet}
            height={200}
            openDuration={300}
            closeOnPressMask={false}
            closeOnDragDown={false}
            customStyles={{
                wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
                container: {
                    padding: 20,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    backgroundColor: colors.background,
                },
                draggableIcon: { display: 'none' },
            }}
        >
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.primary }]}>
                    No Internet Connection!
                </Text>
                <Text style={[styles.message, { color: colors.text }]}>
                    Oops! No internet connection. Please check your network.
                </Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleTryAgain}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, { color: colors.background }]}>
                        Try Again
                    </Text>
                </TouchableOpacity>
            </View>
        </RBSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    button: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
})

export default NoInternetModal
