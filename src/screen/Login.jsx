import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'
import { useNavigation } from '@react-navigation/native'
import { useDispatch } from 'react-redux'
import { useHttpRequest } from '../ContextApi/ContextApi'
import { login } from '../redux/slice/authSlice'
import { setStorage, ucFirst } from '../Helper/Helper'
import GradientButton from '../component/GradientButton'

// Validation schema
const validationSchema = Yup.object().shape({
    username: Yup.string()
        .required('Username is required')
        .min(4, 'Username must be at least 4 characters'),
    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
})

const LoginScreen = () => {
    const [secureText, setSecureText] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loginError, setLoginError] = useState('')

    const navigation = useNavigation()
    const dispatch = useDispatch()
    const { httpRequest } = useHttpRequest()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
    })

    // Full API + Redux login
    const onSubmit = async (data) => {
        setIsSubmitting(true)
        setLoginError('')

        try {
            const response = await httpRequest('/login', {
                method: 'POST',
                data: {
                    username: data.username,
                    password: data.password,
                },
            })

            if (response.status === 'success') {
                await setStorage(
                    'access_token',
                    `${ucFirst(response.token_type)} ${response.access_token}`
                )

                dispatch(
                    login({
                        user: response.data,
                        studentInfo: response.data.student_info,
                        tuitionInfo: response.data.tuition,
                        token: `${ucFirst(response.token_type)} ${response.access_token}`,
                    })
                )
            } else {
                setLoginError(response.msg || 'Invalid username or password')
            }
        } catch (error) {
            console.error(error)
            setLoginError('Something went wrong. Please try again.')
        }

        setIsSubmitting(false)
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Logo Box */}
            <View style={styles.logoBox}>
                <MaterialCommunityIcons name="account" size={50} color="white" />
            </View>

            <Text style={styles.title}>Welcome Back!</Text>

            {/* Error message */}
            {/* Error Message Box */}
            {loginError ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{loginError}</Text>
                </View>
            ) : null}


            {/* Username */}
            <View style={styles.inputContainer}>
                <Icon name="person" size={24} color="#666" style={styles.icon} />
                <Controller
                    control={control}
                    name="username"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            value={value}
                            onChangeText={onChange}
                            placeholderTextColor="#999"
                        />
                    )}
                />
            </View>
            {errors.username && (
                <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 10 }}>
                    {errors.username.message}
                </Text>
            )}

            {/* Password */}
            <View style={styles.inputContainer}>
                <Icon name="lock" size={24} color="#666" style={styles.icon} />
                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={value}
                            onChangeText={onChange}
                            secureTextEntry={secureText}
                            placeholderTextColor="#999"
                        />
                    )}
                />
                <TouchableOpacity activeOpacity={0.7}
                    onPress={() => setSecureText(!secureText)}
                    style={styles.eyeIcon}
                >
                    <Icon
                        name={secureText ? 'visibility-off' : 'visibility'}
                        size={24}
                        color="#666"
                    />
                </TouchableOpacity>
            </View>
            {errors.password && (
                <Text style={{ color: 'red', alignSelf: 'flex-start', marginBottom: 10 }}>
                    {errors.password.message}
                </Text>
            )}

            {/* Forgot Password */}
            <TouchableOpacity activeOpacity={0.7} style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <GradientButton
                onPress={handleSubmit(onSubmit)}
                text="Sign In"
                loading={isSubmitting}
                colors={['#6a11cb', '#2575fc']}
            />

            {/* Signup Link */}
            <View style={styles.signupContainer}>
                <Text style={{ color: '#666' }}>Don't have an account? </Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Signup')}>
                    <Text style={{ color: '#2575fc', fontWeight: 'bold' }}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f6ff',
        padding: 20,
        justifyContent: 'center',
    },
    logoBox: {
        backgroundColor: '#2575fc',
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        marginRight: 5,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#333',
    },
    eyeIcon: {
        padding: 5,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 5,
    },
    forgotText: {
        color: '#2575fc',
        fontWeight: '500',
    },
    signInBtn: {
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    signInText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
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
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: '500',
    }

})
