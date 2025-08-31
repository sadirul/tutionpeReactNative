import 'react-native-gesture-handler'
import React, { useEffect } from 'react'
import { StatusBar } from 'react-native'
import MainNavigator from './src/Navigator/MainNavigator'
import KeepAwake from 'react-native-keep-awake'
import changeNavigationBarColor from 'react-native-navigation-bar-color'
import { PaperProvider, useTheme } from 'react-native-paper'
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { store, persistor } from "./src/redux/store"
import NoInternetModal from './src/Components/NoInternetModal'

const AppWrapper = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider>
          <App />
        </PaperProvider>
      </PersistGate>
    </Provider>
  )
}

const App = () => {
  const { colors, dark } = useTheme()

  useEffect(() => {
    changeNavigationBarColor('white', true) 
  }, [])

  if (__DEV__) {
    KeepAwake.activate();
  }

  return (
    <>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={dark ? 'light-content' : 'dark-content'}
      />
        <MainNavigator />
        <NoInternetModal />
    </>
  )
}

export default AppWrapper
