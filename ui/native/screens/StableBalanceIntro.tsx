import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Text, Theme, useTheme } from '@rneui/themed'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { useNuxStep } from '@fedi/common/hooks/nux'

import HoloGuidance from '../components/ui/HoloGuidance'
import type { RootStackParamList } from '../types/navigation'

export type Props = NativeStackScreenProps<
    RootStackParamList,
    'StableBalanceIntro'
>

const StableBalanceIntro: React.FC<Props> = ({ navigation }: Props) => {
    const { t } = useTranslation()
    const { theme } = useTheme()

    const [, setHasOpenedStabilityPool] = useNuxStep('hasOpenedStabilityPool')

    const style = styles(theme)

    return (
        <View style={style.container}>
            <HoloGuidance
                iconImage={<Text style={style.iconText}>⚖️</Text>}
                title={t('feature.stabilitypool.stable-balance')}
                message={t('feature.stabilitypool.stable-balance-beta')}
                size="small"
            />
            <Button
                title={t('phrases.lets-go')}
                containerStyle={style.continueButton}
                onPress={() => {
                    setHasOpenedStabilityPool()
                    navigation.navigate('StabilityHome')
                }}
            />
        </View>
    )
}

const styles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.xl,
        },
        iconText: {
            fontSize: 24,
        },
        continueButton: {
            width: '100%',
            marginVertical: theme.spacing.md,
        },
    })

export default StableBalanceIntro