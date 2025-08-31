import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RazorpayCheckout from 'react-native-razorpay'
import { CheckCircle, Shield, Zap, Sparkles, BadgeCheck, LogOut, Crown } from 'lucide-react-native'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { updateUser } from '../redux/slice/authSlice'
import { useLogout } from '../Helper/Auth'
import { useHttpRequest } from '../ContextApi/ContextApi'
import { showToast } from '../Helper/Helper'
import { RAZORPAY_API_KEY, APP_NAME } from '@env'
import Loader from '../component/Loader'

const Plan = () => {
  const { httpRequest } = useHttpRequest()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentStep, setPaymentStep] = useState('')
  const [successModal, setSuccessModal] = useState({ open: false, msg: '' })
  const [selectedPlan, setSelectedPlan] = useState(null)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const handleLogout = useLogout()

  // Fetch Plans
  const fetchPlans = async () => {
    setLoading(true)
    try {
      const res = await httpRequest('/plans')
      if (res?.status === 'success') {
        setPlans(res.data || [])
      } else {
        showToast(res?.msg || 'Failed to fetch plans')
      }
    } catch (err) {
      console.error(err)
      showToast('Something went wrong while fetching plans')
    }
    setLoading(false)
  }

  useEffect(() => { fetchPlans() }, [])

  // Subscribe and Open Razorpay
  const handleSubscribe = async (plan) => {
    setSelectedPlan(plan)
    setPaymentLoading(true)
    setPaymentStep('Creating order…')

    try {
      const orderRes = await httpRequest('/payment/order', {
        method: 'POST',
        data: { plan_uuid: plan.uuid }
      })

      if (orderRes?.status !== 'success') {
        showToast(orderRes?.msg || 'Order creation failed')
        setPaymentLoading(false)
        return
      }

      const { order_id, amount } = orderRes
      setPaymentStep('Opening payment gateway…')

      var options = {
        key: RAZORPAY_API_KEY,
        amount: amount,
        currency: 'INR',
        name: APP_NAME,
        description: plan.description,
        order_id: order_id,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile,
        },
        theme: { color: '#6366f1' },
      }

      RazorpayCheckout.open(options)
        .then(async (response) => {
          setPaymentStep('Verifying payment…')
          const verifyRes = await httpRequest('/payment/verify', {
            method: 'POST',
            data: {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              plan_uuid: plan.uuid,
            }
          })

          if (verifyRes?.status === 'success') {
            setSuccessModal({
              open: true,
              msg: verifyRes?.msg || 'Payment successful 🎉',
              transaction_id: verifyRes?.transaction_id
            })
          } else {
            showToast(verifyRes?.msg || 'Payment verification failed')
          }

        })
        .catch((error) => {
          console.log(error)
          showToast('Payment cancelled')
        })
        .finally(() => {
          setPaymentLoading(false)
          setPaymentStep('')
        })

    } catch (err) {
      console.error(err)
      showToast('Subscription failed')
      setPaymentLoading(false)
      setPaymentStep('')
    }
  }

  const paymentVerified = () => {
    dispatch(updateUser({ is_expired: false }))
    setSuccessModal({ open: false, msg: '', transaction_id: '' })

    navigation.reset({
      index: 0,
      routes: [{ name: 'Dashboard' }],
    })
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} style={styles.logoutBtn}>
          <LogOut size={20} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Payment Loader */}
      {selectedPlan && (
        <Loader
          visible={paymentLoading}
          text={paymentStep ? `${paymentStep}` : `Processing ${selectedPlan.description}`}
          blurAmount={10}
        />
      )}


      {/* Success Modal */}
      <Modal visible={successModal.open} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CheckCircle size={40} color="#16a34a" />
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMsg}>{successModal.msg}</Text>
            {successModal.transaction_id && (
              <View style={styles.transactionBox}>
                <Text style={styles.transactionLabel}>Transaction ID</Text>
                <Text style={styles.transactionId}>{successModal.transaction_id}</Text>
              </View>
            )}
            <TouchableOpacity activeOpacity={0.7} style={styles.countdownBtn} onPress={paymentVerified}>
              <Text style={styles.countdownBtnText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </>
        ) : plans.length === 0 ? (
          <View style={styles.noPlans}>
            <Crown size={30} color="#9ca3af" />
            <Text style={styles.noPlansTitle}>No plans available</Text>
          </View>
        ) : (
          plans.map((plan, i) => (
            <View key={plan.id} style={[styles.planCard, i === 1 && styles.popularCard]}>
              {i === 1 && <Text style={styles.popularTag}>POPULAR</Text>}

              <Text style={styles.planTitle}>{plan.description}</Text>
              <Text style={styles.planAmount}>₹{plan.amount} / {plan.months} {plan.months > 1 ? 'months' : 'month'}</Text>

              <TouchableOpacity
                activeOpacity={0.7}
                style={[styles.subscribeBtn, i === 1 && styles.premiumBtn]}
                onPress={() => handleSubscribe(plan)}
              >
                <Text style={i === 1 ? styles.subscribeTextWhite : styles.subscribeText}>
                  {i === 1 ? 'Get Premium' : 'Select Plan'}
                </Text>
              </TouchableOpacity>

              <Feature text="All features included" />
              <Feature text="Priority support" />
              {i >= 1 && <Feature text="Exclusive content" />}
            </View>
          ))
        )}

        {/* Trust Section */}
        <View style={styles.trustContainer}>
          <View style={styles.trustItem}>
            <Shield size={18} color="#6366f1" />
            <Text style={styles.trustText}>Secure payment processing</Text>
          </View>
          <View style={styles.trustItem}>
            <Zap size={18} color="#6366f1" />
            <Text style={styles.trustText}>Instant activation</Text>
          </View>
          <View style={styles.trustItem}>
            <Sparkles size={18} color="#6366f1" />
            <Text style={styles.trustText}>7-day money back guarantee</Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqContainer}>
          <Text style={styles.faqHeader}>Frequently Asked Questions</Text>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
            <Text style={styles.faqAnswer}>Yes, you can cancel your subscription at any time without any cancellation fees.</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What payment methods are accepted?</Text>
            <Text style={styles.faqAnswer}>We accept all major credit cards, debit cards, UPI, and net banking.</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I upgrade or downgrade?</Text>
            <Text style={styles.faqAnswer}>You can change your plan at any time from your account settings.</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const Feature = ({ text }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
    <BadgeCheck size={16} color="#16a34a" />
    <Text style={{ marginLeft: 8 }}>{text}</Text>
  </View>
)

