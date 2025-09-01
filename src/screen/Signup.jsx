import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useNavigation } from '@react-navigation/native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Eye, EyeOff, School, User, Mail, Phone, MapPin, Lock } from 'lucide-react-native'
import { useHttpRequest } from '../ContextApi/ContextApi'
import GradientButton from '../component/GradientButton'
import { showToast } from '../Helper/Helper'
import { SafeAreaView } from 'react-native-safe-area-context'

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
                showToast(response.msg || 'Registration successful! Please login.')
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

    const renderInput = (icon, placeholder, fieldName, secure = false, showToggle = false, showState = null, setShowState = null, keyboardType = 'default') => (
        <>
            <View style={styles.inputContainer}>
                {icon}
                <Controller
                    control={control}
                    name={fieldName}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={[styles.input, showToggle ? { paddingRight: 40 } : {}]}
                            placeholder={placeholder}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            placeholderTextColor="#999"
                            secureTextEntry={secure && !showState}
                            keyboardType={keyboardType}
                        />
                    )}
                />
                {showToggle && (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => setShowState(!showState)} style={styles.eyeIcon}>
                        {showState ? <EyeOff size={24} color="#666" /> : <Eye size={24} color="#666" />}
                    </TouchableOpacity>
                )}
            </View>
            {errors[fieldName] && <Text style={styles.errorText}>{errors[fieldName].message}</Text>}
        </>
    )

    return (
        <SafeAreaView edges={['bottom']} style={styles.container}>
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
                        {renderInput(<School size={24} color="#666" style={styles.icon} />, 'Tuition Name', 'tuition_name')}
                        {renderInput(<User size={24} color="#666" style={styles.icon} />, 'Your Name', 'admin_name')}
                        {renderInput(<User size={24} color="#666" style={styles.icon} />, 'Username', 'username')}
                        {renderInput(<Mail size={24} color="#666" style={styles.icon} />, 'Email', 'email', false, false, null, null, 'email-address')}
                        {renderInput(<Phone size={24} color="#666" style={styles.icon} />, 'Mobile Number', 'mobile', false, false, null, null, 'phone-pad')}
                        {renderInput(<MapPin size={24} color="#666" style={styles.icon} />, 'Address', 'address')}
                        {renderInput(<Lock size={24} color="#666" style={styles.icon} />, 'Password', 'password', true, true, showPassword, setShowPassword)}
                        {renderInput(<Lock size={24} color="#666" style={styles.icon} />, 'Confirm Password', 'confirm_password', true, true, showConfirmPassword, setShowConfirmPassword)}

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
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        marginTop: 12
    },
    heading: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4, color: '#111' },
    subHeading: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
    errorBox: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderColor: '#dc2626',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    errorText: { color: '#dc2626', fontSize: 14, marginBottom: 5 },
    form: { paddingVertical: 10 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        height: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: { marginRight: 10 },
    input: { flex: 1, color: '#333', fontSize: 14 },
    eyeIcon: { padding: 5 },
    loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    loginPrompt: { color: '#666', fontSize: 14 },
    loginLink: { color: '#2575fc', fontSize: 14, fontWeight: '600', marginLeft: 4 },
})

export default Signup
