import { useNavigation } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Theme, useTheme } from '@rneui/themed'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    selectAuthenticatedMember,
    selectHasSetMatrixDisplayName,
} from '@fedi/common/redux'
import { selectHasLoadedFromStorage } from '@fedi/common/redux/storage'

import SvgImage, { SvgImageSize } from '../components/ui/SvgImage'
import { useAppSelector } from '../state/hooks'
import {
    NavigationArgs,
    NavigationHook,
    RootStackParamList,
} from '../types/navigation'
import { useIsFeatureUnlocked } from '../utils/hooks/security'

export type Props = NativeStackScreenProps<RootStackParamList, 'Initializing'>

// TODO: Replace this entire screen with FediBridgeInitializer
const Initializing: React.FC<Props> = () => {
    const navigation = useNavigation<NavigationHook>()
    const { theme } = useTheme()
    const authenticatedMember = useAppSelector(selectAuthenticatedMember)
    const hasSetDisplayName = useAppSelector(selectHasSetMatrixDisplayName)
    const hasStorageLoaded = useAppSelector(selectHasLoadedFromStorage)
    const isAppUnlocked = useIsFeatureUnlocked('app')

    const hasLoaded = hasStorageLoaded
    const hasLegacyChatData = !!authenticatedMember

    // once everything has loaded, determine where to navigate
    useEffect(() => {
        if (!hasLoaded || isAppUnlocked === undefined) return

        let destination: NavigationArgs = ['TabsNavigator']

        // make sure there is a display name before navigating to Home
        if (!hasSetDisplayName && !hasLegacyChatData) {
            // Otherwise, go Home
            destination = ['Splash']
        }

        // If PIN-protected, navigate to the Lock Screen
        if (!isAppUnlocked) {
            return navigation.replace('LockScreen', {
                routeParams: destination,
            })
        }

        navigation.replace(...destination)
    }, [
        hasLegacyChatData,
        hasLoaded,
        hasSetDisplayName,
        navigation,
        isAppUnlocked,
    ])

    return (
        <View style={styles(theme).container}>
            <SvgImage size={SvgImageSize.lg} name="FediLogoIcon" />
        </View>
    )
}

const styles = (_: Theme) =>
    StyleSheet.create({
        container: {
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        },
        imageBackground: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
    })

export default Initializing