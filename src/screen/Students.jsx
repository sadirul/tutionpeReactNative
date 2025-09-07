// Students.js
import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Pressable,
  Platform,
  Dimensions,
  RefreshControl,
  BackHandler,
  Switch
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomNavigation } from './navigation/BottomNavigation';
import { ucFirst } from '../Helper/Helper';
import { useHttpRequest } from '../ContextApi/ContextApi';
import { Header } from '../Components/Header';
import AddStudentModal from '../modal/AddStudentModal';
import LinearGradient from 'react-native-linear-gradient';
import ClassDropdown from '../component/ClassDropdown';

// Type definitions
/**
 * @typedef {{ id: number|string, name: string, mobile: string, unpaid_fees_count: number, active?: boolean, status?: 'active'|'inactive'|string, uuid?: string, student_info?: { uuid?: string, gender?: 'male'|'female'|string, class?: { class_name?: string, section?: string } } }} Student
 * @typedef {{ uuid?: string, class_name: string, section?: string }} ClassItem
 */

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Helper: normalize a student's active boolean
function isStudentActive(s) {
  if (typeof s?.active === 'boolean') return s.active;
  const stat = (s?.status || '').toString().toLowerCase();
  if (stat === 'active') return true;
  if (stat === 'inactive') return false;
  return true;
}

