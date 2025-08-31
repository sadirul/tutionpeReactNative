import { getStorage } from '../Helper/Helper'
import { logout as ReduxLogout } from '../redux/slice/authSlice'
import { useDispatch } from 'react-redux'
import { API_URL, SHOW_ALL_REQUEST_URL } from '@env'

export const useHttpRequest = () => {
    const dispatch = useDispatch()
    
    
    const httpRequest = async (url, { method = 'GET', data = null, headers = {} } = {}) => {
        try {
            console.log('API_URL', API_URL);
            const options = {
                method,
                headers: {
                    'Authorization': await getStorage('access_token'),
                    ...headers,
                },
            }

            if (method !== 'GET' && method !== 'HEAD') {
                if (data instanceof FormData) {
                    options.body = data
                } else {
                    options.headers['Content-Type'] = 'application/json'
                    options.body = JSON.stringify(data)
                }
            }

            const requestURL = `${API_URL}${url}`
            console.log(requestURL)
            if (SHOW_ALL_REQUEST_URL === 'true') {
                console.log(requestURL)
            }

            const response = await fetch(requestURL, options)
            const result = await response.json()

            if (response.status === 401 || response.status === 500) {
                dispatch(ReduxLogout())
                return { status: 'error', msg: result?.msg, data: [] }
            }

            if (!response.ok) {
                return {
                    status: 'error',
                    msg: result.msg || `Request failed with status ${response.status}!`,
                }
            }

            return result
        } catch (error) {
            console.log('Error:', error, url)
            return {
                status: 'error',
                msg: 'error',
            }
        }
    }

    return { httpRequest }
}
