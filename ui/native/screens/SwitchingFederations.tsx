import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Theme, useTheme } from '@rneui/themed'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    selectActiveFederation,
    setActiveFederationId,
} from '@fedi/common/redux'

import HoloLoader from '../components/ui/HoloLoader'
import { useAppDispatch, useAppSelector } from '../state/hooks'
import { MainNavigatorDrawerParamList } from '../types/navigation'

export type Props = NativeStackScreenProps<
    MainNavigatorDrawerParamList,
    'SwitchingFederations'
>

const SwitchingFederations: React.FC<Props> = ({
    navigation,
    route,
}: Props) => {
    const { theme } = useTheme()
    const { federationId } = route.params
    const dispatch = useAppDispatch()

    const activeFederation = useAppSelector(selectActiveFederation)
    const previousActiveFederation = activeFederation

    useEffect(() => {
        if (
            federationId &&
            previousActiveFederation &&
            federationId !== previousActiveFederation?.id
        ) {
            dispatch(setActiveFederationId(federationId))
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainNavigator' }],
            })
        }
    }, [dispatch, federationId, navigation, previousActiveFederation])

    return (
        <View style={styles(theme).container}>
            <HoloLoader />
        </View>
    )
}

const styles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.lg,
            marginTop: theme.spacing.xl,
        },
    })

export default SwitchingFederations