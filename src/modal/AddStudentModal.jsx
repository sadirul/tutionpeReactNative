import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Dimensions,
} from "react-native"
import Modal from "react-native-modal"
import { UserPlus, X } from "lucide-react-native"
import { useHttpRequest } from "../ContextApi/ContextApi"
import * as Yup from "yup"
import { showToast, ucFirst } from '../Helper/Helper'
import ClassDropdown from "../component/ClassDropdown"
import GenderDropdown from "../component/GenderDropdown"

const { width: screenWidth } = Dimensions.get("window")

const AddStudentModal = ({ isOpen, closeModal }) => {
    const [classes, setClasses] = useState([])
    const { httpRequest } = useHttpRequest()
    const [loading, setLoading] = useState(false)
    const [dropdownVisible, setDropdownVisible] = useState({ class: false, gender: false })
    const [form, setForm] = useState({
        name: "",
        class: "",
        gender: "",
        monthlyFees: "",
        mobile: "",
        email: "",
        address: "",
        guardianName: "",
        guardianMobile: "",
    })
    const [errors, setErrors] = useState({})

    const genderOptions = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
    ]

    const validationSchema = Yup.object().shape({
        name: Yup.string().required("Student name is required"),
        class: Yup.string().required("Class is required"),
        gender: Yup.string()
            .required("Gender is required")
            .oneOf(["male", "female", "other"], "Invalid gender"),
        monthlyFees: Yup.number()
            .required("Monthly fee is required")
            .positive("Fee must be positive")
            .typeError("Fee must be a number"),
        mobile: Yup.string()
            .required("Mobile number is required")
            .matches(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number"),
        email: Yup.string().email("Enter a valid email").notRequired(),
        address: Yup.string().required("Address is required"),
        guardianName: Yup.string().required("Guardian name is required"),
        guardianMobile: Yup.string()
            .required("Guardian mobile number is required")
            .matches(/^[0-9]{10}$/, "Enter a valid 10-digit guardian mobile number"),
    })

    const fetchClasses = async () => {
        setLoading(true)
        try {
            const response = await httpRequest("/class/index")
            if (response.status === "success") setClasses(response.data || [])
        } catch (err) {
            console.error(err)
            showToast("Failed to fetch classes")
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchClasses()
    }, [])

    const handleSubmit = async () => {
        try {
            await validationSchema.validate(form, { abortEarly: false })
            setErrors({})
            setLoading(true)
            const response = await httpRequest("/student/store", { method: "POST", data: form })

            showToast(response.msg) // Success toast
            if (response.status === "success") {
                setForm({
                    name: "",
                    class: "",
                    gender: "",
                    monthlyFees: "",
                    mobile: "",
                    email: "",
                    address: "",
                    guardianName: "",
                    guardianMobile: "",
                })
                closeModal()
            }
            setLoading(false)
        } catch (err) {
            if (err.inner) {
                const newErrors = {}
                err.inner.forEach(e => (newErrors[e.path] = e.message))
                setErrors(newErrors)
                // Show first validation error as toast
                if (err.inner[0]) showToast(err.inner[0].message)
            } else {
                showToast("Something went wrong")
            }
            setLoading(false)
        }
    }

    const openDropdown = field => setDropdownVisible({ ...dropdownVisible, [field]: true })
    const closeDropdown = field => setDropdownVisible({ ...dropdownVisible, [field]: false })
    const selectOption = (field, value) => {
        setForm({ ...form, [field]: value })
        closeDropdown(field)
    }

    const getClassLabel = uuid => {
        const cls = classes.find(c => c.uuid === uuid)
        return cls ? cls.class_name : "Select class"
    }

    return (
        <Modal
            isVisible={isOpen}
            onBackdropPress={closeModal}
            swipeDirection="down"
            onSwipeComplete={closeModal}
            style={styles.modal}
            propagateSwipe
        >
            <View style={styles.sheet}>
                <View style={styles.handle} />
                <View style={styles.header}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <UserPlus size={20} color="#2563eb" />
                        <Text style={styles.title}>Add Student</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} onPress={closeModal}>
                        <X size={22} color="#666" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {/* Name */}
                    <Text style={styles.label}>Student Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter full name"
                        value={form.name}
                        onChangeText={val => setForm({ ...form, name: val })}
                        editable={!loading}
                    />
                    {errors.name && <Text style={styles.error}>{errors.name}</Text>}

                    <Text style={styles.label}>Class</Text>
                    <View style={{ marginHorizontal: 16 }}>
                        <ClassDropdown
                            label="Select Class"
                            items={classes.map(c => ({ label: c.class_name, value: c.uuid }))}
                            value={form.class}   // stores uuid
                            onChange={(val) => setForm({ ...form, class: val })} // val is uuid
                            error={errors.class}
                            disabled={loading || classes.length === 0}
                        />
                    </View>

                    <Text style={styles.label}>Gender</Text>
                    <View style={{ marginHorizontal: 16 }}>
                        <GenderDropdown
                            label="Select Gender"
                            value={form.gender}
                            onChange={val => setForm({ ...form, gender: val })}
                            error={errors.gender}
                            disabled={loading}
                        />
                    </View>

                    {/* Other Inputs */}
                    <Text style={styles.label}>Monthly Fees</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter monthly fees"
                        keyboardType="numeric"
                        value={form.monthlyFees}
                        onChangeText={val => setForm({ ...form, monthlyFees: val.replace(/\D/g, "") })}
                    />
                    {errors.monthlyFees && <Text style={styles.error}>{errors.monthlyFees}</Text>}

                    <Text style={styles.label}>Mobile</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="9876543210"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={form.mobile}
                        onChangeText={val => setForm({ ...form, mobile: val.replace(/\D/g, "").slice(0, 10) })}
                    />
                    {errors.mobile && <Text style={styles.error}>{errors.mobile}</Text>}

                    {/* Email */}
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter email (optional)"
                        keyboardType="email-address"
                        value={form.email}
                        onChangeText={val => setForm({ ...form, email: val })}
                    />
                    {errors.email && <Text style={styles.error}>{errors.email}</Text>}

                    {/* Address */}
                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                        placeholder="Enter address"
                        value={form.address}
                        onChangeText={val => setForm({ ...form, address: val })}
                        editable={!loading}
                        multiline={true}
                    />
                    {errors.address && <Text style={styles.error}>{errors.address}</Text>}

                    {/* Guardian Name */}
                    <Text style={styles.label}>Guardian Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter guardian's full name"
                        value={form.guardianName}
                        onChangeText={val => setForm({ ...form, guardianName: val })}
                        editable={!loading}
                    />
                    {errors.guardianName && <Text style={styles.error}>{errors.guardianName}</Text>}

                    {/* Guardian Mobile */}
                    <Text style={styles.label}>Guardian Mobile</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter guardian mobile number"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={form.guardianMobile}
                        onChangeText={val => setForm({ ...form, guardianMobile: val.replace(/\D/g, "").slice(0, 10) })}
                        editable={!loading}
                    />
                    {errors.guardianMobile && <Text style={styles.error}>{errors.guardianMobile}</Text>}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity activeOpacity={0.7} style={[styles.btn, styles.cancelBtn]} onPress={closeModal}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} style={[styles.btn, styles.saveBtn]} onPress={handleSubmit} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Student</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export default AddStudentModal

