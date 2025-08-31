import React from "react"
import { View, Text, ActivityIndicator, StyleSheet } from "react-native"
import { BlurView } from "@react-native-community/blur"

const Loader = ({ visible = false, text = "Loading...", blurAmount = 0 }) => {
    if (!visible) return null

    return (
        <View style={styles.overlay}>
            <BlurView
                style={styles.blur}
                blurType="light"   // try "dark" if you want dim background
                blurAmount={blurAmount}    // increase = stronger blur
                reducedTransparencyFallbackColor="white"
            />
            {/* optional semi-transparent overlay to simulate ~60% opacity */}
            <View style={styles.tint} />

            <View style={styles.content}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.overlayText}>{text}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
    },
    tint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.4)", // ~40% tint = 60% blur feel
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    overlayText: {
        marginTop: 10,
        fontSize: 16,
        color: "#111827",
        fontWeight: "500",
    },
})

export default Loader
