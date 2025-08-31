import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Lock, Wallet, Save, Key } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useHttpRequest } from '../ContextApi/ContextApi';
import * as Yup from 'yup';
import { login } from '../redux/slice/authSlice';
import { Header } from '../Components/Header';
import { BottomNavigation } from './navigation/BottomNavigation';
import { showToast } from '../Helper/Helper';
import FloatingLabelInput from '../component/FloatingLabelInput';

const Settings = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const { httpRequest } = useHttpRequest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpiSubmitting, setIsUpiSubmitting] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  // Form values state
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    upiId: user?.upi_id || '',
  });
  const [errors, setErrors] = useState({});

  // Yup Validation Schema
  const validationSchema = Yup.object({
    oldPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
    upiId: Yup.string().nullable(),
  });

  // Handle input change
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Password Update Submit
  const handlePasswordSubmit = async () => {
    try {
      await validationSchema.validate(form, { abortEarly: false });
      setErrors({});
      setIsSubmitting(true);

      const response = await httpRequest('/password/update', {
        method: 'POST',
        data: {
          password: form.oldPassword,
          new_password: form.newPassword,
          confirm_password: form.confirmPassword,
        },
      });

      if (response.status === 'success') {
        setForm({ ...form, oldPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password updated successfully!');
      } else {
        showToast(response.msg || 'Failed to update password!');
      }
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        showToast('Validation failed!');
      }
    }
    setIsSubmitting(false);
  };

  // Handle UPI Save
  const handleUpiSave = async () => {
    try {
      setIsUpiSubmitting(true);
      const response = await httpRequest('/profile/update', {
        method: 'PUT',
        data: { upi_id: form.upiId },
      });

      if (response.status === 'success') {
        showToast('UPI ID updated successfully!');
        dispatch(login({ user: response.data }));
      } else {
        showToast(response.msg || 'Failed to update UPI ID!');
      }
    } catch (error) {
      console.error(error);
      showToast('Something went wrong. Please try again!');
    }
    setIsUpiSubmitting(false);
  };

  const handleFocus = (fieldName) => setFocusedField(fieldName);
  const handleBlur = () => setFocusedField('');

  return (
    <View style={styles.container}>
      <Header title="Settings" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Change Password */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Key size={20} color="#2563EB" />
            <Text style={styles.cardTitle}>Change Password</Text>
          </View>

          <FloatingLabelInput
            field="oldPassword"
            value={form.oldPassword}
            setValue={(value) => handleChange('oldPassword', value)}
            label="Current Password"
            icon={<Lock size={20} color="#6B7280" />}
            showPassword={showOldPassword}
            toggleSecure={() => setShowOldPassword(!showOldPassword)}
            error={errors.oldPassword}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <FloatingLabelInput
            field="newPassword"
            value={form.newPassword}
            setValue={(value) => handleChange('newPassword', value)}
            label="New Password"
            icon={<Lock size={20} color="#6B7280" />}
            showPassword={showNewPassword}
            toggleSecure={() => setShowNewPassword(!showNewPassword)}
            error={errors.newPassword}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <FloatingLabelInput
            field="confirmPassword"
            value={form.confirmPassword}
            setValue={(value) => handleChange('confirmPassword', value)}
            label="Confirm New Password"
            icon={<Lock size={20} color="#6B7280" />}
            showPassword={showConfirmPassword}
            toggleSecure={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handlePasswordSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitText}>Update Password</Text>
                <Save size={20} color="#fff" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Payment Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Wallet size={20} color="#16A34A" />
            <Text style={styles.cardTitle}>Payment Settings</Text>
          </View>

          <FloatingLabelInput
            field="upiId"
            value={form.upiId}
            setValue={(value) => handleChange('upiId', value)}
            label="UPI ID"
            icon={<Wallet size={20} color="#6B7280" />}
            error={errors.upiId}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.submitBtn, { backgroundColor: '#16A34A' }]}
            onPress={handleUpiSave}
            disabled={isUpiSubmitting}
          >
            {isUpiSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitText}>Save UPI ID</Text>
                <Save size={20} color="#fff" style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 16, },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 8 },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    marginTop: 12,
  },
  submitBtnDisabled: { backgroundColor: '#60A5FA' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});