import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { ucFirst } from '../Helper/Helper'

const GenderDropdown = ({
  label = 'Select Gender',
  items = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ],
  value = '',
  onChange,
  error,
  disabled,
}) => {
  const [visible, setVisible] = useState(false)

  const selectItem = (val) => {
    onChange(val)
    setVisible(false)
  }

  // find label for current value
  const selectedItem = items.find(i => i.value === value)

  return (
    <View style={{ marginVertical: 8 }}>
      {/* Trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => setVisible(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 12,
          backgroundColor: disabled ? '#f3f4f6' : '#fff',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Text style={{ color: selectedItem ? '#374151' : '#9ca3af', fontSize: 14 }}>
          {selectedItem ? ucFirst(selectedItem.label) : label}
        </Text>
        <Icon name="chevron-down" size={18} color="#9ca3af" />
      </TouchableOpacity>

      {error && (
        <Text style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}

      {/* Modal */}
      <Modal visible={visible} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '70%',
            }}
          >
            {/* Header */}
            <View
              style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#e5e7eb',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                {label}
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setVisible(false)}>
                <Icon name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Items */}
            <FlatList
              data={items}
              keyExtractor={(item, i) => `${item.value}-${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => selectItem(item.value)}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: item.value === value ? '#2563eb' : '#374151',
                      fontWeight: item.value === value ? '600' : '400',
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default GenderDropdown
