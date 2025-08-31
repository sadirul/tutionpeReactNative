import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useNavigation } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Eye, EyeOff, ChevronRight, School, User, Mail, Phone, MapPin, Lock } from 'lucide-react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useHttpRequest } from '../ContextApi/ContextApi'
import GradientButton from '../component/GradientButton'

// Validation schema
const validationSchema = Yup.object().shape({
    tuition_name: Yup.string().required('Tuition Name is required!').min(4),
    admin_name: Yup.string().required('Your Name is required!').min(4),
    username: Yup.string().required('Username is required!').min(4),
    email: Yup.string().required('Email is required!').email('Invalid email'),
    mobile: Yup.string().required('Mobile is required!').matches(/^[0-9]{10}$/, 'Must be 10 digits'),
    address: Yup.string().required('Address is required!').min(4),
    password: Yup.string().required('Password is required!').min(6),
    confirm_password: Yup.string().required('Confirm password is required!').oneOf([Yup.ref('password')], 'Passwords do not match'),
})

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [signupError, setSignupError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigation = useNavigation()
    const { httpRequest } = useHttpRequest()

    const { control, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
    })

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        setSignupError('')
        try {
            const response = await httpRequest('/register', {
                method: 'POST',
                data: {
                    tuition_name: data.tuition_name,
                    name: data.admin_name,
                    username: data.username,
                    email: data.email,
                    mobile: data.mobile,
                    address: data.address,
                    password: data.password,
                    confirm_password: data.confirm_password,
                },
            })
            if (response.status === 'success') {
                navigation.navigate('Login')
            } else {
                setSignupError(response.msg || 'Registration failed')
            }
        } catch (err) {
            console.error(err)
            setSignupError('Something went wrong')
        }
        setIsSubmitting(false)
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo Box */}
                    <View style={styles.logoBox}>
                        <MaterialCommunityIcons name="school" size={40} color="white" />
                    </View>

                    <Text style={styles.heading}>Get Started</Text>
                    <Text style={styles.subHeading}>Create your account to continue</Text>

                    {/* Error Box */}
                    {signupError ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{signupError}</Text>
                        </View>
                    ) : null}

                    {/* Form Fields */}
                    <View style={styles.form}>
                        {/** Tuition Name */}
                        <Controller
                            control={control}
                            name="tuition_name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <School size={18} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Tuition Name"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            )}
                        />
                        {errors.tuition_name && <Text style={styles.errorText}>{errors.tuition_name.message}</Text>}

                        {/** Admin Name */}
                        <Controller
                            control={control}
                            name="admin_name"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <User size={18} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Your Name"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            )}
                        />
                        {errors.admin_name && <Text style={styles.errorText}>{errors.admin_name.message}</Text>}

                        {/** Username */}
                        <Controller
                            control={control}
                            name="username"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <User size={18} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Username"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            )}
                        />
                        {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}

                        {/** Email */}
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Mail size={18} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            )}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                        {/** Mobile */}
                        <Controller
                            control={control}
                            name="mobile"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Phone size={18} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Mobile Number"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        keyboardType="phone-pad"
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            )}
                        />
                        {errors.mobile && <Text style={styles.errorText}>{errors.mobile.message}</Text>}

                        {/** Address */}
                        <Controller
                            control={control}
                            name="address"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <MapPin size={18} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Address"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholderTextColor="#999"
                                    />
                                </View>
                            )}
                        />
                        {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}

                        {/** Password */}
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Lock size={18} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={[styles.input, { paddingRight: 40 }]}
                                        placeholder="Password"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor="#999"
                                    />
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                        {showPassword ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

                        {/** Confirm Password */}
                        <Controller
                            control={control}
                            name="confirm_password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <View style={styles.inputWrapper}>
                                    <Lock size={18} color="#888" style={styles.icon} />
                                    <TextInput
                                        style={[styles.input, { paddingRight: 40 }]}
                                        placeholder="Confirm Password"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        secureTextEntry={!showConfirmPassword}
                                        placeholderTextColor="#999"
                                    />
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
                                        {showConfirmPassword ? <EyeOff size={18} color="#888" /> : <Eye size={18} color="#888" />}
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        {errors.confirm_password && <Text style={styles.errorText}>{errors.confirm_password.message}</Text>}

                        {/* Submit Button */}
                        <GradientButton
                            onPress={handleSubmit(onSubmit)}
                            text="Create Account"
                            loading={isSubmitting}
                            colors={['#6a11cb', '#2575fc']}
                        />

                        {/* Login link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginPrompt}>Already have an account? </Text>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f6ff' },
    scrollContainer: { flexGrow: 1, padding: 24, paddingBottom: 40 },
    logoBox: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#2575fc',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        marginTop: 12
    },
    heading: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4, color: '#111' },
    subHeading: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
    errorBox: { backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, marginBottom: 15 },
    errorText: { color: '#dc2626', fontSize: 14 },
    form: { paddingVertical: 10 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 12,
        height: 50,
    },
    icon: { marginRight: 10 },
    input: { flex: 1, fontSize: 14, color: '#111' },
    eyeBtn: { padding: 5 },
    submitBtn: { padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    submitBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 6 },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    loginPrompt: { color: '#666', fontSize: 14 },
    loginLink: { color: '#2575fc', fontSize: 14, fontWeight: '600', marginLeft: 4 },
})

export default Signup
