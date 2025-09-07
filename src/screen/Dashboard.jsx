import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Linking, ScrollView,
  RefreshControl, BackHandler
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useHttpRequest } from '../ContextApi/ContextApi';
import { Users, CreditCard, Mail, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { Header } from '../Components/Header';
import DashboardStatCard from '../component/DashboardStatCard';
import LinearGradient from 'react-native-linear-gradient';
import { BottomNavigation } from './navigation/BottomNavigation';
import { showToast } from '../Helper/Helper';
import FeesGenerateModal from '../modal/FeesGenerateModal';
import { PRICE_SYMBOL } from '@env';

const Dashboard = () => {
  const navigation = useNavigation();
  const { httpRequest } = useHttpRequest();
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [monthlyFeeLoading, setMonthlyFeeLoading] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalActiveStudents: 0,
    totalInactiveStudents: 0,
    feesDue: 0,
    totalClasses: 0,
    fees_due_this_month: 0,
    fees_paid_this_month: 0,
  });
  // Initialize currentDate to the first day of the previous month
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  });

  // ✅ back press logic
  const [backPressedOnce, setBackPressedOnce] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (backPressedOnce) {
          BackHandler.exitApp();
          return true;
        }

        setBackPressedOnce(true);
        showToast('Press back again to exit');

        setTimeout(() => {
          setBackPressedOnce(false);
        }, 1500);

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [backPressedOnce])
  );

  // 📌 get displayed month dynamically
  const getDisplayMonth = () => {
    return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // 📌 check if the previous month is being displayed
  const isCurrentMonth = () => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return currentDate.getMonth() === previousMonth.getMonth() &&
      currentDate.getFullYear() === previousMonth.getFullYear();
  };

  const handleCardClick = async (path) => {
    if (path === 'generateFees') {
      setShowFeeModal(true);
    } else if (path === 'Students') {
      navigation.navigate('Students', { status: 'active' });
    } else if (path === 'InactiveStudents') {
      navigation.navigate('Students', { status: 'inactive' });
    } else if (path === 'feeStatus') {
      navigation.navigate('Students', { feeStatus: 'due' });
    } else {
      navigation.navigate(path);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await httpRequest('/dashboard');
      if (response?.status === 'success') {
        const d = response.data || {};
        setStats({
          totalActiveStudents: d.total_active_students ?? 0,
          totalInactiveStudents: d.total_inactive_students ?? 0,
          totalClasses: d.total_classes ?? 0,
          feesDue: d.total_fees_due ?? 0,
          fees_due_this_month: d.fees_due_this_month ?? 0,
          fees_paid_this_month: d.fees_paid_this_month ?? 0,
        });
      } else {
        showToast(response?.msg || 'Failed to fetch dashboard');
      }
    } catch (err) {
      console.error(err);
      showToast('Something went wrong while fetching dashboard');
    }
    setLoading(false);
  };

  const fetchMonthlyFeeAmount = async (year, month) => {
    setMonthlyFeeLoading(true);
    try {
      const response = await httpRequest(`/dashboard/monthly-collection?year=${year}&month=${month + 1}`);
      if (response?.status === 'success') {
        setStats(prev => ({
          ...prev,
          fees_due_this_month: response.data.fees_due_this_month ?? 0,
          fees_paid_this_month: response.data.fees_paid_this_month ?? 0,
        }));
      } else {
        showToast(response?.msg || 'Failed to fetch monthly fee data');
      }
    } catch (err) {
      console.error(err);
      showToast('Something went wrong while fetching monthly fee data');
    }
    setMonthlyFeeLoading(false);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    fetchMonthlyFeeAmount(newDate.getFullYear(), newDate.getMonth());
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    fetchMonthlyFeeAmount(newDate.getFullYear(), newDate.getMonth());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <View style={styles.container}>
      <Header title="Dashboard" />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
        }
      >
        {/* Banner */}
        <LinearGradient
          colors={['#6366F1', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.banner}
        >
          <Text style={styles.bannerTitle}>Welcome back!</Text>
          <Text style={styles.bannerSubtitle}>Here's your daily overview</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.grid}>
          <DashboardStatCard
            title="Students"
            value={stats.totalActiveStudents}
            loading={loading}
            icon={Users}
            subtitle="Stay Curious Always"
            subtitleColor="green"
            onPress={() => handleCardClick('Students')}
          />

          <DashboardStatCard
            title="Past Students"
            value={stats.totalInactiveStudents}
            loading={loading}
            icon={Users}
            iconColor='#eb252e'
            iconBg='#ffe2e2'
            subtitle="Missing our old champs"
            subtitleColor="red"
            onPress={() => handleCardClick('InactiveStudents')}
          />

          <DashboardStatCard
            title="Fees Due"
            value={stats.feesDue}
            loading={loading}
            iconName='wallet'
            iconColor='#e17100'
            iconBg='#fef3c6'
            subtitle={stats.feesDue > 0 ? 'Urgent' : 'All Clear'}
            subtitleColor={stats.feesDue > 0 ? 'red' : 'green'}
            onPress={() => handleCardClick('feeStatus')}
          />

          <DashboardStatCard
            title="Total Classes"
            value={stats.totalClasses}
            loading={loading}
            iconName='book-open'
            iconColor='#009966'
            iconBg='#d0fae5'
            subtitle="Running"
            subtitleColor="gray"
            onPress={() => handleCardClick('Classes')}
          />

          <View style={styles.navigationContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.navButton}
              onPress={handlePreviousMonth}
            >
              <ChevronLeft color="#374151" size={16} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.navButton, isCurrentMonth() && styles.disabledButton]}
              onPress={isCurrentMonth() ? undefined : handleNextMonth}
              disabled={isCurrentMonth()}
            >
              <ChevronRight color="#374151" size={16} />
            </TouchableOpacity>
          </View>

          <DashboardStatCard
            title={`Due Amount (${getDisplayMonth()})`}
            value={`${PRICE_SYMBOL}${stats.fees_due_this_month}`}
            loading={loading || monthlyFeeLoading}
            iconName='trending-down'
            iconColor='#eb252e'
            iconBg='#ffe2e2'
            subtitle={stats.fees_due_this_month > 0 ? 'Urgent' : 'No dues'}
            subtitleColor="red"
          />

          <DashboardStatCard
            title={`Paid Amount (${getDisplayMonth()})`}
            value={`${PRICE_SYMBOL}${stats.fees_paid_this_month}`}
            loading={loading || monthlyFeeLoading}
            iconName='trending-up'
            iconColor='#009966'
            iconBg='#d0fae5'
            subtitle="Collected"
            subtitleColor="green"
          />
        </View>

        {/* Actions */}
        <View style={styles.grid}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCardClick('generateFees')}
            style={[styles.actionButton, { backgroundColor: '#D97706' }]}
          >
            <View style={styles.row}>
              <CreditCard color="white" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.actionText}>Generate Fees</Text>
            </View>
            <ChevronRight color="white" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              Linking.openURL(
                `https://wa.me/918918828565?text=Hi%0AI am ${encodeURIComponent(user.name)} from ${encodeURIComponent(user.tuition_name)}`
              )
            }
            style={[styles.actionButton, { backgroundColor: '#16A34A' }]}
          >
            <View style={styles.row}>
              <Mail color="white" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.actionText}>Contact Us</Text>
            </View>
            <ChevronRight color="white" size={16} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FeesGenerateModal
        showFeeModal={showFeeModal}
        setShowFeeModal={setShowFeeModal}
        fetchDashboard={fetchDashboard}
      />
      <BottomNavigation />
    </View>
  );
};

export default Dashboard;

// ----------------- Styles -----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  content: {
    padding: 16,
  },
  banner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannerSubtitle: {
    color: 'white',
    opacity: 0.9,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  navButton: {
    backgroundColor: '#D1FAE5',
    borderRadius: 20,
    padding: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
});