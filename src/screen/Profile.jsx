import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import {
  User,
  Settings,
  LogOut,
  Edit,
  Shield,
  Mail,
  Building2,
  Trash2,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react-native'
import { Header } from '../Components/Header'
import { useLogout } from '../Helper/Auth'
import { showToast, ucFirst } from '../Helper/Helper'
import { BottomNavigation } from './navigation/BottomNavigation'
import { useHttpRequest } from '../ContextApi/ContextApi'

const Profile = () => {
  const navigation = useNavigation()
  const logout = useLogout()
  const user = useSelector((state) => state.auth.user)
  const tuitionInfo = useSelector((state) => state.auth.tuitionInfo)
  const { httpRequest } = useHttpRequest()

  const [modalVisible, setModalVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEditProfile = () => {
    navigation.navigate('EditProfile')
  }

  const handleSettings = () => {
    navigation.navigate('Settings')
  }

  const handleDeleteAccount = async () => {
    if (!password) {
      showToast('Please enter your password')
      return
    }
    setLoading(true)
    try {
      const response = await httpRequest("/account/delete", {
        method: "POST",
        data: {
          password
        },
      });
      console.log(response);

      if (response?.status === 'success') {
        showToast(response?.msg || 'Account deleted successfully')
        setModalVisible(false)
        setPassword('')
        logout()
      } else {
        showToast(response?.msg || 'Failed to delete account')
      }
    } catch (err) {
      console.error(err)
      showToast('Something went wrong')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <User size={32} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userSub}>School Administrator</Text>
              <View style={styles.onlineRow}>
                <View style={styles.dot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{ucFirst(user?.role)}</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#fee2e2' }]}>
              <Mail size={16} color="#dc2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#f3e8ff' }]}>
              <Shield size={16} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{ucFirst(user?.role)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.iconWrap, { backgroundColor: '#dcfce7' }]}>
              <Building2 size={16} color="#16a34a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>School/Coaching</Text>
              <Text style={styles.value}>{tuitionInfo?.tuition_name}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.actionRow} activeOpacity={0.7} onPress={handleEditProfile}>
            <View style={[styles.iconWrap, { backgroundColor: '#dbeafe' }]}>
              <Edit size={16} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.value}>Edit Profile</Text>
              <Text style={styles.label}>Update your information</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} style={styles.actionRow} onPress={handleSettings}>
            <View style={[styles.iconWrap, { backgroundColor: '#f3f4f6' }]}>
              <Settings size={16} color="#374151" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.value}>Settings</Text>
              <Text style={styles.label}>Preferences and security</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>

          {/* Sign Out */}
          <TouchableOpacity activeOpacity={0.7} style={styles.actionRow} onPress={handleLogout}>
            <View style={[styles.iconWrap, { backgroundColor: '#fee2e2' }]}>
              <LogOut size={16} color="#dc2626" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.value, { color: '#dc2626' }]}>Sign Out</Text>
              <Text style={[styles.label, { color: '#ef4444' }]}>Sign out from your account</Text>
            </View>
            <ChevronRight size={20} color="#f87171" />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Delete Account */}
          <TouchableOpacity activeOpacity={0.7} style={styles.actionRow} onPress={() => setModalVisible(true)}>
            <View style={[styles.iconWrap, { backgroundColor: '#fee2e2' }]}>
              <Trash2 size={16} color="#b91c1c" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.value, { color: '#b91c1c' }]}>Delete Account</Text>
              <Text style={[styles.label, { color: '#dc2626' }]}>Permanently delete your account</Text>
            </View>
            <ChevronRight size={20} color="#f87171" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={styles.appInfo}>Version 1.0.0</Text>
          <Text style={[styles.appInfo, { color: '#9ca3af' }]}>© 2025 TuitionPe</Text>
        </View>
      </ScrollView>

      <BottomNavigation />

      {/* Delete Account Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <AlertTriangle size={24} color="#dc2626" />
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalSubtitle}>
              This action cannot be undone. All your data will be permanently deleted.
            </Text>
            
            <View style={styles.warningBox}>
              <View style={styles.warningIcon}>
                <AlertTriangle size={16} color="#b91c1c" />
              </View>
              <Text style={styles.warningText}>
                You'll need to enter your password to confirm this action
              </Text>
            </View>
            
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Trash2 size={16} color="white" />
                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  )
}

export default Profile

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  userSub: { color: '#4b5563', fontSize: 14 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginRight: 4 },
  onlineText: { fontSize: 12, color: '#6b7280' },
  roleBadge: { backgroundColor: '#dbeafe', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  roleText: { fontSize: 12, color: '#2563eb', fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  label: { fontSize: 12, color: '#6b7280' },
  value: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  appInfo: { fontSize: 12, color: '#6b7280' },
   modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#b91c1c',
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#dc2626',
  },
  deleteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  
})
