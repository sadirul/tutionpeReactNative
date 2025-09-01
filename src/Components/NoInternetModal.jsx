import React, { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import RBSheet from 'react-native-raw-bottom-sheet'
import { useTheme } from 'react-native-paper'
import Icon from 'react-native-vector-icons/MaterialIcons'

const NoInternetModal = () => {
    const [isOffline, setOfflineStatus] = useState(false)
    const [isRetrying, setIsRetrying] = useState(false)
    const refRBSheet = useRef(null)
    const { colors } = useTheme()
    const pulseAnim = useRef(new Animated.Value(1)).current

    // Pulse animation for the icon
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        )

        if (isOffline) {
            pulse.start()
        } else {
            pulse.stop()
            pulseAnim.setValue(1)
        }

        return () => pulse.stop()
    }, [isOffline, pulseAnim])

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const offline = !(state.isConnected && state.isInternetReachable)
            setOfflineStatus(offline)
            if (offline) {
                refRBSheet.current?.open() // Only open when offline
            }
            // Removed automatic close - only close when user clicks "Try Again"
        })
        return () => unsubscribe()
    }, [])

    const handleTryAgain = async () => {
        setIsRetrying(true)

        // Add a slight delay for better UX
        setTimeout(async () => {
            const state = await NetInfo.fetch()
            const offline = !(state.isConnected && state.isInternetReachable)
            setOfflineStatus(offline)
            setIsRetrying(false)

            if (!offline) {
                refRBSheet.current?.close()
            }
        }, 1000)
    }

    const isDarkMode = colors.background === '#000000' || colors.background === '#121212'

    return (
        <RBSheet
            ref={refRBSheet}
            height={380}
            openDuration={400}
            closeOnPressMask={false}
            closeOnDragDown={false}
            customStyles={{
                wrapper: {
                    backgroundColor: 'rgba(0,0,0,0.6)'
                },
                container: {
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    backgroundColor: colors.background,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 8,
                    paddingBottom: 20, // Add padding to avoid system buttons
                },
                draggableIcon: { display: 'none' },
            }}
        >
            <View style={styles.container}>
                {/* Decorative top bar */}
                <View style={[styles.topBar, { backgroundColor: colors.text }]} />

                {/* Main content area */}
                <View style={styles.mainContent}>
                    {/* Icon with animation */}
                    <View style={styles.iconContainer}>
                        <Animated.View
                            style={[
                                styles.iconWrapper,
                                {
                                    transform: [{ scale: pulseAnim }],
                                    backgroundColor: isDarkMode ? '#ff6b6b20' : '#ff6b6b15'
                                }
                            ]}
                        >
                            <Icon
                                name="wifi-off"
                                size={48}
                                color="#ff6b6b"
                            />
                        </Animated.View>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            No Internet Connection
                        </Text>
                        <Text style={[styles.message, { color: colors.text, opacity: 0.7 }]}>
                            Please check your network settings and try again. Make sure you're connected to Wi-Fi or mobile data.
                        </Text>
                    </View>
                </View>

                {/* Action Button - Fixed at bottom */}
                <TouchableOpacity
                    style={[
                        styles.button,
                        {
                            backgroundColor: '#4f46e5',
                            opacity: isRetrying ? 0.7 : 1
                        }
                    ]}
                    onPress={handleTryAgain}
                    activeOpacity={0.8}
                    disabled={isRetrying}
                >
                    <View style={styles.buttonContent}>
                        {isRetrying && (
                            <View style={styles.loadingDot}>
                                <Animated.View style={styles.dot} />
                            </View>
                        )}
                        <Text style={styles.buttonText}>
                            {isRetrying ? 'Checking...' : 'Try Again'}
                        </Text>
                        {!isRetrying && (
                            <Icon
                                name="refresh"
                                size={20}
                                color="#ffffff"
                                style={{ marginLeft: 8 }}
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </RBSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24, // Reduced bottom padding since we added it to RBSheet
        justifyContent: 'space-between', // Distribute content evenly
    },
    topBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 16,
        opacity: 0.3,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#ff6b6b30',
    },
    content: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 8,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    loadingDot: {
        marginRight: 8,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ffffff',
    },
})

export default NoInternetModal