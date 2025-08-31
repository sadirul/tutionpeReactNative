import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const DashboardStatCard = ({
  title,
  value,
  subtitle,
  subtitleColor = 'gray',
  loading = false,
  iconName = 'account',
  iconColor = '#2563EB',
  iconBg = '#DBEAFE',
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Top Right Icon */}
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={iconName} size={18} color={iconColor} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Value */}
        <Text
          style={[
            styles.value,
            loading && { fontSize: 22 }  // only apply when not loading
          ]}
        >
          {loading ? '...' : value}
        </Text>

        {/* Subtitle */}
        <Text
          style={[styles.subtitle, { color: subtitleColor }]}
          onPress={onPress}
        >
          {subtitle}
          {onPress && ' >'}
        </Text>

      </View>
    </TouchableOpacity>
  )
}

export default DashboardStatCard

// ----------------- Styles -----------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexBasis: '48%',
    marginBottom: 12,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flexShrink: 1,
    flexWrap: 'wrap',
    paddingRight: 40,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
})
