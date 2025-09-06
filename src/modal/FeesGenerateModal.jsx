import React, { useState } from 'react'
import { View, Text, Modal, Pressable, ActivityIndicator, TouchableOpacity, Switch, StyleSheet } from 'react-native'
import { showToast } from '../Helper/Helper'
import { useHttpRequest } from '../ContextApi/ContextApi'

const FeesGenerateModal = ({ showFeeModal, setShowFeeModal, fetchDashboard }) => {
    const [generatingFees, setGeneratingFees] = useState(false)
    const [includeCurrentMonth, setIncludeCurrentMonth] = useState(false)
    const { httpRequest } = useHttpRequest()

    // 📌 get previous month dynamically
    const getPreviousMonth = () => {
        const now = new Date()
        now.setMonth(now.getMonth() - 1)
        return now.toLocaleString('default', { month: 'long', year: 'numeric' })
    }

    const handleGenerateFees = async () => {
        setGeneratingFees(true)
        try {
            const response = await httpRequest(`/generate-fees?exceptThisMonth=${!includeCurrentMonth}`)
            if (response?.status === 'success') {
                setIncludeCurrentMonth(false)
                await fetchDashboard()
                showToast(response?.msg || 'Fees generated successfully!')
                setShowFeeModal(false)
            } else {
                showToast(response?.msg || 'Failed to generate fees')
            }
        } catch (err) {
            console.error(err)
            showToast('Something went wrong while generating fees')
        }
        setGeneratingFees(false)
    }

    return (
        <Modal
            visible={showFeeModal}
            transparent
            animationType="slide"
            onRequestClose={() => !generatingFees && setShowFeeModal(false)}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={() => !generatingFees && setShowFeeModal(false)}
                        disabled={generatingFees}
                    >
                        <Text style={{ fontSize: 18, color: '#666' }}>✕</Text>
                    </TouchableOpacity>

                    {/* Icon */}
                    <View style={styles.iconCircle}>
                        <Text style={{ fontSize: 26, color: '#E67E22' }}>⚠️</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Generate Fees</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        Are you sure you want to generate fees for {getPreviousMonth()}?
                    </Text>

                    {/* Checkbox / Switch */}
                    <View style={styles.switchRow}>
                        <Switch
                            value={includeCurrentMonth}
                            onValueChange={setIncludeCurrentMonth}
                            trackColor={{ false: '#ccc', true: '#4f46e5' }}
                            thumbColor={includeCurrentMonth ? '#fff' : '#fff'}
                        />
                        <Text style={styles.switchLabel}>
                            Include current month's admission students
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <Pressable
                            style={[styles.btn, styles.cancelBtn]}
                            onPress={() => setShowFeeModal(false)}
                            disabled={generatingFees}
                        >
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.btn, styles.generateBtn, generatingFees && { backgroundColor: '#60a5fa' }]}
                            onPress={handleGenerateFees}
                            disabled={generatingFees}
                        >
                            {generatingFees ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.generateText}>GENERATING</Text>
                                </View>
                            ) : (
                                <Text style={styles.generateText}>GENERATE</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        elevation: 10
    },
    closeBtn: {
        position: 'absolute',
        top: 15,
        right: 15,
        padding: 5
    },
    iconCircle: {
        alignSelf: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fde68a',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 10
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginVertical: 15,
        color: '#333'
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    switchLabel: {
        fontSize: 14,
        color: '#444'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10
    },
    btn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginLeft: 10
    },
    cancelBtn: {
        backgroundColor: '#f3f4f6'
    },
    cancelText: {
        color: '#2563eb',
        fontWeight: '600'
    },
    generateBtn: {
        backgroundColor: '#2563eb'
    },
    generateText: {
        color: '#fff',
        fontWeight: '600'
    }
})

export default FeesGenerateModal
