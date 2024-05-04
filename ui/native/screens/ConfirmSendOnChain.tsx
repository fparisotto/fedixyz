import { useNavigation } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Text, Theme, useTheme } from '@rneui/themed'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context'

import {
    useAmountFormatter,
    useBalanceDisplay,
} from '@fedi/common/hooks/amount'
import { useOmniPaymentState } from '@fedi/common/hooks/pay'
import { useToast } from '@fedi/common/hooks/toast'
import { useFeeDisplayUtils } from '@fedi/common/hooks/transactions'
import { selectActiveFederation } from '@fedi/common/redux'
import amountUtils from '@fedi/common/utils/AmountUtils'
import { hexToRgba } from '@fedi/common/utils/color'
import { BridgeError } from '@fedi/common/utils/fedimint'

import { fedimint } from '../bridge'
import FeeOverlay from '../components/feature/send/FeeOverlay'
import SvgImage from '../components/ui/SvgImage'
import { useAppSelector } from '../state/hooks'
import type { NavigationHook, RootStackParamList } from '../types/navigation'

export type Props = NativeStackScreenProps<
    RootStackParamList,
    'ConfirmSendOnChain'
>

const ConfirmSendOnChain: React.FC<Props> = ({ route }: Props) => {
    const { theme } = useTheme()
    const insets = useSafeAreaInsets()
    const { t } = useTranslation()
    const navigation = useNavigation<NavigationHook>()
    const toast = useToast()
    const activeFederation = useAppSelector(selectActiveFederation)
    const { parsedData } = route.params
    const [unit] = useState('sats')
    const { feeBreakdownTitle, makeOnchainFeeContent } = useFeeDisplayUtils(t)
    const balanceDisplay = useBalanceDisplay(t)
    const {
        isReadyToPay,
        inputAmount,
        feeDetails,
        sendTo,
        handleOmniInput,
        handleOmniSend,
    } = useOmniPaymentState(fedimint, activeFederation?.id)
    const { makeFormattedAmountsFromSats } = useAmountFormatter()
    const { formattedPrimaryAmount, formattedSecondaryAmount } =
        makeFormattedAmountsFromSats(inputAmount)

    useEffect(() => {
        handleOmniInput(parsedData)
    }, [handleOmniInput, parsedData])

    const [showFeeBreakdown, setShowFeeBreakdown] = useState<boolean>(false)
    const [showDetails, setShowDetails] = useState<boolean>(false)
    const [isPayingAddress, setIsPayingAddress] = useState<boolean>(false)

    const navigationReplace = navigation.replace
    const handleSend = useCallback(async () => {
        setIsPayingAddress(true)
        try {
            await handleOmniSend(inputAmount)
            navigationReplace('SendSuccess', {
                amount: amountUtils.satToMsat(inputAmount),
                unit,
            })
        } catch (err) {
            if (err instanceof BridgeError) {
                toast.error(t, null, err.format(t))
            } else {
                toast.error(t, err)
            }
        }
        setIsPayingAddress(false)
    }, [handleOmniSend, inputAmount, unit, navigationReplace, toast, t])

    if (!isReadyToPay) return <ActivityIndicator />

    const renderDetails = () => {
        if (!feeDetails) return null

        const feeContent = makeOnchainFeeContent(feeDetails)
        const { formattedTotalFee, feeItemsBreakdown } = feeContent

        return (
            <>
                <View
                    style={[
                        showDetails
                            ? style.detailsContainer
                            : style.collapsedContainer,
                    ]}>
                    <View style={[style.detailItem, style.bottomBorder]}>
                        <Text caption bold style={style.darkGrey}>{`${t(
                            'feature.send.send-to',
                        )}`}</Text>
                        <Text caption style={style.darkGrey}>
                            {sendTo}
                        </Text>
                    </View>
                    <Pressable
                        style={[style.detailItem, style.bottomBorder]}
                        onPress={() => setShowFeeBreakdown(true)}>
                        <Text
                            caption
                            bold
                            style={[
                                style.darkGrey,
                                style.detailItemTitle,
                            ]}>{`${t('words.fees')}`}</Text>
                        <Text
                            caption
                            style={
                                style.darkGrey
                            }>{`${formattedTotalFee}`}</Text>
                        <SvgImage
                            name="Info"
                            size={16}
                            color={theme.colors.grey}
                        />
                    </Pressable>
                    <View style={[style.detailItem]}>
                        <Text caption bold style={style.darkGrey}>{`${t(
                            'feature.send.send-from',
                        )}`}</Text>

                        <Text caption style={style.darkGrey}>
                            {`${t('feature.stabilitypool.bitcoin-balance')}`}
                        </Text>
                    </View>

                    <FeeOverlay
                        show={showFeeBreakdown}
                        onDismiss={() => setShowFeeBreakdown(false)}
                        title={feeBreakdownTitle}
                        feeItems={feeItemsBreakdown}
                        description={t('feature.fees.guidance-onchain')}
                        icon={
                            <SvgImage
                                name="Info"
                                size={32}
                                color={theme.colors.orange}
                            />
                        }
                    />
                </View>
            </>
        )
    }
    const style = styles(theme, insets)

    return (
        <View style={style.container}>
            <Text
                caption
                style={style.balance}
                numberOfLines={1}
                adjustsFontSizeToFit>
                {balanceDisplay}
            </Text>
            <View style={style.amountContainer}>
                <Text h1 numberOfLines={1}>
                    {formattedPrimaryAmount}
                </Text>
                <Text
                    style={style.secondaryAmountText}
                    medium
                    numberOfLines={1}>
                    {formattedSecondaryAmount}
                </Text>
            </View>
            <View style={style.buttonsGroup}>
                {renderDetails()}
                <Button
                    fullWidth
                    containerStyle={[style.button]}
                    buttonStyle={[style.detailsButton]}
                    onPress={() => setShowDetails(!showDetails)}
                    title={
                        <Text medium caption>
                            {showDetails
                                ? t('phrases.hide-details')
                                : t('feature.stabilitypool.details-and-fee')}
                        </Text>
                    }
                />
                <Button
                    fullWidth
                    containerStyle={[style.button]}
                    onPress={handleSend}
                    disabled={isPayingAddress}
                    loading={isPayingAddress}
                    title={
                        <Text medium caption style={style.buttonText}>
                            {t('words.send')}
                        </Text>
                    }
                />
            </View>
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
        bottomBorder: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.extraLightGrey,
        },
        buttonsGroup: {
            width: '100%',
            marginTop: 'auto',
            flexDirection: 'column',
        },
        button: {
            marginTop: theme.spacing.lg,
        },
        buttonText: {
            color: theme.colors.secondary,
        },
        collapsedContainer: {
            height: 0,
            opacity: 0,
        },
        detailsContainer: {
            width: '100%',
            opacity: 1,
            flexDirection: 'column',
        },
        detailItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 52,
        },
        detailItemTitle: {
            marginRight: 'auto',
        },
        darkGrey: {
            color: theme.colors.darkGrey,
        },
        detailsButton: {
            backgroundColor: theme.colors.offWhite,
        },
        secondaryAmountText: {
            color: theme.colors.darkGrey,
            textAlign: 'center',
            marginRight: theme.spacing.xs,
            marginTop: theme.spacing.xs,
        },
    })

export default ConfirmSendOnChain