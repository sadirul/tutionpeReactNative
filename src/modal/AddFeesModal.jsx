import React, { useState } from "react"
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions
} from "react-native"
import * as Yup from "yup"
import YearDropdown from "../component/YearDropdown"
import MonthDropdown from "../component/MonthDropdown"
import { X } from "lucide-react-native" // 👈 close icon

const AddFeesModal = ({ isOpen, closeModal, handleAddFee }) => {
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        month: "",
        isPaid: false,
    })

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Validation schema
    const validationSchema = Yup.object().shape({
        year: Yup.string()
            .required("Year is required")
            .matches(/^\d{4}$/, "Year must be a valid 4-digit number"),
        month: Yup.string().required("Month is required"),
        isPaid: Yup.boolean().required("Payment status is required"),
    })

    const validateForm = async () => {
        try {
            await validationSchema.validate(formData, { abortEarly: false })
            setErrors({})
            return true
        } catch (err) {
            const newErrors = {}
            err.inner.forEach((error) => {
                newErrors[error.path] = error.message
            })
            setErrors(newErrors)
            return false
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)

        const isValid = await validateForm()
        if (!isValid) {
            setIsSubmitting(false)
            return
        }

        try {
            const yearMonth = `${formData.month} ${formData.year}`
            await handleAddFee({
                year_month: yearMonth,
                is_paid: formData.isPaid,
            })
            closeModal()
        } catch (error) {
            console.error("Error adding fee:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            transparent
            visible={isOpen}
            animationType="slide"
            onRequestClose={closeModal}
        >
            <View style={styles.backdrop}>
                <View style={styles.modalContainer}>
                    {/* Close Button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
                        <X size={22} color="#333" />
                    </TouchableOpacity>

                    {/* Title */}
                    <Text style={styles.title}>Add New Fee</Text>

                    {/* Year Picker */}
                    <Text style={styles.label}>Year *</Text>
                    <YearDropdown
                        label="Select Year"
                        value={formData.year}
                        onChange={(value) =>
                            setFormData((prev) => ({ ...prev, year: value }))
                        }
                        error={errors.year}
                    />

                    {/* Month Picker */}
                    <Text style={styles.label}>Month *</Text>
                    <MonthDropdown
                        label="Select Month"
                        value={formData.month}
                        onChange={(value) =>
                            setFormData((prev) => ({ ...prev, month: value }))
                        }
                        error={errors.month}
                    />

                    {/* Payment Status */}
                    <Text style={styles.label}>Payment Status *</Text>
                    <View style={styles.statusRow}>
                        <TouchableOpacity
                            style={[
                                styles.statusBtn,
                                formData.isPaid && styles.statusBtnActivePaid,
                            ]}
                            disabled={isSubmitting}
                            onPress={() =>
                                setFormData((prev) => ({ ...prev, isPaid: true }))
                            }
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    formData.isPaid && styles.statusTextActivePaid,
                                ]}
                            >
                                Paid
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.statusBtn,
                                !formData.isPaid && styles.statusBtnActiveDue,
                            ]}
                            disabled={isSubmitting}
                            onPress={() =>
                                setFormData((prev) => ({ ...prev, isPaid: false }))
                            }
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    !formData.isPaid && styles.statusTextActiveDue,
                                ]}
                            >
                                Due
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {errors.isPaid && <Text style={styles.error}>{errors.isPaid}</Text>}

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.btn, styles.cancelBtn]}
                            disabled={isSubmitting}
                            onPress={closeModal}
                        >
                            <Text style={styles.cancelText}>CANCEL</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, styles.confirmBtn]}
                            disabled={isSubmitting}
                            onPress={handleSubmit}
                        >
                            {isSubmitting ? (
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <ActivityIndicator color="white" />
                                    <Text style={[styles.confirmText, { marginLeft: 8 }]}>
                                        ADDING
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.confirmText}>CONFIRM</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        // minHeight: Dimensions.get("window").height * 0.6,
    },
    closeBtn: {
        position: "absolute",
        right: 15,
        top: 15,
        zIndex: 10,
        padding: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
        color: "#111",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    error: {
        color: "red",
        fontSize: 12,
        marginBottom: 10,
    },
    statusRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 15,
    },
    statusBtn: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: "center",
        borderColor: "#ccc",
    },
    statusBtnActivePaid: {
        backgroundColor: "#d1fae5",
        borderColor: "#10b981",
    },
    statusBtnActiveDue: {
        backgroundColor: "#ffe4c4",
        borderColor: "#f97316",
    },
    statusText: {
        fontSize: 14,
        color: "#555",
        fontWeight: "500",
    },
    statusTextActivePaid: {
        color: "#065f46",
    },
    statusTextActiveDue: {
        color: "#9a3412",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 20,
    },
    btn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    cancelBtn: {
        backgroundColor: "#f3f4f6",
    },
    confirmBtn: {
        backgroundColor: "#2563eb",
    },
    cancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
    },
    confirmText: {
        fontSize: 14,
        fontWeight: "600",
        color: "white",
    },
})

export default AddFeesModal
