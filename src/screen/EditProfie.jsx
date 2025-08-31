import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { UserCog, Camera, Save } from 'lucide-react-native'
import { useSelector, useDispatch } from 'react-redux'
import * as Yup from 'yup'
import { useHttpRequest } from '../ContextApi/ContextApi'
import { login } from '../redux/slice/authSlice'
import { BottomNavigation } from './navigation/BottomNavigation'
import { Header } from '../Components/Header'
import { showToast } from '../Helper/Helper'
import FloatingLabelInput from '../component/FloatingLabelInput'


const EditProfile = () => {
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const { httpRequest } = useHttpRequest()

  const [focusedField, setFocusedField] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Form state
  const [tuitionName, setTuitionName] = useState(user?.tuition_name || '')
  const [name, setName] = useState(user?.name || '')
  const [mobile, setMobile] = useState(user?.mobile || '')
  const [email, setEmail] = useState(user?.email || '')
  const [address, setAddress] = useState(user?.address || '')

  // Yup Validation Schema
  const validationSchema = Yup.object({
    tuitionName: Yup.string().required('Tuition name is required'),
    name: Yup.string().required('Your name is required'),
    mobile: Yup.string()
      .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
      .required('Mobile number is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    address: Yup.string().required('Address is required'),
  })

  // Handle Submit
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrors({})

      // Validate with Yup
      await validationSchema.validate(
        { tuitionName, name, mobile, email, address },
        { abortEarly: false }
      )

      const response = await httpRequest('/profile/update', {
        method: 'PUT',
        data: {
          tuition_name: tuitionName,
          name,
          mobile,
          email,
          address,
        },
      })

      if (response.status === 'success') {
        dispatch(login({ user: response.data }))
        showToast('Profile updated successfully!')
      } else {
        showToast(response.msg || 'Failed to update profile!')
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        const formattedErrors = {}
        err.inner.forEach((e) => {
          formattedErrors[e.path] = e.message
        })
        setErrors(formattedErrors)
      } else {
        console.error(err)
        showToast('Something went wrong. Please try again!')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFocus = (field) => setFocusedField(field)
  const handleBlur = () => setFocusedField('')

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Picture */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarCircle}>
                <UserCog size={24} color="#fff" />
              </View>
              <TouchableOpacity activeOpacity={0.7} style={styles.cameraBtn}>
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.profileTitle}>Profile Photo</Text>
              <Text style={styles.profileSubtitle}>
                Tap camera icon to update
              </Text>
            </View>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formWrapper}>
          {/* Tuition Name */}
          <FloatingLabelInput
            field="tuitionName"
            value={tuitionName}
            setValue={setTuitionName}
            label="Tuition Name"
            error={errors.tuitionName}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Name */}
          <FloatingLabelInput
            field="name"
            value={name}
            setValue={setName}
            label="Your Name"
            error={errors.name}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Mobile */}
          <FloatingLabelInput
            field="mobile"
            value={mobile}
            setValue={setMobile}
            label="Mobile Number"
            keyboardType="phone-pad"
            error={errors.mobile}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Email */}
          <FloatingLabelInput
            field="email"
            value={email}
            setValue={setEmail}
            label="Email Address"
            keyboardType="email-address"
            error={errors.email}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Address */}
          <FloatingLabelInput
            field="address"
            value={address}
            setValue={setAddress}
            label="Address"
            isTextArea
            error={errors.address}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Save size={20} color="#fff" />
                <Text style={styles.submitText}>Update Profile</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Info Card */}
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              💡 <Text style={{ fontWeight: '600' }}>Tip:</Text> Keep your
              profile updated for better communication
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    // paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  profileSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  formWrapper: {
    marginTop: 8,
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    marginTop: 20,
  },
  submitBtnDisabled: {
    backgroundColor: '#60A5FA',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipCard: {
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    padding: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#1E40AF',
  },
})