import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Theme } from '@rneui/themed'
import { useTheme } from '@rneui/themed'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Keyboard, StyleSheet, View } from 'react-native'
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context'

import {
    useBalanceDisplay,
    useAmountFormatter,
} from '@fedi/common/hooks/amount'
import { useFeeDisplayUtils } from '@fedi/common/hooks/transactions'
import { Sats } from '@fedi/common/types'
import amountUtils from '@fedi/common/utils/AmountUtils'
import { hexToRgba } from '@fedi/common/utils/color'
import { makeLog } from '@fedi/common/utils/log'

import FeeOverlay from '../components/feature/send/FeeOverlay'
import SendAmounts from '../components/feature/send/SendAmounts'
import SendPreviewDetails from '../components/feature/send/SendPreviewDetails'
import { useBridge } from '../state/hooks'
import type { RootStackParamList } from '../types/navigation'

const log = makeLog('ConfirmSendEcash')

export type Props = NativeStackScreenProps<
    RootStackParamList,
    'ConfirmSendEcash'
>

const ConfirmSendEcash: React.FC<Props> = ({ route, navigation }) => {
    const { theme } = useTheme()
    const insets = useSafeAreaInsets()
    const { t } = useTranslation()
    const { amount } = route.params
    const [showFeeBreakdown, setShowFeeBreakdown] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const { generateEcash } = useBridge()
    const balanceDisplay = useBalanceDisplay(t)
    const { feeBreakdownTitle, ecashFeesGuidanceText, makeEcashFeeContent } =
        useFeeDisplayUtils(t)
    const { formattedTotalFee, feeItemsBreakdown } = makeEcashFeeContent(
        amountUtils.satToMsat(amount),
    )
    const { makeFormattedAmountsFromSats } = useAmountFormatter()
    const { formattedPrimaryAmount, formattedSecondaryAmount } =
        makeFormattedAmountsFromSats(amount)

    const handleSend = useCallback(async () => {
        Keyboard.dismiss()
        setIsLoading(true)
        try {
            const millis = amountUtils.satToMsat(Number(amount) as Sats)
            const { ecash } = await generateEcash(millis)
            navigation.navigate('SendOfflineQr', { ecash, amount: millis })
        } catch (error) {
            log.error('onGenerateEcash', error)
        }
        setIsLoading(false)
    }, [amount, generateEcash, navigation])

    const handleConfirm = useCallback(() => {
        Alert.alert(
            t('phrases.please-confirm'),
            t('feature.send.offline-send-warning'),
            [
                {
                    text: t('phrases.go-back'),
                },
                {
                    text: t('words.continue'),
                    onPress: handleSend,
                },
            ],
        )
    }, [handleSend, t])

    const style = styles(theme, insets)

    return (
        <View style={style.container}>
            <SendAmounts
                balanceDisplay={balanceDisplay}
                formattedPrimaryAmount={formattedPrimaryAmount}
                formattedSecondaryAmount={formattedSecondaryAmount}
            />
            <SendPreviewDetails
                onPressFees={() => setShowFeeBreakdown(true)}
                formattedTotalFee={formattedTotalFee}
                onSend={handleConfirm}
                isLoading={isLoading}
                senderText={t('feature.stabilitypool.bitcoin-balance')}
            />
            <FeeOverlay
                show={showFeeBreakdown}
                onDismiss={() => setShowFeeBreakdown(false)}
                title={feeBreakdownTitle}
                feeItems={feeItemsBreakdown}
                description={ecashFeesGuidanceText}
            />
        </View>
    )
}

const styles = (theme: Theme, insets: EdgeInsets) =>
    StyleSheet.create({
        container: {
            flexDirection: 'column',
            flex: 1,
            alignItems: 'center',
            paddingTop: theme.spacing.lg,
            paddingLeft: theme.spacing.lg + insets.left,
            paddingRight: theme.spacing.lg + insets.right,
            paddingBottom: Math.max(theme.spacing.lg, insets.bottom),
        },
        amountContainer: {
            marginTop: 'auto',
        },
        balance: {
            color: hexToRgba(theme.colors.primary, 0.6),
            textAlign: 'center',
        },
        secondaryAmountText: {
            color: theme.colors.darkGrey,
            textAlign: 'center',
            marginRight: theme.spacing.xs,
            marginTop: theme.spacing.xs,
        },
    })

export default ConfirmSendEcash