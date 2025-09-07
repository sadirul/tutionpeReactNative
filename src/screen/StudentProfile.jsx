import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
    Linking,
    SafeAreaView,
    RefreshControl,
} from 'react-native';
import {
    MessageCircle,
    Phone,
    User,
    Check,
    Clock,
    Edit,
    IndianRupee,
    AlertTriangle,
    UserPlus,
    FileText,
    Plus
} from 'lucide-react-native';
import { showToast, ucFirst } from '../Helper/Helper';
import { useHttpRequest } from '../ContextApi/ContextApi';
import { Header } from '../Components/Header';
import { BottomNavigation } from './navigation/BottomNavigation';
import EditStudentModal from '../modal/EditStudentModal';
import { useNavigation } from '@react-navigation/native';
import AddFeesModal from '../modal/AddFeesModal';

// Skeleton Loader Components
const SkeletonLoader = ({ style, children }) => (
    <View style={[styles.skeleton, style]}>{children}</View>
);

const StudentHeaderSkeleton = () => (
    <View style={styles.headerCard}>
        <View style={styles.cardContent}>
            <View style={styles.skeletonEditButton} />
            <View style={styles.headerInfo}>
                <View style={styles.skeletonAvatar} />
                <View style={styles.headerText}>
                    <View style={[styles.skeletonLine, { width: 120 }]} />
                    <View style={[styles.skeletonLine, { width: 80, height: 16 }]} />
                    <View style={styles.statusRow}>
                        <View style={styles.skeletonDot} />
                        <View style={[styles.skeletonLine, { width: 100, height: 12 }]} />
                    </View>
                </View>
            </View>
        </View>
        <View style={styles.actionButtons}>
            <View style={styles.skeletonButton}>
                <View style={styles.skeletonIcon} />
                <View style={[styles.skeletonLine, { width: 60, height: 16 }]} />
            </View>
            <View style={styles.buttonDivider} />
            <View style={styles.skeletonButton}>
                <View style={styles.skeletonIcon} />
                <View style={[styles.skeletonLine, { width: 40, height: 16 }]} />
            </View>
        </View>
    </View>
);

const InfoSectionSkeleton = ({ title, rows = 4 }) => (
    <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
            <View style={[styles.skeletonLine, { width: 120 }]} />
        </View>
        <View style={styles.cardContent}>
            {Array.from({ length: rows }).map((_, index) => (
                <View key={index} style={styles.infoRow}>
                    <View style={[styles.skeletonLine, { width: 80, height: 16 }]} />
                    <View style={[styles.skeletonLine, { width: 100, height: 16 }]} />
                </View>
            ))}
        </View>
    </View>
);

const FeeStatusSkeleton = () => (
    <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
            <View style={[styles.skeletonLine, { width: 100 }]} />
            <View style={styles.statusIndicator}>
                <View style={styles.skeletonDot} />
                <View style={[styles.skeletonLine, { width: 60, height: 16 }]} />
            </View>
        </View>
        {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.feeRow}>
                <View style={styles.feeLeft}>
                    <View style={styles.skeletonStatusIcon} />
                    <View>
                        <View style={[styles.skeletonLine, { width: 60, height: 16 }]} />
                        <View style={[styles.skeletonLine, { width: 40, height: 12 }]} />
                    </View>
                </View>
                <View style={[styles.skeletonLine, { width: 80, height: 32, borderRadius: 16 }]} />
            </View>
        ))}
        <View style={styles.feeSummary}>
            <View style={styles.summaryRow}>
                <View style={[styles.skeletonLine, { width: 60, height: 16 }]} />
                <View style={[styles.skeletonLine, { width: 80, height: 16 }]} />
            </View>
            <View style={styles.summaryRow}>
                <View style={[styles.skeletonLine, { width: 50, height: 16 }]} />
                <View style={[styles.skeletonLine, { width: 80, height: 16 }]} />
            </View>
        </View>
    </View>
);

const LoadingSkeleton = ({ refreshing, onRefresh }) => (
    <SafeAreaView style={styles.container}>
        <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#2563EB']}
                />
            }
        >
            <StudentHeaderSkeleton />
            <View style={styles.sectionsContainer}>
                <InfoSectionSkeleton title="Personal Information" rows={5} />
                <InfoSectionSkeleton title="Guardian Information" rows={2} />
                <FeeStatusSkeleton />
            </View>
        </ScrollView>
    </SafeAreaView>
);

