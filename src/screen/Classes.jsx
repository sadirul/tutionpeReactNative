import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  RefreshControl,
  StyleSheet,
  Platform,
} from "react-native";
import { GraduationCap, BookOpen, Plus, ChevronRight, X, Edit } from "lucide-react-native";
import * as Yup from "yup";
import { Header } from "../Components/Header";
import { useHttpRequest } from "../ContextApi/ContextApi";
import LinearGradient from "react-native-linear-gradient";
import { BottomNavigation } from "./navigation/BottomNavigation";
import { showToast } from "../Helper/Helper";
import { PRICE_SYMBOL } from "@env";

const Classes = ({ navigation }) => {
  const { httpRequest } = useHttpRequest();
  const [classes, setClasses] = useState([]);
  const [focusedField, setFocusedField] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formValues, setFormValues] = useState({ className: "", fee: "" });
  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Yup validation schema
  const validationSchema = Yup.object({
    className: Yup.string().required("Class name is required"),
    fee: Yup.number()
      .typeError("Fee must be a number")
      .required("Fee is required")
      .positive("Fee must be a positive number"),
  });

  // Fetch classes from API
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await httpRequest("/class/index");
      if (response.status === "success") {
        setClasses(response.data);
      } else {
        console.warn("Failed to fetch classes:", response.msg);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await validationSchema.validate(formValues, { abortEarly: false });
      setErrors({});

      const endpoint = modalMode === "add" ? "/class/store" : `/class/edit/${selectedClass?.uuid}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const response = await httpRequest(endpoint, {
        method,
        data: {
          class_name: formValues.className,
          fee: Number(formValues.fee), // Changed from parseFloat() to Number()
        },
      });

      if (response.status === "success") {
        showToast(response?.msg || `Class updated successfully`);
        fetchClasses();
        closeModal();
      } else {
        console.warn(`Failed to ${modalMode === "add" ? "add" : "update"} class:`, response.msg);
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        const formattedErrors = {};
        error.inner.forEach((err) => {
          formattedErrors[err.path] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        console.error(`Error ${modalMode === "add" ? "adding" : "updating"} class:`, error);
      }
    }
    setSubmitting(false);
  };

  const handleClassClick = (cls) => {
    navigation.navigate("Students", { className: cls.class_name });
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormValues({ className: "", fee: "" });
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (cls) => {
    setModalMode("edit");
    setSelectedClass(cls);
    setFormValues({ 
      className: cls.class_name, 
      fee: cls.fee ? (Number(cls.fee) % 1 === 0 ? Number(cls.fee).toString() : cls.fee.toString()) : "" 
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormValues({ className: "", fee: "" });
    setErrors({});
    setSelectedClass(null);
  };

  return (
    <View style={styles.container}>
      <Header title="Manage Classes" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={["#6366F1", "#9333EA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoBox}
            >
              <GraduationCap color="white" size={22} />
            </LinearGradient>
            <Text style={styles.title}>Your Classes</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={openAddModal} style={styles.addButton}>
            <Plus size={16} color="#2563eb" />
            <Text style={styles.addButtonText}>Add Class</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4].map((n) => (
              <View key={n} style={styles.skeletonCard}>
                <View style={styles.skeletonIcon} />
                <View style={{ flex: 1 }}>
                  <View style={styles.skeletonLine} />
                  <View style={[styles.skeletonLine, { width: "50%", marginTop: 6 }]} />
                </View>
              </View>
            ))}
          </View>
        ) : classes.length === 0 ? (
          <TouchableOpacity activeOpacity={0.7} onPress={openAddModal} style={styles.emptyCard}>
            <BookOpen size={40} color="#9ca3af" />
            <Text style={styles.emptyText}>No classes added yet</Text>
            <Text style={styles.emptySub}>
              <Plus size={14} color="#2563eb" /> Add your first class
            </Text>
          </TouchableOpacity>
        ) : (
          classes.map((cls) => (
            <View key={cls.id} style={styles.classCard}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                onPress={() => handleClassClick(cls)}
              >
                <View style={styles.classIcon}>
                  <BookOpen size={20} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.classTitle}>{cls.class_name}</Text>
                  <View style={styles.classDetails}>
                    {cls.fee && (
                      <Text style={styles.feeText}>Fee: {PRICE_SYMBOL}{Number(cls.fee).toFixed(2)}</Text>
                    )}
                    <Text style={styles.studentCount}>{cls.students_count} students</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openEditModal(cls)}
                style={styles.editButton}
              >
                <Edit size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      <BottomNavigation />

      {/* Reusable Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIcon}>
                {modalMode === "add" ? (
                  <Plus size={20} color="white" />
                ) : (
                  <Edit size={20} color="white" />
                )}
              </View>
              <Text style={styles.modalTitle}>
                {modalMode === "add" ? "Add New Class" : "Edit Class"}
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={closeModal}>
                <X size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              value={formValues.className}
              onChangeText={(text) =>
                setFormValues({ ...formValues, className: text })
              }
              onFocus={() => setFocusedField("className")}
              onBlur={() => setFocusedField("")}
              placeholder="Class Name"
              style={[
                styles.input,
                errors.className
                  ? { borderColor: "red", shadowColor: "#ffffffff" }
                  : focusedField === "className"
                    ? { borderColor: "#2563eb", shadowColor: "#ffffffff", shadowOpacity: 0.2 }
                    : {},
              ]}
              accessibilityLabel="Class name input"
              accessibilityHint={
                modalMode === "add"
                  ? "Enter the name of the new class"
                  : "Edit the name of the class"
              }
            />
            {errors.className && (
              <Text style={styles.errorText}>{errors.className}</Text>
            )}

            <TextInput
              value={formValues.fee}
              onChangeText={(text) => setFormValues({ ...formValues, fee: text })}
              onFocus={() => setFocusedField("fee")}
              onBlur={() => setFocusedField("")}
              placeholder="Monthly Fee"
              keyboardType="numeric"
              style={[
                styles.input,
                errors.fee
                  ? { borderColor: "red", shadowColor: "#ffffffff" }
                  : focusedField === "fee"
                    ? { borderColor: "#2563eb", shadowColor: "#ffffffff", shadowOpacity: 0.2 }
                    : {},
              ]}
              accessibilityLabel="Monthly fee input"
              accessibilityHint={
                modalMode === "add"
                  ? "Enter the monthly fee for the class"
                  : "Edit the monthly fee for the class"
              }
            />
            {errors.fee && <Text style={styles.errorText}>{errors.fee}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={closeModal}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={submitting}
                onPress={handleSubmit}
                style={[styles.addBtn, submitting && { backgroundColor: "#d1d5db" }]}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.addBtnText}>
                    {modalMode === "add" ? "Add Class" : "Save Changes"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scrollContent: { padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#111827", marginLeft: 8 },
  addButton: { flexDirection: "row", alignItems: "center" },
  addButtonText: { marginLeft: 4, color: "#2563eb", fontWeight: "500" },
  skeletonContainer: { gap: 12 },
  skeletonCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  skeletonIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#e5e7eb", marginRight: 12 },
  skeletonLine: { height: 12, backgroundColor: "#e5e7eb", borderRadius: 6, width: "70%" },
  emptyCard: { backgroundColor: "white", borderRadius: 16, padding: 20, alignItems: "center", marginTop: 20, elevation: 2 },
  emptyText: { color: "#6b7280", marginTop: 8 },
  emptySub: { color: "#2563eb", marginTop: 4, fontSize: 12 },
  classCard: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "white", borderRadius: 12, marginBottom: 12, elevation: 1 },
  classIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center", marginRight: 12 },
  classTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  classDetails: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  feeText: { fontSize: 12, color: "#2563eb", backgroundColor: "#e0f2fe", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  studentCount: { fontSize: 12, color: "#6b7280" },
  editButton: { padding: 8 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", marginRight: 8 },
  modalTitle: { flex: 1, fontSize: 16, fontWeight: "600", color: "#111827", marginLeft: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    shadowColor: "#ffffffff",
    padding: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  errorText: { color: "red", fontSize: 12, marginBottom: 8 },
  modalActions: { flexDirection: "row", justifyContent: "space-between" },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, padding: 12, alignItems: "center", marginRight: 8 },
  cancelText: { color: "#374151" },
  addBtn: { flex: 1, borderRadius: 10, padding: 12, alignItems: "center", backgroundColor: "#2563eb" },
  addBtnText: { color: "white", fontWeight: "600" },
});

export default Classes;