const SkeletonCard = () => (
  <View style={styles.planCard}>
    <View style={[styles.skeletonBox, { width: 150, height: 20, marginBottom: 8 }]} />
    <View style={[styles.skeletonBox, { width: 120, height: 24, marginBottom: 12 }]} />
    <View style={[styles.skeletonBox, { width: '100%', height: 40, marginBottom: 12, borderRadius: 12 }]} />
    <View style={[styles.skeletonBox, { width: 180, height: 16, marginBottom: 6 }]} />
    <View style={[styles.skeletonBox, { width: 140, height: 16, marginBottom: 6 }]} />
    <View style={[styles.skeletonBox, { width: 160, height: 16 }]} />
  </View>
)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoutText: { fontSize: 14, color: '#1e293b' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  modalMsg: { fontSize: 14, color: '#374151', textAlign: 'center' },
  transactionBox: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 12, marginVertical: 8, width: '100%' },
  transactionLabel: { fontSize: 10, color: '#6b7280' },
  transactionId: { fontFamily: 'monospace', fontSize: 12, color: '#1f2937' },
  countdownBtn: { backgroundColor: '#16a34a', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, marginTop: 12 },
  countdownBtnText: { color: '#fff', fontWeight: 'bold' },

  scrollContent: { padding: 16, paddingBottom: 80 },
  planCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  popularCard: { shadowColor: '#6366f1', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6 },
  popularTag: { position: 'absolute', top: 0, right: 0, backgroundColor: '#f59e0b', paddingHorizontal: 8, paddingVertical: 2, borderBottomLeftRadius: 12, color: '#fff', fontSize: 10, fontWeight: 'bold' },
  planTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  planAmount: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  subscribeBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 12, backgroundColor: '#e5e7eb' },
  premiumBtn: { backgroundColor: '#6366f1' },
  subscribeTextWhite: { color: '#fff', fontWeight: 'bold' },
  subscribeText: { color: '#1e293b', fontWeight: 'bold' },
  noPlans: { alignItems: 'center', marginTop: 40 },
  noPlansTitle: { fontSize: 16, fontWeight: '600', marginTop: 8, color: '#6b7280' },

  trustContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  trustText: { fontSize: 14, color: '#374151' },

  faqContainer: { paddingHorizontal: 2, paddingVertical: 24 },
  faqHeader: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  faqItem: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 12 },
  faqQuestion: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
  faqAnswer: { fontSize: 14, color: '#4b5563' },

  skeletonBox: { backgroundColor: '#e5e7eb', borderRadius: 8 },
})

export default Plan