const StudentProfile = ({ route }) => {
    const { studentId } = route.params;
    const { httpRequest } = useHttpRequest();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [studentData, setStudentData] = useState(null);
    const [feeStatus, setFeeStatus] = useState({});
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedFee, setSelectedFee] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [classes, setClasses] = useState([]);
    const didFetch = useRef(false);
    const navigation = useNavigation();
    const [isAddFeesModalOpen, setIsAddFeesModalOpen] = useState(false);

    // Fetch student data
    const fetchStudentData = useCallback(async () => {
        if (!studentId) {
            setLoading(false);
            setRefreshing(false);
            showToast('Student ID not provided', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await httpRequest(`/student/index/${studentId}`);
            if (response?.status === 'success' && response?.data) {
                const student = response.data;
                const mappedData = {
                    id: student.id,
                    uuid: student.uuid,
                    name: student.name || 'Unknown',
                    class: student.student_info?.class?.class_name || '',
                    section: student.student_info?.class?.section || '',
                    gender: student.student_info?.gender || '',
                    monthlyFees: parseFloat(student.student_info?.monthly_fees || 0),
                    mobile: student.mobile || '',
                    email: student.email || '',
                    status: student.status || '',
                    address: student.address || '',
                    guardianName: student.student_info?.guardian_name || '',
                    guardianMobile: student.student_info?.guardian_contact || '',
                    admission_year: student.student_info?.admission_year || '',
                    class_uuid: student.student_info?.class?.uuid || '',
                };

                setStudentData(mappedData);
                setEditFormData(mappedData);

                const fees = Array.isArray(student.student_info?.fees) ? student.student_info.fees : [];
                const feeMap = {};
                fees.forEach((fee) => {
                    if (fee.year_month) {
                        feeMap[fee.year_month] = {
                            id: fee.id,
                            uuid: fee.uuid,
                            paid: Boolean(fee.is_paid),
                            amount: parseFloat(fee.monthly_fees || 0),
                        };
                    }
                });
                setFeeStatus(feeMap);
            } else {
                throw new Error(response?.msg || 'Failed to fetch student data');
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            showToast(error?.message || 'Something went wrong while fetching student data', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [studentId]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        didFetch.current = false;
        fetchStudentData();
    }, [fetchStudentData]);

    // Fetch classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await httpRequest('/class/index');
                if (response.status === 'success') {
                    setClasses(response.data || []);
                } else {
                    showToast(response.msg || 'Failed to fetch classes', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('Something went wrong while fetching classes', 'error');
            }
        };
        fetchClasses();
    }, []);

    // Fetch student data on mount
    useEffect(() => {
        if (didFetch.current || !studentId) return;
        didFetch.current = true;
        fetchStudentData();
    }, [fetchStudentData, studentId]);

    // Reset didFetch when studentId changes
    useEffect(() => {
        didFetch.current = false;
        setLoading(true);
        setStudentData(null);
    }, [studentId]);

    // Mark fee as paid
    const handleMarkAsPaid = useCallback(
        (month) => {
            const fee = feeStatus[month];
            if (!fee || !fee.uuid) {
                showToast('Invalid fee record', 'error');
                return;
            }
            setSelectedMonth(month);
            setSelectedFee(fee);
            setShowConfirmationModal(true);
        },
        [feeStatus]
    );
    const openAddFeesModal = useCallback(() => {
        setIsAddFeesModalOpen(true);
    }, []);

    const closeAddFeesModal = useCallback(() => {
        setIsAddFeesModalOpen(false);
    }, []);
    // Add fee functionality
    const handleAddFee = useCallback(
        async (feeData) => {
            try {
                const response = await httpRequest(`/add-fees/${studentId}`, {
                    method: 'POST',
                    data: {
                        year_month: feeData.year_month,
                        is_paid: feeData.is_paid,
                        amount: studentData.monthlyFees || 0,
                    },
                });

                if (response?.status === 'success' && response?.data) {
                    const newFee = response.data;
                    if (!newFee.uuid || !newFee.year_month) {
                        throw new Error('Invalid fee data returned from server');
                    }

                    setFeeStatus((prev) => ({
                        ...prev,
                        [newFee.year_month]: {
                            id: newFee.id,
                            uuid: newFee.uuid,
                            paid: Boolean(newFee.is_paid),
                            amount: parseFloat(newFee.monthly_fees || studentData.monthlyFees || 0),
                        },
                    }));
                    showToast(`Fee for ${newFee.year_month} added successfully`, 'success');
                    setIsAddFeesModalOpen(false);
                } else {
                    const errorMsg = response?.msg || 'Failed to add fee';
                    showToast(errorMsg, 'error');
                }
            } catch (error) {
                console.error('Add Fee Error:', error);
                const errorMsg = error?.response?.data?.msg || error?.message || 'Something went wrong while adding fee';
                showToast(errorMsg, 'error');
            }
        },
        [studentId, studentData?.monthlyFees]
    );

    const confirmMarkAsPaid = async () => {
        if (!selectedFee?.uuid || !selectedMonth) {
            showToast('Missing payment information', 'error');
            return;
        }

        try {
            setLoadingPayment(true);
            const response = await httpRequest(`/fee/update/${selectedFee.uuid}`, {
                method: 'PUT',
                data: { is_paid: true },
            });

            if (response?.status === 'success') {
                setFeeStatus((prev) => ({
                    ...prev,
                    [selectedMonth]: {
                        ...prev[selectedMonth],
                        paid: true,
                    },
                }));
                showToast(`Payment marked as paid for ${selectedMonth}`, 'success');
            } else {
                const errorMsg = response?.msg || 'Failed to mark payment as paid';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Mark Paid Error:', error);
            const errorMsg = error?.response?.data?.msg || error?.message || 'Something went wrong while updating payment';
            showToast(errorMsg, 'error');
        } finally {
            setLoadingPayment(false);
            setShowConfirmationModal(false);
            setSelectedMonth(null);
            setSelectedFee(null);
        }
    };

    const cancelMarkAsPaid = useCallback(() => {
        setShowConfirmationModal(false);
        setSelectedMonth(null);
        setSelectedFee(null);
    }, []);

    // Communication functions
    const openWhatsApp = useCallback(() => {
        if (!studentData?.mobile) {
            showToast('No mobile number available', 'error');
            return;
        }
        const cleanMobile = studentData.mobile.replace(/\D/g, '');
        if (cleanMobile.length >= 10) {
            Linking.openURL(`whatsapp://send?phone=91${cleanMobile}`).catch(() => {
                Linking.openURL(`https://wa.me/91${cleanMobile}`);
            });
        } else {
            showToast('Invalid mobile number format', 'error');
        }
    }, [studentData?.mobile]);

    const makeCall = useCallback(() => {
        if (!studentData?.mobile) {
            showToast('No mobile number available', 'error');
            return;
        }
        const cleanMobile = studentData.mobile.replace(/\D/g, '');
        if (cleanMobile.length >= 10) {
            Linking.openURL(`tel:+91${cleanMobile}`);
        } else {
            showToast('Invalid mobile number format', 'error');
        }
    }, [studentData?.mobile]);

    // Edit modal functions
    const openEditModal = useCallback(() => {
        if (studentData) {
            setEditFormData(studentData);
            setIsEditModalOpen(true);
        }
    }, [studentData]);

    const closeEditModal = useCallback(() => {
        setIsEditModalOpen(false);
    }, []);

    const handleEditInputChange = useCallback((e) => {
        const { name, value } = e.target
        setEditFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }, [])

    const handleSaveEdit = async () => {
        if (!studentData?.uuid) {
            showToast('Student information not available', 'error');
            return;
        }

        try {
            const response = await httpRequest(`/student/update/${studentData.uuid}`, {
                method: 'PUT',
                data: editFormData,
            });
            if (response?.status === 'success') {
                const student = response.data;
                const mappedData = {
                    id: student.id,
                    uuid: student.uuid,
                    name: student.name || 'Unknown',
                    class: student.student_info?.class?.class_name || '',
                    section: student.student_info?.class?.section || '',
                    gender: student.student_info?.gender || '',
                    monthlyFees: parseFloat(student.student_info?.monthly_fees || 0),
                    mobile: student.mobile || '',
                    email: student.email || '',
                    status: student.status || '',
                    address: student.address || '',
                    guardianName: student.student_info?.guardian_name || '',
                    guardianMobile: student.student_info?.guardian_contact || '',
                    admission_year: student.student_info?.admission_year || '',
                    class_uuid: student.student_info?.class?.uuid || '',
                };
                setStudentData(mappedData);
                setIsEditModalOpen(false);
                showToast(response?.msg || 'Student information updated successfully');
            } else {
                const errorMsg = response?.msg || 'Failed to update student information';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Update Error:', error);
            const errorMsg = error?.response?.data?.msg || error?.message || 'Something went wrong while updating student';
            showToast(errorMsg, 'error');
        }
    };

    // Calculate fee summary
    const feeStatusValues = Object.values(feeStatus);
    const unpaidCount = feeStatusValues.filter((status) => !status.paid).length;
    const totalPaidAmount = feeStatusValues
        .filter((status) => status.paid)
        .reduce((sum, status) => sum + (status.amount || 0), 0);
    const totalPendingAmount = feeStatusValues
        .filter((status) => !status.paid)
        .reduce((sum, status) => sum + (status.amount || 0), 0);

    // Render logic
    return (
        <SafeAreaView style={styles.container}>
            <Header title="Student Profile" />
            {loading ? (
                <LoadingSkeleton refreshing={refreshing} onRefresh={onRefresh} />
            ) : studentData ? (
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#2563EB']}
                        />
                    }
                >
                    {/* Student Header Card */}
                    <View style={styles.headerCard}>
                        <View style={styles.cardContent}>
                            <TouchableOpacity
                                activeOpacity={0.7} onPress={openEditModal} style={styles.editButton}>
                                <Edit size={20} color="#3B82F6" />
                            </TouchableOpacity>
                            <View style={styles.headerInfo}>
                                <View style={styles.avatar}>
                                    <User size={32} color="#fff" />
                                </View>
                                <View style={styles.headerText}>
                                    <Text style={styles.studentName}>{studentData.name}</Text>
                                    <Text style={styles.studentClass}>
                                        {studentData.class}
                                        {studentData.section ? `-${studentData.section}` : ''}
                                    </Text>
                                    <View style={styles.statusRow}>
                                        <View
                                            style={[
                                                styles.statusDot,
                                                { backgroundColor: studentData.status === 'active' ? '#10B981' : '#EF4444' },
                                            ]}
                                        />
                                        <Text style={styles.statusText}>{ucFirst(studentData.status)} Student</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={openWhatsApp}
                                style={styles.actionButton}
                                disabled={!studentData.mobile}
                            >
                                <MessageCircle size={20} color="#10B981" />
                                <Text style={[styles.actionButtonText, { color: '#10B981' }]}>WhatsApp</Text>
                            </TouchableOpacity>
                            <View style={styles.buttonDivider} />
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={makeCall}
                                style={styles.actionButton}
                                disabled={!studentData.mobile}
                            >
                                <Phone size={20} color="#3B82F6" />
                                <Text style={[styles.actionButtonText, { color: '#3B82F6' }]}>Call</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.sectionsContainer}>
                        {/* Personal Information */}
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>Personal Information</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Full Name</Text>
                                    <Text style={styles.infoValue}>{studentData.name}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Class</Text>
                                    <Text style={styles.infoValue}>
                                        {studentData.class}
                                        {studentData.section ? `-${studentData.section}` : ''}
                                    </Text>
                                </View>
                                {studentData.gender && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Gender</Text>
                                        <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                                            {studentData.gender}
                                        </Text>
                                    </View>
                                )}
                                {studentData.admission_year && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Admission year</Text>
                                        <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>
                                            {studentData.admission_year}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.infoRow}>
                                    <View style={styles.feeAmount}>
                                        <Text style={styles.infoLabel}>Monthly fee</Text>
                                        <Text style={styles.infoValue}>{studentData.monthlyFees}</Text>
                                    </View>
                                </View>
                                {studentData.address && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Address</Text>
                                        <Text style={[styles.infoValue, styles.addressText]}>
                                            {studentData.address}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Guardian Information */}
                        {(studentData.guardianName || studentData.guardianMobile) && (
                            <View style={styles.infoCard}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.cardTitle}>Guardian Information</Text>
                                </View>
                                <View style={styles.cardContent}>
                                    {studentData.guardianName && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Guardian Name</Text>
                                            <Text style={styles.infoValue}>{studentData.guardianName}</Text>
                                        </View>
                                    )}
                                    {studentData.guardianMobile && (
                                        <View style={styles.infoRow}>
                                            <Text style={styles.infoLabel}>Phone Number</Text>
                                            <Text style={styles.infoValue}>+91 {studentData.guardianMobile}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* Fee Status */}
                        <View style={styles.infoCard}>
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 }}>
                                    <Text style={styles.cardTitle}>Fee Status</Text>
                                    {unpaidCount > 0 && (
                                        <View style={styles.statusIndicator}>
                                            <View style={styles.pendingBadge}>
                                                <Text style={styles.pendingCount}>{unpaidCount}</Text>
                                            </View>
                                            <Text style={styles.pendingText}>Pending</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={openAddFeesModal}
                                        style={styles.addFeeButton}
                                    >
                                        <Plus size={20} color="#3B82F6" />
                                        <Text style={styles.addFeeButtonText}>Add Fee</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {Object.keys(feeStatus).length > 0 ? (
                                <>
                                    {Object.entries(feeStatus)
                                        .sort(([a], [b]) => b.localeCompare(a))
                                        .map(([month, status]) => (
                                            <View key={month} style={styles.feeRow}>
                                                <View style={styles.feeLeft}>
                                                    <View
                                                        style={[
                                                            styles.statusIcon,
                                                            { backgroundColor: status.paid ? '#DCFCE7' : '#FEF3C7' },
                                                        ]}
                                                    >
                                                        {status.paid ? (
                                                            <Check size={16} color="#16A34A" />
                                                        ) : (
                                                            <Clock size={16} color="#D97706" />
                                                        )}
                                                    </View>
                                                    <View>
                                                        <Text style={styles.monthText}>{month}</Text>
                                                        <View style={styles.amountRow}>
                                                            <IndianRupee size={12} color="#6B7280" />
                                                            <Text style={styles.amountText}>{status.amount}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View>
                                                    {status.paid ? (
                                                        <View style={styles.paidBadge}>
                                                            <Text style={styles.paidText}>Paid</Text>
                                                        </View>
                                                    ) : (
                                                        <TouchableOpacity
                                                            activeOpacity={0.7}
                                                            onPress={() => handleMarkAsPaid(month)}
                                                            style={styles.markPaidButton}
                                                            disabled={!status.uuid}
                                                        >
                                                            <Text style={styles.markPaidText}>Mark Paid</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        ))}
                                    <View style={styles.feeSummary}>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Total Paid</Text>
                                            <View style={styles.summaryAmount}>
                                                <IndianRupee size={14} color="#16A34A" />
                                                <Text style={[styles.summaryValue, { color: '#16A34A' }]}>
                                                    {totalPaidAmount.toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Pending</Text>
                                            <View style={styles.summaryAmount}>
                                                <IndianRupee size={14} color="#DC2626" />
                                                <Text style={[styles.summaryValue, { color: '#DC2626' }]}>
                                                    {totalPendingAmount.toFixed(2)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </>
                            ) : (
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: 20,
                                    }}
                                >
                                    <FileText size={48} color="#9ca3af" style={{ marginBottom: 12 }} />
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: '#6b7280',
                                            fontWeight: '500',
                                            textAlign: 'center',
                                        }}
                                    >
                                        No fee records found
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            ) : (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                    backgroundColor: '#F9FAFB',
                }}>
                    <UserPlus size={64} color="#3B82F6" strokeWidth={1.5} />
                    <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: '#1F2937',
                        marginTop: 16,
                        marginBottom: 8,
                    }}>
                        No Student Found
                    </Text>
                    <Text style={{
                        fontSize: 16,
                        color: '#6B7280',
                        textAlign: 'center',
                        marginBottom: 24,
                    }}>
                        It looks like this student isn't in our records yet.
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={fetchStudentData}
                        style={{
                            backgroundColor: '#E5E7EB',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 8,
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#1F2937',
                        }}>
                            Retry Search
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: '#3B82F6',
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderRadius: 8,
                        }}
                        onPress={() => navigation.navigate('Students', { status: 'active' })}
                    >
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#FFFFFF',
                        }}>
                            Add New Student
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <BottomNavigation />

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirmationModal}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelMarkAsPaid}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIcon}>
                            <AlertTriangle size={40} color="#F59E0B" />
                        </View>
                        <Text style={styles.modalTitle}>Confirm Payment</Text>
                        <Text style={styles.modalMessage}>
                            Are you sure you want to mark this payment as completed?
                        </Text>
                        <View style={styles.modalDetails}>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>Month:</Text>
                                <Text style={styles.modalDetailValue}>{selectedMonth}</Text>
                            </View>
                            <View style={styles.modalDetailRow}>
                                <Text style={styles.modalDetailLabel}>Amount:</Text>
                                <View style={styles.modalAmount}>
                                    <IndianRupee size={14} color="#1F2937" />
                                    <Text style={styles.modalDetailValue}>{selectedFee?.amount}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                activeOpacity={0.7} onPress={cancelMarkAsPaid} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                disabled={loadingPayment}
                                onPress={confirmMarkAsPaid}
                                style={[styles.confirmButton, loadingPayment && styles.disabledButton]}
                            >
                                {loadingPayment ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.confirmButtonText}>Confirm</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Student Modal */}
            {isEditModalOpen && (
                <EditStudentModal
                    isOpen={isEditModalOpen}
                    closeModal={closeEditModal}
                    handleEditStudent={handleSaveEdit}
                    formData={editFormData}
                    handleInputChange={handleEditInputChange}
                    student={studentData}
                    classes={classes}
                />
            )}

            {isAddFeesModalOpen && (
                <AddFeesModal
                    isOpen={isAddFeesModalOpen}
                    closeModal={closeAddFeesModal}
                    handleAddFee={handleAddFee}
                    studentId={studentId}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    content: {
        flex: 1,
    },
    scrollViewContent: {
        paddingBottom: 20, // Add padding to prevent content from being hidden under BottomNavigation
    },
    sectionsContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 16, // Consistent spacing between cards
    },

    // Skeleton styles
    skeleton: {
        opacity: 0.7,
    },
    skeletonLine: {
        backgroundColor: '#E5E7EB',
        height: 20,
        borderRadius: 4,
    },
    skeletonAvatar: {
        width: 64,
        height: 64,
        backgroundColor: '#E5E7EB',
        borderRadius: 32,
        marginRight: 16,
    },
    skeletonEditButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 40,
        height: 40,
        backgroundColor: '#E5E7EB',
        borderRadius: 20,
    },
    skeletonDot: {
        width: 8,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginRight: 8,
    },
    skeletonButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    skeletonIcon: {
        width: 20,
        height: 20,
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        marginRight: 8,
    },
    skeletonStatusIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#E5E7EB',
        borderRadius: 16,
        marginRight: 12,
    },

    // Card styles
    headerCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardContent: {
        padding: 16,
        position: 'relative',
    },
    editButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        backgroundColor: '#DBEAFE',
        borderRadius: 20,
        zIndex: 1,
    },
    headerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        backgroundColor: '#3B82F6',
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    studentName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    studentClass: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        color: '#6B7280',
    },
    actionButtons: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    actionButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    buttonDivider: {
        width: 1,
        backgroundColor: '#F3F4F6',
    },

    // Info card styles
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    addFeeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#DBEAFE',
        borderRadius: 20,
    },
    addFeeButtonText: {
        marginLeft: 4,
        fontSize: 14,
        fontWeight: '500',
        color: '#3B82F6',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 8,
        // paddingHorizontal: 16,
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        textAlign: 'right',
    },
    addressText: {
        textAlign: 'right',
        flexWrap: 'wrap',
    },
    feeAmount: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Fee status styles
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pendingBadge: {
        width: 24,
        height: 24,
        backgroundColor: '#FEE2E2',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    pendingCount: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#DC2626',
    },
    pendingText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#DC2626',
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    feeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    monthText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 2,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 2,
    },
    paidBadge: {
        backgroundColor: '#DCFCE7',
        borderWidth: 1,
        borderColor: '#BBF7D0',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    paidText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#16A34A',
    },
    markPaidButton: {
        backgroundColor: '#2563EB',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    markPaidText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#fff',
    },
    feeSummary: {
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    summaryAmount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 2,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    modalIcon: {
        width: 80,
        height: 80,
        backgroundColor: '#FEF3C7',
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    modalDetails: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        width: '100%',
        marginBottom: 24,
    },
    modalDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    modalDetailLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    modalDetailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    modalAmount: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#374151',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        backgroundColor: '#F59E0B',
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },

    // Error state styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#2563EB',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default StudentProfile;