const styles = StyleSheet.create({
    modal: { justifyContent: "flex-end", margin: 0 },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
        paddingBottom: 10,
    },
    handle: { width: 50, height: 5, backgroundColor: "#ccc", borderRadius: 3, alignSelf: "center", marginVertical: 8 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
    title: { fontSize: 18, fontWeight: "600", color: "#111" },
    label: { fontSize: 14, fontWeight: "500", marginTop: 12, marginHorizontal: 15, color: "#333" },
    input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, height: 45, marginHorizontal: 15, marginTop: 5, paddingHorizontal: 12, justifyContent: "center" },
    dropdownText: { fontSize: 15, color: "#333" },
    error: { color: "red", fontSize: 12, marginLeft: 15, marginTop: 2 },
    footer: { flexDirection: "row", justifyContent: "space-between", gap: 10, paddingHorizontal: 15, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#eee" },
    btn: { flex: 1, height: 45, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    cancelBtn: { backgroundColor: "#f3f4f6" },
    cancelText: { color: "#333", fontWeight: "500" },
    saveBtn: { backgroundColor: "#2563eb" },
    saveText: { color: "#fff", fontWeight: "600" },

    dropdownContainer: { backgroundColor: "#fff", borderRadius: 10, width: "85%", maxHeight: "60%", alignSelf: "center" },
    dropdownHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee", backgroundColor: "#f8f9fa", borderTopLeftRadius: 10, borderTopRightRadius: 10 },
    dropdownHeaderText: { fontSize: 16, fontWeight: "600", color: "#111" },
    dropdownCloseBtn: { padding: 4, borderRadius: 6, backgroundColor: "#e9ecef" },
    dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#f1f3f4" },
    dropdownItemText: { fontSize: 15, color: "#333" },
})