const Students = () => {
  const { httpRequest } = useHttpRequest();
  const navigation = useNavigation();
  const route = useRoute();
  const params = new URLSearchParams(route.params?.search || '');

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingClass, setPendingClass] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Data state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false)
  const [updateFees, setUpdateFees] = useState(false);


  // Handle hardware back button press
  useEffect(() => {
    const backAction = () => {
      if (selectionMode) {
        clearSelection();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [selectionMode, clearSelection]);


  // Filters
  const [filters, setFilters] = useState({
    name: params.get('name') || '',
    mobile: params.get('mobile') || '',
    class: params.get('class') || route.params.className || '',
    feeStatus: params.get('feeStatus') || route.params.feeStatus || '',
    status: params.get('status') || route.params.status || 'active',
  });
  const debouncedName = useDebouncedValue(filters.name, 250);

  const didFetchStudents = useRef(false);
  const didFetchClasses = useRef(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reset refs to allow refetching
      didFetchStudents.current = false;
      didFetchClasses.current = false;
      await Promise.all([fetchStudents(), fetchClasses()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchStudents, fetchClasses]);
  // Fetch students
  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const response = await httpRequest('/student/index');
      if (response?.status === 'success') {
        setStudents(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error(response?.msg || 'Failed to fetch students');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  }, [httpRequest]);

  // Fetch classes
  const fetchClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const response = await httpRequest('/class/index');
      if (response?.status === 'success') {
        setClasses(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error(response?.msg || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingClasses(false);
    }
  }, [httpRequest]);

  useEffect(() => {
    if (didFetchStudents.current) return;
    didFetchStudents.current = true;
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (didFetchClasses.current) return;
    didFetchClasses.current = true;
    fetchClasses();
  }, [fetchClasses]);

  // Update navigation params
  const updateSearchParams = useCallback(
    (next) => {
      const p = new URLSearchParams();
      if (next.name) p.set('name', next.name);
      if (next.mobile) p.set('mobile', next.mobile);
      if (next.class) p.set('class', next.class);
      if (next.feeStatus) p.set('feeStatus', next.feeStatus);
      if (next.status) p.set('status', next.status);
      navigation.setParams({ search: p.toString() });
    },
    [navigation]
  );

  const handleFilterChange = useCallback(
    (name, value) => {
      const next = { ...filters, [name]: value };
      setFilters(next);
      if (name !== 'name') updateSearchParams(next);
    },
    [filters, updateSearchParams]
  );

  useEffect(() => {
    if (debouncedName !== filters.name) return;
    updateSearchParams(filters);
  }, [debouncedName, filters, updateSearchParams]);

  const clearAllFilters = useCallback(() => {
    const newFilters = { name: filters.name, mobile: '', class: '', feeStatus: '', status: 'active' };
    setFilters(newFilters);
    const p = new URLSearchParams();
    if (newFilters.name) p.set('name', newFilters.name);
    p.set('status', 'active');
    navigation.setParams({ search: p.toString() });
  }, [filters.name, navigation]);

  const startSelectionMode = useCallback(() => {
    setSelectionMode(true);
    setShowBulkActions(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStudents([]);
    setSelectionMode(false);
    setShowBulkActions(false);
  }, []);

  const toggleStudentSelection = useCallback((studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  }, []);

  const handleStudentClick = useCallback(
    (student) => {
      if (selectionMode) {
        toggleStudentSelection(student?.student_info?.uuid ?? student?.uuid ?? student?.id);
      } else {
        navigation.navigate('StudentProfile', {
          studentId: student?.uuid || student?.student_info?.uuid || student?.id,
        });
      }
    },
    [navigation, selectionMode, toggleStudentSelection]
  );

  const filteredStudents = useMemo(() => {
    const nameQ = (debouncedName || '').toLowerCase();
    const mobileQ = filters.mobile || '';
    const classQ = filters.class || '';
    const feeQ = filters.feeStatus || '';
    const statusQ = filters.status || route.params.status || 'active';

    return students.filter((student) => {
      const sName = (student?.name || '').toLowerCase();
      const sMobile = student?.mobile || '';
      const sClassName = student?.student_info?.class?.class_name || '';
      const sUnpaid = Number(student?.unpaid_fees_count || 0);
      const active = isStudentActive(student);

      if (nameQ && !sName.includes(nameQ)) return false;
      if (mobileQ && !sMobile.includes(mobileQ)) return false;
      if (classQ && sClassName !== classQ) return false;
      if (feeQ === 'due' && !(sUnpaid > 0)) return false;
      if (feeQ === 'paid' && !(sUnpaid === 0)) return false;
      if (statusQ === 'active' && !active) return false;
      if (statusQ === 'inactive' && active) return false;
      return true;
    });
  }, [students, debouncedName, filters.mobile, filters.class, filters.feeStatus, filters.status]);

  const selectAllStudents = useCallback(() => {
    setSelectedStudents(filteredStudents.map((s) => s?.student_info?.uuid ?? s?.uuid ?? s?.id));
  }, [filteredStudents]);

  const handleBulkClassChange = useCallback(
    async (cls) => {
      const className = cls?.class_name;
      const classUUID = cls?.uuid;
      if (!classUUID || selectedStudents.length === 0) return;
      try {
        setConfirming(true);
        const response = await httpRequest(`/student/change/class?updateFees=${updateFees}`, {
          method: 'PUT',
          data: { student_ids: selectedStudents, class: classUUID },
        });
        if (response?.status === 'success') {
          setUpdateFees(false);
          const selectedSet = new Set(selectedStudents);
          const nextStudents = students.map((s) => {
            const sid = s?.student_info?.uuid ?? s?.uuid ?? s?.id;
            if (selectedSet.has(sid)) {
              return {
                ...s,
                student_info: {
                  ...(s.student_info || {}),
                  class: {
                    ...((s.student_info && s.student_info.class) || {}),
                    class_name: className,
                    section:
                      (s.student_info && s.student_info.class && s.student_info.class.section) || undefined,
                  },
                },
              };
            }
            return s;
          });
          setStudents(nextStudents);
          clearSelection();
          setConfirmModalOpen(false);
          setPendingClass(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setConfirming(false);
        setConfirmModalOpen(false);
        setPendingClass(null);
        setPendingStatus(null);
      }
    },
    [clearSelection, httpRequest, selectedStudents, students]
  );

  const handleBulkStatusChange = useCallback(
    async (activeFlag) => {
      if (selectedStudents.length === 0) return;
      try {
        setConfirming(true);
        const response = await httpRequest('/student/change/status', {
          method: 'PUT',
          data: { student_ids: selectedStudents, status: activeFlag ? 'active' : 'inactive' },
        });
        if (response?.status === 'success') {
          const selectedSet = new Set(selectedStudents);
          const nextStudents = students.map((s) => {
            const sid = s?.student_info?.uuid ?? s?.uuid ?? s?.id;
            if (selectedSet.has(sid)) {
              const updated = { ...s, active: !!activeFlag };
              if ('status' in s) updated.status = activeFlag ? 'active' : 'inactive';
              return updated;
            }
            return s;
          });
          setStudents(nextStudents);
          clearSelection();
          setConfirmModalOpen(false);
          setPendingStatus(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setConfirming(false);
        setConfirmModalOpen(false);
        setPendingStatus(null);
        setPendingClass(null);
      }
    },
    [httpRequest, selectedStudents, students, clearSelection]
  );

  const openConfirmModalForClass = useCallback((cls) => {
    if (!cls) return;
    setPendingClass(cls);
    setPendingStatus(null);
    setConfirmModalOpen(true);
  }, []);

  const openConfirmModalForStatus = useCallback((flag) => {
    setPendingStatus(!!flag);
    setPendingClass(null);
    setConfirmModalOpen(true);
  }, []);

  const selectClass = (value) => {
    handleFilterChange('class', value)
    setVisible(false)
  }


  const StudentRow = ({ student }) => {
    const selected =
      selectedStudents.includes(student?.id) ||
      selectedStudents.includes(student?.student_info?.uuid) ||
      selectedStudents.includes(student?.uuid);
    const studentClass = student?.student_info?.class
      ? `${student.student_info.class.class_name || ''}${student.student_info.class.section ? '-' + student.student_info.class.section : ''
      }`
      : 'N/A';
    const gender = student?.student_info?.gender;
    const admission_year = student?.student_info?.admission_year;
    const unpaid = Number(student?.unpaid_fees_count || 0);
    const active = isStudentActive(student);

    return (
      <Pressable
        onPress={() => handleStudentClick(student)}
        style={[
          styles.studentRow,
          selected && styles.selectedRow,
          selectionMode ? styles.selectionMode : styles.clickableRow,
        ]}
      >
        {selectionMode && (
          <View style={styles.checkboxContainer}>
            <View
              style={[
                styles.checkbox,
                selected ? styles.checkboxSelected : styles.checkboxUnselected,
              ]}
            >
              {selected && <Icon name="check" size={14} color="#fff" />}
            </View>
          </View>
        )}
        <View style={styles.studentContent}>
          <View style={styles.studentHeader}>
            <View style={styles.studentNameContainer}>
              <Text style={styles.studentName}>{student?.name || 'Unnamed'}</Text>
              {gender && (
                <View
                  style={[
                    styles.genderBadge,
                    gender === 'male'
                      ? styles.maleBadge
                      : gender === 'female'
                        ? styles.femaleBadge
                        : styles.otherBadge,
                  ]}
                >
                  <Text style={styles.genderText}>{ucFirst(gender)}</Text>
                </View>
              )}
            </View>
            {!selectionMode && (
              <View style={styles.avatar}>
                <Icon name="account" size={18} color="#2563eb" />
              </View>
            )}
          </View>
          <Text style={styles.studentClass}>{studentClass}, Year: {admission_year}</Text>
          <View style={styles.studentDetails}>
            <View style={styles.mobileContainer}>
              <Icon name="phone" size={12} color="#6b7280" />
              <Text style={styles.mobileText}>{student?.mobile || '-'}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                styles.statusBadgeSpacer,
                unpaid > 0 ? styles.dueBadge : styles.paidBadge,
              ]}
            >
              <Text style={[styles.statusText, unpaid > 0 ? styles.dueStatusText : styles.paidStatusText]}>
                {unpaid > 0 ? `${unpaid} month${unpaid > 1 ? 's' : ''} due` : 'No dues'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                styles.statusBadgeSpacer,
                active ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <Text style={[styles.statusText, styles.paidStatusText]}>{active ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const AnyFiltersActive = !!(
    filters.class || filters.mobile || filters.feeStatus || (filters.status && filters.status !== 'active')
  );

  return (
    <View style={styles.container}>
      <Header title="Students" />

      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#9333EA']} // Indigo → Purple
        start={{ x: 0, y: 0 }}   // left
        end={{ x: 1, y: 0 }}     // right
        style={styles.header}
      >
        {selectionMode ? (
          <View style={styles.selectionHeader}>
            <View style={styles.selectionTitle}>
              <TouchableOpacity activeOpacity={0.7} onPress={clearSelection} style={styles.iconButton}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.selectionText}>{selectedStudents.length} selected</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={selectAllStudents} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.normalHeader}>
            <Text style={styles.headerTitle}>Students</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowFilters((s) => !s)}
              style={styles.iconButton}
            >
              <Icon name="filter" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={filters.name}
            onChangeText={(text) => handleFilterChange('name', text)}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </LinearGradient>
      {/* Filter Chips */}
      {
        AnyFiltersActive && (
          <View style={styles.filterChipsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {AnyFiltersActive && (
                <TouchableOpacity activeOpacity={0.7} onPress={clearAllFilters} style={styles.filterChip}>
                  <Text style={styles.filterChipText}>Clear filters</Text>
                  <Icon name="close" size={14} color="#374151" />
                </TouchableOpacity>
              )}
              {filters.class && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>Class: {filters.class}</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleFilterChange('class', '')}
                    style={styles.chipClose}
                  >
                    <Icon name="close" size={14} color="#1e40af" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.mobile && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>Mobile: {filters.mobile}</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleFilterChange('mobile', '')}
                    style={styles.chipClose}
                  >
                    <Icon name="close" size={14} color="#1e40af" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.feeStatus && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    {filters.feeStatus === 'due' ? 'Fee Due' : 'Fee Paid'}
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleFilterChange('feeStatus', '')}
                    style={styles.chipClose}
                  >
                    <Icon name="close" size={14} color="#1e40af" />
                  </TouchableOpacity>
                </View>
              )}
              {filters.status && filters.status !== 'active' && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>Status: {ucFirst(filters.status)}</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleFilterChange('status', '')}
                    style={styles.chipClose}
                  >
                    <Icon name="close" size={14} color="#1e40af" />
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )
      }


      {/* Extended Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterItem}>
            <Icon name="phone" size={18} color="#9ca3af" style={styles.filterIcon} />
            <TextInput
              style={styles.filterInput}
              placeholder="Filter by mobile number"
              value={filters.mobile}
              onChangeText={(text) => handleFilterChange('mobile', text)}
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
            />
          </View>
          <ClassDropdown
            label="All Classes"
            items={[{ label: 'All Classes', value: '' }, ...classes.map(c => ({ label: c.class_name, value: c.class_name }))]}
            value={filters.class}
            onChange={(val) => handleFilterChange('class', val)}
          />

          {/* Fee status buttons with spacing */}
          <View style={[styles.buttonGroup, styles.buttonGroupGutter]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleFilterChange('feeStatus', 'paid')}
              style={[
                styles.filterButton,
                styles.filterButtonSpacer,
                filters.feeStatus === 'paid' ? styles.activeFeeButton : styles.inactiveFeeButton,
              ]}
            >
              <Text
                style={
                  filters.feeStatus === 'paid'
                    ? styles.activeButtonText
                    : styles.inactiveButtonText
                }
              >
                Fee Paid
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleFilterChange('feeStatus', 'due')}
              style={[
                styles.filterButton,
                styles.filterButtonSpacer,
                filters.feeStatus === 'due' ? styles.activeDueButton : styles.inactiveFeeButton,
              ]}
            >
              <Text
                style={
                  filters.feeStatus === 'due'
                    ? styles.activeButtonText
                    : styles.inactiveButtonText
                }
              >
                Fee Due
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active/Inactive buttons with spacing */}
          <View style={[styles.buttonGroup, styles.buttonGroupGutter]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleFilterChange('status', 'active')}
              style={[
                styles.filterButton,
                styles.filterButtonSpacer,
                filters.status === 'active'
                  ? styles.activeStatusButton
                  : styles.inactiveStatusButton,
              ]}
            >
              <Text
                style={
                  filters.status === 'active'
                    ? styles.activeButtonText
                    : styles.inactiveButtonText
                }
              >
                Active
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleFilterChange('status', 'inactive')}
              style={[
                styles.filterButton,
                styles.filterButtonSpacer,
                filters.status === 'inactive'
                  ? styles.inactiveStatusSelectedButton
                  : styles.inactiveStatusButton,
              ]}
            >
              <Text
                style={
                  filters.status === 'inactive'
                    ? styles.activeButtonText
                    : styles.inactiveButtonText
                }
              >
                Inactive
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bulk Actions Bar */}
      {showBulkActions && selectedStudents.length > 0 && (
        <View style={styles.bulkActionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.bulkActionLabel}>Change class to:</Text>
            {classes.map((cls, idx) => (
              <TouchableOpacity
                activeOpacity={0.7}
                key={`${cls.class_name}-${cls.section || ''}-${idx}`}
                onPress={() => openConfirmModalForClass(cls)}
                style={styles.bulkActionButton}
              >
                <Text style={styles.bulkActionButtonText}>{cls.class_name}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.divider} />
            <Text style={styles.bulkActionLabel}>Status:</Text>
            {filters.status === 'inactive' ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openConfirmModalForStatus(true)}
                style={[styles.bulkActionButton, styles.activeStatusButton, { backgroundColor: '#047857' }]}
              >
                <Icon name="shield-check" size={16} color="#fff" />
                <Text style={[styles.bulkActionButtonText, { marginLeft: 4 }]}>
                  Mark Active
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openConfirmModalForStatus(false)}
                style={[styles.bulkActionButton, styles.inactiveStatusButton, { backgroundColor: '#da3b3bff' }]}
              >
                <Icon name="shield-off" size={16} color="#fff" />
                <Text style={[styles.bulkActionButtonText, { marginLeft: 4 }]}>
                  Mark Inactive
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Students List */}
      {loadingStudents || loadingClasses ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={() => (
            <View style={styles.studentRow}>
              <View style={styles.avatarSkeleton} />
              <View style={[styles.skeletonContent, { marginLeft: 12 }]}>
                <View style={styles.skeletonLine} />
                <View style={[styles.skeletonLine, { width: '50%' }]} />
              </View>
            </View>
          )}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563eb']} // Primary color for the refresh spinner
              tintColor="#2563eb" // iOS spinner color
            />
          }
        />
      ) : filteredStudents.length > 0 ? (
        <FlatList
          data={filteredStudents}
          renderItem={({ item }) => <StudentRow student={item} />}
          keyExtractor={(item) =>
            item?.id != null
              ? String(item.id)
              : item?.student_info?.uuid || item?.uuid || `no-id-${Math.random().toString(36)}`
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2563eb']} // Primary color for the refresh spinner
              tintColor="#2563eb" // iOS spinner color
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Icon name="account" size={36} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>No students found</Text>
          <Text
            style={styles.emptyText}
          >
            {filters.name ||
              filters.mobile ||
              filters.class ||
              filters.feeStatus ||
              (filters.status && filters.status !== 'active')

              ? 'Try adjusting your filters'
              : 'Add your first student by clicking the + button below'}
          </Text>
        </View>
      )}

      {/* FABs */}
      {!selectionMode && (
        <View style={styles.fabContainer}>
          {filteredStudents.length > 0 && (
            <TouchableOpacity onPress={startSelectionMode} activeOpacity={0.8}>
              <LinearGradient
                colors={['#f97316', '#facc15']} // orange-500 to amber-500
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fab}
              >
                <Icon name="pencil" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          )}
          <LinearGradient
            colors={['#6366F1', '#9333EA']} // Indigo → Purple
            start={{ x: 0, y: 0 }}   // left
            end={{ x: 1, y: 0 }}     // right
            style={styles.fab}
          >
            <TouchableOpacity activeOpacity={0.7} onPress={() => setIsModalOpen(true)} >
              <Icon name="account-plus" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>


        </View>
      )}

      <BottomNavigation />

      {/* Add Student Modal */}
      <AddStudentModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} />

      {/* Confirm Modal */}
      <Modal
        visible={confirmModalOpen}
        transparent
        animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
        onRequestClose={() => !confirming && setConfirmModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => !confirming && setConfirmModalOpen(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.modalCloseButton}
              onPress={() => !confirming && setConfirmModalOpen(false)}
              disabled={confirming}
            >
              <Icon name="close" size={20} color="#9ca3af" />
            </TouchableOpacity>
            <View style={styles.modalIcon}>
              <Icon name="alert" size={32} color="#ea580c" />
            </View>
            <Text style={styles.modalTitle}>
              {pendingClass
                ? 'Change class?'
                : pendingStatus === true
                  ? 'Mark selected as Active?'
                  : pendingStatus === false
                    ? 'Mark selected as Inactive?'
                    : 'Confirm action'}
            </Text>
            <Text style={styles.modalText}>
              This will update{' '}
              <Text style={styles.modalBold}>{selectedStudents.length}</Text> student
              {selectedStudents.length > 1 ? 's' : ''}{' '}
              {pendingClass ? (
                <>
                  to{' '}
                  <Text style={[styles.modalBold, { color: '#2563eb' }]}>{pendingClass?.class_name}</Text>.
                </>
              ) : pendingStatus === true ? (
                <>
                  to <Text style={[styles.modalBold, { color: '#047857' }]}>Active</Text>.
                </>
              ) : pendingStatus === false ? (
                <>
                  to <Text style={[styles.modalBold, { color: '#4b5563' }]}>Inactive</Text>.
                </>
              ) : null}
            </Text>
            <View style={styles.switchRow}>
              <Switch
                value={updateFees}
                onValueChange={val => setUpdateFees(val)}
                trackColor={{ false: '#ccc', true: '#4f46e5' }}
                thumbColor={updateFees ? '#fff' : '#fff'}
              />
              <Text style={styles.switchLabel}>
                Also update Monthly Fee as per <Text style={[styles.modalBold, { color: '#2563eb' }]}>{pendingClass?.class_name}</Text>
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setConfirmModalOpen(false)}
                style={styles.modalCancelButton}
                disabled={confirming}
              >
                <Text style={styles.modalCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  if (pendingClass) return handleBulkClassChange(pendingClass);
                  if (pendingStatus === true) return handleBulkStatusChange(true);
                  if (pendingStatus === false) return handleBulkStatusChange(false);
                  setConfirmModalOpen(false);
                }}
                style={[styles.modalConfirmButton, confirming && styles.modalConfirmButtonDisabled]}
                disabled={confirming}
              >
                {confirming ? (
                  <View style={styles.confirmingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.modalConfirmText}>UPDATING</Text>
                  </View>
                ) : (
                  <Text style={styles.modalConfirmText}>CONFIRM</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: { backgroundColor: '#2563eb', paddingTop: 10, paddingHorizontal: 16, paddingBottom: 12 },
  normalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
  selectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectionTitle: { flexDirection: 'row', alignItems: 'center' },
  selectionText: { fontSize: 18, fontWeight: '500', color: '#fff', marginLeft: 12 },
  selectAllButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 9999 },
  selectAllText: { fontSize: 14, color: '#fff' },
  iconButton: { padding: 8, borderRadius: 9999 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, marginTop: 12, paddingHorizontal: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 16, color: '#1f2937' },

  filterChipsContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 16 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 9999, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8 },
  filterChipText: { fontSize: 14, color: '#1e40af' },
  chipClose: { marginLeft: 4 },

  filtersContainer: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', padding: 16 },
  filterItem: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, marginBottom: 12, paddingHorizontal: 12 },
  filterIcon: { marginRight: 8 },
  filterInput: { flex: 1, paddingVertical: 10, fontSize: 16, color: '#1f2937' },
  pickerContainer: { flex: 1, position: 'relative' },
  picker: { flex: 1, paddingVertical: 10, fontSize: 16, color: '#1f2937' },
  pickerIcon: { position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -8 }] },

  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  // add horizontal gap between paired buttons
  buttonGroupGutter: { marginHorizontal: -6 },
  filterButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  filterButtonSpacer: { marginHorizontal: 6 },
  activeFeeButton: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7' },
  inactiveFeeButton: { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' },
  activeDueButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#f87171' },
  activeStatusButton: { backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#6ee7b7' },
  inactiveStatusButton: { backgroundColor: '#f6f3f3ff', borderWidth: 1, borderColor: '#d1d5db' },
  inactiveStatusSelectedButton: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#f87171' },
  activeButtonText: { fontSize: 14, fontWeight: '500', color: '#047857' },
  inactiveButtonText: { fontSize: 14, color: '#4b5563' },

  bulkActionsContainer: { backgroundColor: '#eff6ff', borderBottomWidth: 1, borderBottomColor: '#bfdbfe', paddingVertical: 12, paddingHorizontal: 16 },
  bulkActionLabel: { fontSize: 14, color: '#1e40af', marginRight: 8, alignSelf: 'center' },
  bulkActionButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2
  },
  bulkActionButtonText: { fontSize: 14, color: '#fff' },
  divider: { width: 1, height: 24, backgroundColor: '#bfdbfe', marginHorizontal: 8 },

  // listContent: { paddingBottom: 120 },
  studentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(209,213,219,0.8)' },
  selectedRow: { backgroundColor: '#eff6ff' },
  selectionMode: { paddingLeft: 12 },
  clickableRow: {},
  checkboxContainer: { marginRight: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 9999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  checkboxUnselected: { borderColor: '#d1d5db' },

  studentContent: { flex: 1 },
  studentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  studentNameContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', },
  studentName: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginRight: 8 },
  genderBadge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  maleBadge: { backgroundColor: '#dbeafe' },
  femaleBadge: { backgroundColor: '#fce7f3' },
  otherBadge: { backgroundColor: '#f3f4f6' },
  genderText: { fontSize: 12, fontWeight: '500', color: '#1f2937' },
  studentClass: { fontSize: 14, color: '#6b7280', },

  studentDetails: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  mobileContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  mobileText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
  statusBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 9999, },
  statusBadgeSpacer: { marginRight: 12 }, // increased spacing between badges
  dueBadge: { backgroundColor: '#fef2f2' },
  paidBadge: { backgroundColor: '#ecfdf5' },
  activeBadge: { backgroundColor: '#ecfdf5' },
  inactiveBadge: { backgroundColor: '#fce7f3' },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#1f2937' },
  paidStatusText: { color: '#007a55' },
  dueStatusText: { color: '#ce0005' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  emptyIcon: { width: 96, height: 96, borderRadius: 9999, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: '#374151', marginBottom: 4 },
  emptyText: { fontSize: 14, color: '#6b7280', textAlign: 'center', maxWidth: 280 },

  fabContainer: { position: 'absolute', bottom: 100, right: 16, flexDirection: 'column', alignItems: 'flex-end', zIndex: 20 },
  fab: {
    width: 56, height: 56, borderRadius: 9999, backgroundColor: '#2563eb', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6, marginBottom: 12
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: Platform.OS === 'ios' ? 'flex-end' : 'center', alignItems: 'center' },
  modalContainer: {
    width: width - 32, maxWidth: 384, backgroundColor: '#fff', borderRadius: Platform.OS === 'ios' ? 24 : 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8
  },
  modalHandle: { width: 32, height: 4, backgroundColor: '#d1d5db', borderRadius: 2, alignSelf: 'center', marginBottom: 8, display: Platform.OS === 'ios' ? 'flex' : 'none' },
  modalCloseButton: { position: 'absolute', top: 16, right: 16, padding: 8, borderRadius: 9999 },
  modalIcon: { width: 64, height: 64, borderRadius: 9999, backgroundColor: '#ffedd5', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginVertical: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', textAlign: 'center', marginBottom: 16 },
  modalText: { fontSize: 16, color: '#374151', textAlign: 'center', marginBottom: 24 },
  modalBold: { fontWeight: '600', color: '#1f2937' },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  modalCancelButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 9999 },
  modalCancelText: { fontSize: 14, fontWeight: '500', color: '#2563eb' },
  modalConfirmButton: {
    paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#2563eb', borderRadius: 9999,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4
  },
  modalConfirmButtonDisabled: { backgroundColor: '#60a5fa' },
  modalConfirmText: { fontSize: 14, fontWeight: '500', color: '#fff' },
  confirmingContainer: { flexDirection: 'row', alignItems: 'center' },

  avatar: { width: 40, height: 40, borderRadius: 9999, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  avatarSkeleton: { width: 40, height: 40, borderRadius: 9999, backgroundColor: '#e5e7eb' },
  skeletonContent: { flex: 1 },
  skeletonLine: { height: 16, backgroundColor: '#e5e7eb', borderRadius: 4, marginBottom: 8, width: '33%' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    // marginHorizontal: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#444'
  }
});

export default Students;
