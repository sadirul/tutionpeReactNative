// components/GradientButton.jsx
import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

const GradientButton = ({ onPress, text, colors = ['#6a11cb', '#2575fc'], loading = false, style }) => {
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={loading}>
            <LinearGradient
                colors={colors}
                style={[styles.button, style, loading && { opacity: 0.7 }]}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.text}>{text}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})

export default GradientButton
