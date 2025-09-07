import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    FlatList,
    StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import { User, X } from 'lucide-react-native';
import * as Yup from 'yup';
import { showToast, ucFirst } from '../Helper/Helper';
import ClassDropdown from '../component/ClassDropdown';
import CustomDropdown from '../component/GenderDropdown';
import GenderDropdown from '../component/GenderDropdown';

const studentSchema = Yup.object().shape({
    name: Yup.string().required('Student name is required'),
    class: Yup.string().required('Class is required'),
    gender: Yup.string().required('Gender is required'),
    monthlyFees: Yup.number()
        .typeError('Monthly Fee must be a number')
        .positive('Fee must be positive')
        .required('Monthly Fee is required'),
    mobile: Yup.string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit number'),
    email: Yup.string().email('Invalid email').nullable(),
    address: Yup.string().required('Address is required'),
    guardianName: Yup.string().required('Guardian name is required'),
    guardianMobile: Yup.string()
        .required('Guardian mobile is required')
        .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit number'),
});

const EditStudentModal = ({
    isOpen,
    closeModal,
    handleEditStudent,
    formData,
    handleInputChange,
    student,
    classes,
}) => {
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isValid, setIsValid] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [dropdownVisible, setDropdownVisible] = useState({ class: false, gender: false });

    const classOptions = useMemo(() => {
        return (classes || []).map((c) => ({
            uuid: c.uuid || c.id || '',
            label: c.class_name || c.title || '',
            fee: Number(c.fee) || 0,
        }));
    }, [classes]);

    // Initialize formData with student values when modal opens
    useEffect(() => {
        if (isOpen && student) {
            handleInputChange({ target: { name: 'class', value: student.class_uuid || '' } });
            handleInputChange({ target: { name: 'gender', value: student.gender || '' } });
            // Initialize other fields
            Object.keys(studentSchema.fields).forEach((field) => {
                if (field !== 'class' && field !== 'gender' && student[field]) {
                    handleInputChange({ target: { name: field, value: student[field] } });
                }
            });
        }
    }, [isOpen, student, handleInputChange]);

    useEffect(() => {
        const checkValidation = async () => {
            try {
                await studentSchema.validate(formData, { abortEarly: false });
                setIsValid(true);
                setErrors({});
            } catch (validationError) {
                setIsValid(false);
                const newErrors = {};
                if (validationError.inner) {
                    validationError.inner.forEach((err) => {
                        newErrors[err.path] = err.message;
                    });
                }
                setErrors(newErrors);
            }
        };

        checkValidation();

        if (student) {
            const changed = Object.keys(formData || {}).some(
                (key) => formData[key] !== (student[key] || '')
            );
            setIsDirty(changed);
        }
    }, [formData, student]);

    const onSave = async () => {
        setSaving(true);
        try {
            await handleEditStudent();
            closeModal();
        } catch (err) {
            showToast('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const getClassLabel = (uuid) => {
        const cls = classOptions.find((c) => c.uuid === uuid);
        return cls ? cls.label : 'Select class';
    };

    const openDropdown = (field) => setDropdownVisible({ ...dropdownVisible, [field]: true });
    const closeDropdown = (field) => setDropdownVisible({ ...dropdownVisible, [field]: false });
    const selectOption = (field, value) => {
        handleInputChange({ target: { name: field, value } });
        closeDropdown(field);
    };

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={styles.iconContainer}>
                            <User size={18} color="#16a34a" />
                        </View>
                        <Text style={styles.title}>Edit Student</Text>
                    </View>
                    <TouchableOpacity activeOpacity={0.7} onPress={closeModal}>
                        <X size={22} color="#666" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    {/* Name */}
                    <Text style={styles.label}>Student Name <Text style={styles.asteriskMark}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter full name"
                        value={formData.name || ''}
                        onChangeText={(val) => handleInputChange({ target: { name: 'name', value: val } })}
                        editable={!saving}
                    />
                    {errors.name && <Text style={styles.error}>{errors.name}</Text>}

                    {/* Class Dropdown */}
                    <Text style={styles.label}>Class <Text style={styles.asteriskMark}>*</Text></Text>
                    <View style={{ marginHorizontal: 16 }}>

                        <ClassDropdown
                            label="Select Class"
                            items={classOptions.map(c => ({ label: c.label, value: c.uuid }))}
                            value={formData.class} // stores uuid
                            onChange={(val) => {
                                // keep using selectOption for class
                                selectOption('class', val)

                                // update monthlyFees with handleInputChange
                                const selectedClass = classOptions.find(c => c.uuid === val)
                                console.log(selectedClass);

                                if (selectedClass.fee === undefined) return;
                                handleInputChange({
                                    target: {
                                        name: 'monthlyFees',
                                        value: selectedClass ? selectedClass.fee : ''
                                    },
                                })
                            }}
                            error={errors.class}
                            disabled={saving || classOptions.length === 0}
                        />

                    </View>


                    {/* Gender Dropdown */}
                    <Text style={styles.label}>Gender <Text style={styles.asteriskMark}>*</Text></Text>
                    <View style={{ marginHorizontal: 16 }}>
                        <GenderDropdown
                            label="Select Gender"
                            value={formData.gender}
                            onChange={(val) => selectOption('gender', val)}
                            error={errors.gender}
                            disabled={saving}
                        />
                    </View>

                    {/* Monthly Fees */}
                    <Text style={styles.label}>Monthly Fees <Text style={styles.asteriskMark}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter monthly fees"
                        keyboardType="numeric"
                        value={formData.monthlyFees?.toString() || ''}
                        onChangeText={(val) =>
                            handleInputChange({ target: { name: 'monthlyFees', value: val.replace(/\D/g, '') } })
                        }
                        editable={!saving}
                    />
                    {errors.monthlyFees && <Text style={styles.error}>{errors.monthlyFees}</Text>}

                    <Text style={styles.sectionTitle}>Contact Details</Text>

                    {/* Mobile */}
                    <Text style={styles.label}>Mobile Number <Text style={styles.asteriskMark}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="9876543210"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={formData.mobile || ''}
                        onChangeText={(val) =>
                            handleInputChange({ target: { name: 'mobile', value: val.replace(/\D/g, '').slice(0, 10) } })
                        }
                        editable={!saving}
                    />
                    {errors.mobile && <Text style={styles.error}>{errors.mobile}</Text>}

                    {/* Email */}
                    <Text style={styles.label}>Email (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="student@example.com"
                        keyboardType="email-address"
                        value={formData.email || ''}
                        onChangeText={(val) => handleInputChange({ target: { name: 'email', value: val } })}
                        editable={!saving}
                    />
                    {errors.email && <Text style={styles.error}>{errors.email}</Text>}

                    {/* Address */}
                    <Text style={styles.label}>Address <Text style={styles.asteriskMark}>*</Text></Text>
                    <TextInput
                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                        placeholder="Enter complete address"
                        value={formData.address || ''}
                        onChangeText={(val) => handleInputChange({ target: { name: 'address', value: val } })}
                        editable={!saving}
                        multiline
                    />
                    {errors.address && <Text style={styles.error}>{errors.address}</Text>}

                    <Text style={styles.sectionTitle}>Guardian Details </Text>

                    {/* Guardian Name */}
                    <Text style={styles.label}>Guardian Name <Text style={styles.asteriskMark}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter guardian's name"
                        value={formData.guardianName || ''}
                        onChangeText={(val) => handleInputChange({ target: { name: 'guardianName', value: val } })}
                        editable={!saving}
                    />
                    {errors.guardianName && <Text style={styles.error}>{errors.guardianName}</Text>}

                    {/* Guardian Mobile */}
                    <Text style={styles.label}>Guardian Mobile <Text style={styles.asteriskMark}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="9876543210"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={formData.guardianMobile || ''}
                        onChangeText={(val) =>
                            handleInputChange({ target: { name: 'guardianMobile', value: val.replace(/\D/g, '').slice(0, 10) } })
                        }
                        editable={!saving}
                    />
                    {errors.guardianMobile && <Text style={styles.error}>{errors.guardianMobile}</Text>}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.btn, styles.cancelBtn]}
                        onPress={closeModal}
                        disabled={saving}
                    >
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.btn, isValid && isDirty && !saving ? styles.saveBtn : styles.disabledBtn]}
                        onPress={onSave}
                        disabled={!isValid || !isDirty || saving}
                    >
                        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: { justifyContent: 'flex-end', margin: 0 },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        paddingBottom: 10,
    },
    handle: {
        width: 50,
        height: 5,
        backgroundoolor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginVertical: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        marginTop: 20,
        marginHorizontal: 15,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 12,
        marginHorizontal: 15,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        height: 45,
        marginHorizontal: 15,
        marginTop: 5,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    dropdownText: {
        fontSize: 15,
        color: '#333',
    },
    error: {
        color: 'red',
        fontSize: 12,
        marginLeft: 15,
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    btn: {
        flex: 1,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#f3f4f6',
    },
    cancelText: {
        color: '#333',
        fontWeight: '500',
    },
    saveBtn: {
        backgroundColor: '#16a34a',
    },
    disabledBtn: {
        backgroundColor: '#d1d5db',
    },
    saveText: {
        color: '#fff',
        fontWeight: '600',
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: '85%',
        maxHeight: '60%',
        alignSelf: 'center',
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#f8f9fa',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    dropdownHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
    },
    dropdownCloseBtn: {
        padding: 4,
        borderRadius: 6,
        backgroundColor: '#e9ecef',
    },
    dropdownItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f3f4',
    },
    dropdownItemText: {
        fontSize: 15,
        color: '#333',
    },
    asteriskMark: { color: 'red' }
});

export default EditStudentModal;