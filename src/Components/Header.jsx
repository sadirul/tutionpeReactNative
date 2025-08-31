import React, { useState } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TouchableWithoutFeedback,
    Platform,
    StatusBar,
    SafeAreaView,
} from "react-native"
import { useSelector } from "react-redux"
import { useNavigation } from "@react-navigation/native"
import { User, Settings, LogOut, ChevronDown, GraduationCap } from "lucide-react-native"
import { useLogout } from "../Helper/Auth"
import { getAvatarText, ucFirst } from "../Helper/Helper"
import { APP_NAME } from "@env"
import LinearGradient from "react-native-linear-gradient"

export const Header = ({ title }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const navigation = useNavigation()
    const logout = useLogout()
    const user = useSelector((state) => state.auth.user)

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => {
            const newState = !prev
            return newState
        })
    }

    // Fallback status bar height for Android
    const statusBarHeight = Platform.OS === "android" ? (StatusBar.currentHeight || 24) : 0

    return (
        <View style={[styles.container, { paddingTop: statusBarHeight }]}>
            {/* Left: Logo + Title */}
            <View style={styles.leftSection}>
                <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate("Dashboard")}>
                    <LinearGradient
                        colors={['#6366F1', '#9333EA']}   // Indigo → Purple
                        start={{ x: 0, y: 0 }}            // left
                        end={{ x: 1, y: 0 }}              // right
                        style={styles.logoBox}
                    >
                        <GraduationCap color="white" size={22} />
                    </LinearGradient>
                </TouchableOpacity>

                <View style={{ marginLeft: 8 }}>
                    <Text style={styles.titleText}>
                        {title || APP_NAME || "Student Management"}
                    </Text>
                    <Text style={styles.subtitleText}>Manage your students efficiently</Text>
                </View>
            </View>

            {/* Right: User Dropdown */}
            {user ? (
                <>
                    <TouchableOpacity
                        style={[
                            styles.userButton,
                            { borderWidth: 1, borderColor: isDropdownOpen ? '#715eff' : 'transparent' }
                        ]}
                        onPress={toggleDropdown}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <View style={styles.avatar}>
                            <LinearGradient
                                colors={['#6366F1', '#9333EA']}   // Indigo → Purple gradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.avatarGradient}
                            >
                                <Text style={styles.avatarText}>
                                    {getAvatarText(user.name || "")}
                                </Text>
                            </LinearGradient>
                        </View>

                        <View style={{ marginRight: 6 }} />
                        <ChevronDown
                            size={16}
                            color="#555"
                            style={{ transform: [{ rotate: isDropdownOpen ? "180deg" : "0deg" }] }}
                        />
                    </TouchableOpacity>

                    <Modal
                        transparent={true}
                        visible={isDropdownOpen}
                        animationType="fade"
                        onRequestClose={() => {
                            setIsDropdownOpen(false)
                        }}
                    >
                        <TouchableWithoutFeedback
                            onPress={() => {
                                setIsDropdownOpen(false)
                            }}
                        >
                            <View style={styles.modalOverlay}>
                                <TouchableWithoutFeedback>
                                    <View style={styles.dropdown}>
                                        {/* <Text style={styles.debugText}>Dropdown Rendered</Text> */}
                                        <View style={styles.dropdownHeader}>
                                            <Text style={styles.dropdownName}>
                                                {user.name || "Unknown User"}
                                            </Text>
                                            <Text style={styles.dropdownEmail}>
                                                {user.email || "No email"}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setIsDropdownOpen(false)
                                                navigation.navigate("Profile")
                                            }}
                                        >
                                            <User size={16} color="#444" />
                                            <Text style={styles.dropdownText}>Profile</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setIsDropdownOpen(false)
                                                navigation.navigate("Settings")
                                            }}
                                        >
                                            <Settings size={16} color="#444" />
                                            <Text style={styles.dropdownText}>Settings</Text>
                                        </TouchableOpacity>

                                        <View style={styles.divider} />

                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setIsDropdownOpen(false)
                                                logout()
                                            }}
                                        >
                                            <LogOut size={16} color="red" />
                                            <Text style={[styles.dropdownText, { color: "red" }]}>
                                                Logout
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </>
            ) : (
                <Text style={styles.noUserText}>No user data</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        paddingHorizontal: 12,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
    },
    logoBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#4f46e5",
        justifyContent: "center",
        alignItems: "center",
    },
    titleText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#111",
    },
    subtitleText: {
        fontSize: 12,
        color: "#666",
    },
    userButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 20,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: "hidden",
        marginRight: 6,
    },
    avatarGradient: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
    },
    avatarText: {
        color: "white",
        fontWeight: "600",
        fontSize: 12,
    },

    userName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#222",
    },
    userRole: {
        fontSize: 12,
        color: "#666",
    },
    modalOverlay: {
        flex: 1,
        // backgroundColor: "rgba(0,0,0,0.3)", // Increased opacity for visibility
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },
    dropdown: {
        width: 220, // Slightly wider for better visibility
        backgroundColor: "white",
        borderRadius: 12,
        paddingVertical: 8,
        marginTop: 50, // Adjusted to position below header
        marginRight: 8,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    dropdownHeader: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    dropdownName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111",
    },
    dropdownEmail: {
        fontSize: 12,
        color: "#666",
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    dropdownText: {
        fontSize: 14,
        color: "#333",
        marginLeft: 8,
    },
    divider: {
        borderTopWidth: 1,
        borderColor: "#eee",
        marginVertical: 6,
    },
    noUserText: {
        fontSize: 14,
        color: "#666",
    },
    debugText: {
        fontSize: 12,
        color: "red",
        padding: 4,
        textAlign: "center",
    },
})