import { ToastAndroid } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const setStorage = async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value))
}

export const getStorage = async (key) => {
    const value = await AsyncStorage.getItem(key)
    return JSON.parse(value)
}

export const formatTime = (dateString, type = 'time') => {
    const date = new Date(dateString)
    let formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()
    const formattedDate = `${day}/${month}/${year}`
    if (type == 'datetime') {
        formattedTime = `${formattedDate} ${formattedTime}`
    } else if (type == 'date') {
        formattedTime = formattedDate
    }

    return formattedTime
}

export const isToday = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()

    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}

export const calculateTransactionSum = (transactions) => {
    return transactions.reduce((acc, curr) => {
        acc.bill_amount += parseFloat(curr.bill_amount)
        acc.paid_amount += parseFloat(curr.paid_amount)
        return acc
    }, { bill_amount: 0, paid_amount: 0 })
}



export const getStatusColor = (status) => {
    switch (status) {
        case 'Present':
            return '#28a745'
        case 'Absent':
            return '#dc3545'
        case 'Late':
            return '#ffc107'
        case 'Leave':
            return '#007bff'
        default:
            return '#ccc'
    }
}

export const formatCurrency = (number) => {
    return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')
}



export const isItemReadOnly = (orderItems, item) => {
    return orderItems.status === 1 || orderItems.status === 5 || item.status === 1 || item.status === 5
}

export const getExpiryDays = (expiryDate) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const timeDiff = expiry.getTime() - today.getTime()
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
    return dayDiff
}

export const getExpirationText = (expiryDate) => {
    let returnText = ``
    const expireInDays = getExpiryDays(expiryDate)
    if (expireInDays < 10 && expireInDays > 2) {
        returnText = `Expire in  ${expireInDays} days`
    } else if (expireInDays == 2) {
        returnText = `Expire tomorrow`
    } else if (expireInDays == 1) {
        returnText = `Expire today at  ${formatTime(expiryDate)}`
    } else {
        returnText = formatTime(expiryDate, 'datetime')
    }

    return returnText
}

export const ucFirst = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export const getDepartmentHelper = (user) => {
    return user?.institute?.institute_type == 'college' ? 'Department' : 'Class'
}

export const getSemesterHelper = (user) => {
    return user?.institute?.institute_type == 'college' ? 'Semester' : 'Section'
}

export const formatedDate = (now) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' }
    const formattedDate = now.toLocaleDateString('en-CA', options)
    return formattedDate
}

export const getMonthName = (month) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[month - 1] || ''
}

export const hasEventThisMonth = (calendarEvents) => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const monthStart = new Date(currentYear, currentMonth, 1)
    const monthEnd = new Date(currentYear, currentMonth + 1, 0)

    return calendarEvents.some(event => {
        const startDate = new Date(event.start)
        const endDate = new Date(event.end)

        return startDate <= monthEnd && endDate >= monthStart
    })
}

export const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
    return date.toLocaleDateString('en-US', options)
}

export const getAvatarText = (name = "") => {
    if (!name) return "";
    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase();
};

export const showToast = (message) => {
    if (Platform.OS === 'android') {
        ToastAndroid.show(message, ToastAndroid.SHORT)
    } else {
        // console.log('Toast:', message)
    }
}