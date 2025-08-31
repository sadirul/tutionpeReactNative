import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

const FloatingLabelInput = ({
    field,
    value,
    setValue,
    label,
    keyboardType = 'default',
    error,
    isTextArea = false,
    onFocus,
    onBlur,
    showPassword = true,
    toggleSecure,
    icon,
}) => {
    const isFocused = field === onFocus?.field;
    const hasValue = value.length > 0;

    return (
        <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
                <Text
                    style={[
                        styles.label,
                        (isFocused || hasValue) && styles.labelFloating,
                        icon
                            ? (isFocused || hasValue ? { left: 12 } : { left: 40 }) // floating or default, keep space for icon
                            : (isFocused || hasValue ? { left: 12 } : { left: 12 }), // no icon, default positions
                    ]}
                >
                    {label}
                </Text>
                <View
                    style={[
                        styles.inputWrapper,
                        isFocused && styles.inputFocused,
                    ]}
                >
                    {icon && <View style={styles.icon}>{icon}</View>}
                    <TextInput
                        style={[
                            isTextArea ? styles.textarea : styles.input,
                            icon && styles.inputWithIcon,
                            toggleSecure && { paddingRight: 40 },
                        ]}
                        value={value}
                        onChangeText={setValue}
                        onFocus={() => onFocus?.(field)}
                        onBlur={onBlur}
                        keyboardType={keyboardType}
                        multiline={isTextArea}
                        numberOfLines={isTextArea ? 3 : 1}
                        textAlignVertical={isTextArea ? 'top' : 'center'}
                        secureTextEntry={!showPassword}
                        placeholderTextColor="#9CA3AF"
                    />
                    {toggleSecure && (
                        <TouchableOpacity
                            style={styles.eyeBtn}
                            onPress={toggleSecure}
                            activeOpacity={0.7}
                        >
                            {showPassword ? (
                                <EyeOff size={20} color="#6B7280" />
                            ) : (
                                <Eye size={20} color="#6B7280" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: {
        marginBottom: 20,
    },
    inputContainer: {
        position: 'relative',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        backgroundColor: '#F9FAFB',
        height: 50,
    },
    label: {
        position: 'absolute',
        left: 12,
        top: 14,
        fontSize: 16,
        color: '#6B7280',
        zIndex: 1,
    },
    labelFloating: {
        top: -10,
        fontSize: 12,
        color: '#2563EB',
        backgroundColor: '#ffffffff',
        paddingHorizontal: 6,
        zIndex: 2,
        borderRadius: 50
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingVertical: 0,
        height: 50,
        paddingLeft: 12, // default padding without icon
        paddingRight: 12,
    },
    inputWithIcon: {
        paddingLeft: 40, // ensures placeholder & text don’t overlap icon
    },
    textarea: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        paddingHorizontal: 12,
        paddingTop: 20,
        textAlignVertical: 'top',
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#F9FAFB',
    },
    inputFocused: {
        borderColor: '#2563EB',
        backgroundColor: '#fff',
    },
    icon: {
        position: 'absolute',
        top: 14,
        left: 12, // consistent small gap
    },
    eyeBtn: {
        position: 'absolute',
        right: 10,
        top: 12,
        padding: 4,
    },
    errorText: {
        color: '#DC2626',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default FloatingLabelInput;
