import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { User, Settings, LogOut, Edit, Shield, Mail, Building2, ChevronRight } from 'lucide-react-native'
import { Header } from '../Components/Header'
import { useLogout } from '../Helper/Auth'
import { ucFirst } from '../Helper/Helper'
import { BottomNavigation } from './navigation/BottomNavigation'

const Profile = () => {
  const navigation = useNavigation()
  const logout = useLogout()
  const user = useSelector((state) => state.auth.user)
  const tuitionInfo = useSelector((state) => state.auth.tuitionInfo)

  const handleEditProfile = () => {
    navigation.navigate('EditProfile')
  }

  const handleSettings = () => {
    navigation.navigate('Settings')
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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
        </View>

        {/* App Info */}
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={styles.appInfo}>Version 1.0.0</Text>
          <Text style={[styles.appInfo, { color: '#9ca3af' }]}>© 2025 TuitionPe</Text>
        </View>
      </ScrollView>
      <BottomNavigation />
    </View>
  )
}

export default Profile

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  scrollContent: {
    padding: 16,
    // paddingBottom: 100
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827'
  },
  userSub: {
    color: '#4b5563',
    fontSize: 14
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
    marginRight: 4
  },
  onlineText: {
    fontSize: 12,
    color: '#6b7280'
  },
  roleBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  roleText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  label: {
    fontSize: 12,
    color: '#6b7280'
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    fontWeight: 'bold'
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  appInfo: {
    fontSize: 12,
    color: '#6b7280'
  }
})
