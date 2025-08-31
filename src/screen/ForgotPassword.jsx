import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import LinearGradient from "react-native-linear-gradient";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigation } from "@react-navigation/native";
import { useHttpRequest } from "../ContextApi/ContextApi";
import GradientButton from "../component/GradientButton";

// Validation schema
const validationSchema = Yup.object().shape({
    email: Yup.string()
        .required("Email is required")
        .email("Enter a valid email"),
});

const ForgotPassword = () => {
    const [submitMessage, setSubmitMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { httpRequest } = useHttpRequest();
    const navigation = useNavigation();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitMessage("");

        try {
            const response = await httpRequest("/password/forgot", {
                method: "POST",
                data: { email: data.email },
            });

            if (response.status === "success") {
                setSubmitMessage("Reset link sent! Please check your email.");
            } else {
                setSubmitMessage(response.message || response.msg || "Failed to send reset link.");
            }
        } catch (error) {
            console.error(error);
            setSubmitMessage("Something went wrong. Please try again.");
        }

        setIsSubmitting(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Logo */}
            <View style={styles.logoBox}>
                <MaterialCommunityIcons name="email" size={36} color="white" />
            </View>

            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email to reset your password</Text>

            {/* Response Message */}
            {submitMessage ? (
                <View style={[
                    styles.errorContainer,
                    submitMessage.includes("sent") ? styles.successBox : styles.errorBox
                ]}>
                    <Text style={[
                        styles.errorText,
                        submitMessage.includes("sent") && { color: '#2563eb' } // blue for success
                    ]}>
                        {submitMessage}
                    </Text>
                </View>
            ) : null}


            {/* Email Input */}
            <View style={[styles.inputWrapper, errors.email && styles.inputErrorWrapper]}>
                <MaterialCommunityIcons name="email" size={20} color="#888" style={styles.icon} />
                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            placeholder="Enter your email"
                            style={styles.input}
                            onChangeText={onChange}
                            value={value}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#9ca3af"
                        />
                    )}
                />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

            {/* Submit Button */}
            <GradientButton
                onPress={handleSubmit(onSubmit)}
                text="Send Reset Link"
                loading={isSubmitting}
                colors={['#6a11cb', '#2575fc']}
            />

            {/* Back to Login */}
            <View style={styles.loginContainer}>
                <Text style={styles.loginPrompt}>Remember your password? </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
        padding: 20,
        justifyContent: 'center',
    },
    logoBox: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#2575fc',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        alignSelf: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        marginBottom: 10,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputErrorWrapper: {
        borderColor: '#ef4444',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    submitButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
    },
    successBox: {
        backgroundColor: '#e0f2fe',
        borderLeftWidth: 4,
        borderColor: '#2563eb',
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderColor: '#dc2626',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: '500',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginPrompt: {
        color: '#6b7280',
        fontSize: 14,
    },
    loginLink: {
        color: '#2575fc',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ForgotPassword;
