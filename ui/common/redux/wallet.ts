import {
    createSlice,
    PayloadAction,
    createAsyncThunk,
    createSelector,
} from '@reduxjs/toolkit'
import { TFunction } from 'i18next'

import {
    CommonState,
    fetchCurrencyPrices,
    selectActiveFederation,
    selectActiveFederationId,
    selectBtcExchangeRate,
    selectBtcUsdExchangeRate,
    selectFederationBalance,
    selectFederationStabilityPoolConfig,
} from '.'
import { Federation, MSats, Usd, UsdCents } from '../types'
import {
    RpcAmount,
    RpcLockedSeek,
    RpcStabilityPoolAccountInfo,
    StabilityPoolDepositEvent,
    StabilityPoolWithdrawalEvent,
} from '../types/bindings'
import amountUtils from '../utils/AmountUtils'
import { FedimintBridge } from '../utils/fedimint'
import { makeLog } from '../utils/log'

const log = makeLog('native/redux/wallet')

type FederationPayloadAction<T = object> = PayloadAction<
    { federationId: string } & T
>

/*** Initial State ***/

const initialFederationWalletState = {
    stabilityPoolAccountInfo: null as RpcStabilityPoolAccountInfo | null,
    cycleStartPrice: null as number | null,
}
type FederationWalletState = typeof initialFederationWalletState

// All wallet state is keyed by federation id to keep federation wallets separate, so it starts as an empty object.
const initialState = {} as Record<
    Federation['id'],
    FederationWalletState | undefined
>

export type WalletState = typeof initialState

/*** Slice definition ***/

const getFederationWalletState = (state: WalletState, federationId: string) =>
    state[federationId] || {
        ...initialFederationWalletState,
    }

export const walletSlice = createSlice({
    name: 'wallet',
    initialState,
    reducers: {
        setStabilityPoolAccountInfo(
            state,
            action: FederationPayloadAction<{
                stabilityPoolAccountInfo: RpcStabilityPoolAccountInfo
            }>,
        ) {
            const { federationId, stabilityPoolAccountInfo } = action.payload
            state[federationId] = {
                ...getFederationWalletState(state, federationId),
                stabilityPoolAccountInfo,
            }
        },
        resetFederationWalletState(state, action: FederationPayloadAction) {
            state[action.payload.federationId] = {
                ...initialFederationWalletState,
            }
        },
        resetWalletState() {
            return { ...initialState }
        },
    },
    extraReducers: builder => {
        builder.addCase(
            fetchStabilityPoolAccountInfo.fulfilled,
            (state, action) => {
                const { federationId } = action.meta.arg
                const federation = getFederationWalletState(state, federationId)
                state[federationId] = {
                    ...federation,
                    ...action.payload,
                }
            },
        )

        builder.addCase(
            fetchStabilityPoolCycleStartPrice.fulfilled,
            (state, action) => {
                const { federationId } = action.meta.arg
                const federation = getFederationWalletState(state, federationId)
                state[federationId] = {
                    ...federation,
                    cycleStartPrice: action.payload,
                }
            },
        )
    },
})

/*** Basic actions ***/

export const {
    setStabilityPoolAccountInfo,
    resetFederationWalletState,
    resetWalletState,
} = walletSlice.actions

/*** Async thunk actions ***/

export const fetchStabilityPoolAccountInfo = createAsyncThunk<
    RpcStabilityPoolAccountInfo,
    { fedimint: FedimintBridge; federationId: string },
    { state: CommonState }
>(
    'wallet/fetchStabilityPoolAccountInfo',
    async ({ fedimint, federationId }, { dispatch }) => {
        const accountInfo = await fedimint.stabilityPoolAccountInfo(
            federationId,
        )
        log.info('stabilityPoolAccountInfo', accountInfo)
        dispatch(
            setStabilityPoolAccountInfo({
                federationId,
                stabilityPoolAccountInfo: accountInfo,
            }),
        )
        return accountInfo
    },
)

export const fetchStabilityPoolCycleStartPrice = createAsyncThunk<
    number,
    { fedimint: FedimintBridge; federationId: string }
>(
    'wallet/fetchStabilityPoolCycleStartPrice',
    async ({ fedimint, federationId }) => {
        const priceCents = await fedimint.stabilityPoolCycleStartPrice(
            federationId,
        )
        const price = Number(priceCents) / 100
        log.info('stabilityPoolCycleStartPrice', { price })
        return price
    },
)

export const refreshActiveStabilityPool = createAsyncThunk<
    void,
    { fedimint: FedimintBridge },
    { state: CommonState }
>(
    'wallet/refreshActiveStabilityPool',
    async ({ fedimint }, { dispatch, getState }) => {
        const state = getState()
        const federationId = state.federation.activeFederationId
        if (!federationId) throw new Error('errors.unknown-error')
        // Make sure we have the latest exchange rates every time we refresh stabilitypool
        // so deposits/withdrawal amount conversions are as accurate as possible
        dispatch(fetchCurrencyPrices())
        dispatch(fetchStabilityPoolCycleStartPrice({ fedimint, federationId }))

        await dispatch(
            fetchStabilityPoolAccountInfo({
                fedimint,
                federationId,
            }),
        ).unwrap()
    },
)

export const increaseStableBalance = createAsyncThunk<
    Promise<StabilityPoolDepositEvent>,
    {
        fedimint: FedimintBridge
        amount: RpcAmount
    },
    { state: CommonState }
>(
    'wallet/increaseStableBalance',
    async ({ fedimint, amount }, { getState }) => {
        const state = getState()
        const activeFederationId = selectActiveFederation(state)?.id
        if (!activeFederationId) throw new Error('No active federation')
        const ecashBalance = selectFederationBalance(state)

        // Add some fee padding to resist downside price leakage while deposits confirm
        // arbitrarily we just add the estimated fees for the first 10 cycles
        const stabilityConfig = selectFederationStabilityPoolConfig(state)
        if (!stabilityConfig)
            throw new Error('No stabilitypool in this federation')

        const maxAllowedFeeRate =
            stabilityConfig?.max_allowed_provide_fee_rate_ppb || 0
        const maxFeeRateFraction = Number(
            (maxAllowedFeeRate / 1_000_000_000).toFixed(9),
        )
        const maxFirstCycleFee = Number(
            (amount * maxFeeRateFraction).toFixed(0),
        )

        // Min leakage padding of 1 sat or first 10 cycle fees
        const leakagePadding = Math.max(
            1000,
            Number((10 * maxFirstCycleFee).toFixed(0)),
        )

        const amountPlusPadding = Number((amount + leakagePadding).toFixed(0))

        // Make sure total with fee padding doesn't exceed ecash balance
        const amountToDeposit = Math.min(
            ecashBalance,
            amountPlusPadding,
        ) as MSats

        const operationId = await fedimint.stabilityPoolDepositToSeek(
            amountToDeposit,
            activeFederationId,
        )

        return new Promise<StabilityPoolDepositEvent>((resolve, reject) => {
            const unsubscribeOperation = fedimint.addListener(
                'stabilityPoolDeposit',
                (event: StabilityPoolDepositEvent) => {
                    if (
                        event.federationId === activeFederationId &&
                        event.operationId === operationId
                    ) {
                        log.info(
                            'StabilityPoolDepositEvent.state',
                            event.operationId,
                            event.state,
                        )
                        if (event.state === 'txAccepted') {
                            unsubscribeOperation()
                            resolve(event)
                        } else if (
                            typeof event.state === 'object' &&
                            'txRejected' in event.state
                        ) {
                            unsubscribeOperation()
                            reject('Transaction rejected')
                        }
                    }
                },
            )
        })
    },
)

export const decreaseStableBalance = createAsyncThunk<
    Promise<StabilityPoolWithdrawalEvent>,
    {
        fedimint: FedimintBridge
        amount: RpcAmount
    },
    { state: CommonState }
>(
    'wallet/decreaseStableBalance',
    async ({ fedimint, amount }, { getState }) => {
        const state = getState()
        const activeFederationId = selectActiveFederation(state)?.id
        if (!activeFederationId) throw new Error('No active federation')
        const btcUsdExchangeRate = selectBtcUsdExchangeRate(state)
        const totalLockedCents = selectTotalLockedCents(state)
        const stableBalanceCents = selectStableBalanceCents(state)
        const totalStagedMsats = selectTotalStagedMsats(state)
        let lockedBps = 0
        let unlockedAmount = 0 as MSats

        // if we have enough pending balance to cover the withdrawal
        // no need to calculate basis points on stable balance
        if (amount <= totalStagedMsats) {
            log.info(
                `withdrawing ${amount} msats from ${totalStagedMsats} staged msats`,
            )
            // if there is a sub-1sat difference in staged seeks remaining, should be safe to just use the full pending balance to sweep the msats in with the withdrawal
            unlockedAmount =
                totalStagedMsats - amount < 1000 ? totalStagedMsats : amount
        } else {
            // if there is more to withdraw, unlock the full pending balance
            // and calculate what portion of the stable balance
            // is needed to fulfill the withdrawal amount
            unlockedAmount = totalStagedMsats
            const remainingWithdrawal = Number(
                (amount - unlockedAmount).toFixed(2),
            )
            log.info(
                `need to withdraw ${remainingWithdrawal} msats from locked balance`,
            )
            const remainingWithdrawalUsd = amountUtils.msatToFiat(
                remainingWithdrawal as MSats,
                btcUsdExchangeRate,
            )
            const remainingWithdrawalCents = remainingWithdrawalUsd * 100
            log.info('remainingWithdrawalCents', remainingWithdrawalCents)

            lockedBps = Number(
                ((remainingWithdrawalCents * 10000) / totalLockedCents).toFixed(
                    0,
                ),
            )

            // TODO: remove this? do we need any sweep conditions here at all?
            // If there is <=1 cent leftover after this withdrawal
            // just withdraw the full 10k basis points on the locked balance
            // const centsAfterWithdrawal: UsdCents = (stableBalanceCents -
            //     remainingWithdrawalCents) as UsdCents
            // console.debug('centsAfterWithdrawal', centsAfterWithdrawal)
            // lockedBps =
            //     centsAfterWithdrawal <= 1
            //         ? 10000
            //         : Number(
            //               (
            //                   Number(
            //                       (remainingWithdrawalCents * 10000).toFixed(0),
            //                   ) / totalLockedCents
            //               ).toFixed(0),
            //           )
        }

        log.info('decreaseStableBalance', {
            lockedBps,
            unlockedAmount,
            totalStagedMsats,
            stableBalanceCents,
        })
        const operationId = await fedimint.stabilityPoolWithdraw(
            lockedBps,
            unlockedAmount,
            activeFederationId,
        )
        return new Promise<StabilityPoolWithdrawalEvent>((resolve, reject) => {
            const unsubscribeOperation = fedimint.addListener(
                'stabilityPoolWithdrawal',
                (event: StabilityPoolWithdrawalEvent) => {
                    if (
                        event.federationId === activeFederationId &&
                        event.operationId === operationId
                    ) {
                        log.info(
                            'StabilityPoolWithdrawalEvent.state',
                            event.operationId,
                            event.state,
                        )
                        // Withdrawals may return the success state quickly if 100% of it was covered from stagedSeeks
                        // Otherwise, cancellationAccepted is the appropriate state to resolve
                        if (
                            event.state === 'success' ||
                            event.state === 'cancellationAccepted'
                        ) {
                            unsubscribeOperation()
                            resolve(event)
                        } else if (
                            typeof event.state === 'object' &&
                            ('txRejected' in event.state ||
                                'cancellationSubmissionFailure' in event.state)
                        ) {
                            unsubscribeOperation()
                            reject('Transaction rejected')
                        }
                    }
                },
            )
        })
    },
)

/*** Selectors ***/

const selectFederationWalletState = (
    s: CommonState,
    federationId?: Federation['id'],
) => {
    if (!federationId) {
        federationId = selectActiveFederationId(s)
    }
    return getFederationWalletState(s.wallet, federationId || '')
}

export const selectStabilityPoolAccountInfo = (s: CommonState) =>
    selectFederationWalletState(s).stabilityPoolAccountInfo

/**
 * Calculates the total amount locked in deposits in msats
 * */
export const selectTotalLockedMsats = createSelector(
    selectStabilityPoolAccountInfo,
    stabilityPoolAccountInfo => {
        if (!stabilityPoolAccountInfo) return 0
        const { lockedSeeks } = stabilityPoolAccountInfo

        const totalLockedSeeksAmount = lockedSeeks.reduce(
            (result: number, ls: RpcLockedSeek) => {
                const { initialAmount, withdrawnAmount, feesPaidSoFar } = ls
                const remainingAmount = initialAmount - withdrawnAmount
                const totalLockedSeeks = remainingAmount - feesPaidSoFar
                return result + totalLockedSeeks
            },
            0,
        )

        return totalLockedSeeksAmount as MSats
    },
)

/**
 * Calculates the total amount locked in deposits in cents
 * */
export const selectTotalLockedCents = createSelector(
    selectStabilityPoolAccountInfo,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (stabilityPoolAccountInfo, btcUsdExchangeRate): UsdCents => {
        if (!stabilityPoolAccountInfo) return 0 as UsdCents

        let totalLockedCents: UsdCents = 0 as UsdCents
        const { lockedSeeks } = stabilityPoolAccountInfo
        totalLockedCents = lockedSeeks.reduce(
            (result: number, ls: RpcLockedSeek) => {
                const {
                    initialAmountCents,
                    withdrawnAmountCents,
                    feesPaidSoFar,
                } = ls
                const remainingAmountCents = (initialAmountCents -
                    withdrawnAmountCents) as UsdCents
                const feesPaidInFiat = amountUtils.msatToFiat(
                    feesPaidSoFar,
                    btcUsdExchangeRate,
                )
                const feedPaidInCents = feesPaidInFiat * 100
                const lockedFiatBalance = remainingAmountCents - feedPaidInCents
                result = result + lockedFiatBalance

                return result
            },
            0,
        ) as UsdCents

        return totalLockedCents
    },
)

/**
 * Calculates the total amount locked in deposits, converted to the selectedCurrency
 * */
export const selectTotalLockedFiat = createSelector(
    selectTotalLockedCents,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (s: CommonState) => selectBtcExchangeRate(s),
    (totalLockedCents, btcUsdExchangeRate, btcExchangeRate) => {
        return amountUtils.convertCentsToOtherFiat(
            totalLockedCents,
            btcUsdExchangeRate,
            btcExchangeRate,
        )
    },
)

/**
 * Calculates the total amount of pending deposits in msats
 * */
export const selectTotalStagedMsats = (s: CommonState) =>
    (selectStabilityPoolAccountInfo(s)?.stagedSeeks.reduce(
        (result, ss) => Number((result + ss).toFixed(0)),
        0,
    ) as MSats) || (0 as MSats)

/**
 * Converts total amount of pending deposits in msats to the current USD value in cents
 * */
export const selectTotalStagedCents = createSelector(
    selectTotalStagedMsats,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (totalStagedSeeksMsats, btcUsdExchangeRate): UsdCents => {
        const amountUsd = amountUtils.msatToFiat(
            totalStagedSeeksMsats as MSats,
            btcUsdExchangeRate,
        )
        const amountCents = amountUsd * 100
        return amountCents as UsdCents
    },
)

/**
 * Converts the USD value of pending deposits to selectedCurrency
 * */
export const selectTotalStagedFiat = createSelector(
    selectTotalStagedCents,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (s: CommonState) => selectBtcExchangeRate(s),
    (totalStagedCents, btcUsdExchangeRate, btcExchangeRate) => {
        return amountUtils.convertCentsToOtherFiat(
            totalStagedCents,
            btcUsdExchangeRate,
            btcExchangeRate,
        )
    },
)

/**
 * Calculates the total stable balance in cents
 * */
export const selectStableBalanceCents = createSelector(
    selectStabilityPoolAccountInfo,
    selectTotalLockedCents,
    (stabilityPoolAccountInfo, totalLockedCents) => {
        if (!stabilityPoolAccountInfo) return 0 as UsdCents

        let stableBalance = totalLockedCents
        const { stagedCancellation } = stabilityPoolAccountInfo

        if (stagedCancellation) {
            // convert bps to decimal
            const cancelledFraction = stagedCancellation / 10000
            // calculate balance without cancelledFraction
            const pendingWithdrawalAmount = stableBalance * cancelledFraction
            stableBalance = (stableBalance -
                pendingWithdrawalAmount) as UsdCents
        }

        return stableBalance
    },
)

/**
 * Converts the total stable balance in cents to the selectedCurrency
 * */
export const selectStableBalance = createSelector(
    selectStableBalanceCents,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (s: CommonState) => selectBtcExchangeRate(s),
    (stableBalanceCents, btcUsdExchangeRate, btcExchangeRate) => {
        return amountUtils.convertCentsToOtherFiat(
            stableBalanceCents,
            btcUsdExchangeRate,
            btcExchangeRate,
        )
    },
)

export const selectStableBalanceSats = createSelector(
    selectStableBalanceCents,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (stableBalanceCents, btcUsdExchangeRate) => {
        const stableBalanceDollars = stableBalanceCents / 100
        return amountUtils.fiatToSat(stableBalanceDollars, btcUsdExchangeRate)
    },
)

/**
 * Calculates the pending stable balance using:
 * 1. total locked seeks in cents to calculate pending withdrawals
 * 2. total staged seeks in cents (estimated USD value) to calculate pending deposits
 *
 * should be POSITIVE if net depositing, and NEGATIVE if net withdrawing
 * */
export const selectStableBalancePendingCents = createSelector(
    selectStabilityPoolAccountInfo,
    selectTotalLockedCents,
    selectTotalStagedCents,
    (stabilityPoolAccountInfo, totalLockedCents, pendingDepositAmount) => {
        if (!stabilityPoolAccountInfo) return 0 as UsdCents

        let pendingWithdrawAmount = 0
        const { stagedCancellation } = stabilityPoolAccountInfo

        if (stagedCancellation) {
            const cancelledFraction = Number(
                (stagedCancellation / 10000).toFixed(4),
            )
            pendingWithdrawAmount = Number(
                (totalLockedCents * cancelledFraction).toFixed(2),
            )
        }

        return (pendingDepositAmount - pendingWithdrawAmount) as UsdCents
    },
)

/**
 * Converts the pending stable balance in cents to the selectedCurrency
 * */
export const selectStableBalancePending = createSelector(
    selectStableBalancePendingCents,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (s: CommonState) => selectBtcExchangeRate(s),
    (stableBalancePendingCents, btcUsdExchangeRate, btcExchangeRate) => {
        return amountUtils.convertCentsToOtherFiat(
            stableBalancePendingCents,
            btcUsdExchangeRate,
            btcExchangeRate,
        )
    },
)

export const selectWithdrawableStableBalanceCents = createSelector(
    selectStableBalanceCents,
    selectStableBalancePendingCents,
    (stableBalance, stableBalancePending): UsdCents => {
        return (stableBalance + stableBalancePending) as UsdCents
    },
)

export const selectMinimumWithdrawAmountCents = createSelector(
    (s: CommonState) => selectFederationStabilityPoolConfig(s),
    selectStableBalanceCents,
    selectStableBalancePendingCents,
    (config, stableBalance, stableBalancePending): UsdCents => {
        const minimumBasisPoints = config?.min_allowed_cancellation_bps || 0

        // No minimum withdraw amount if we can cancel pending deposits otherwise calculate minimum allowed cancellation from completed deposits
        if (stableBalancePending > 0) {
            return 0 as UsdCents
        } else {
            // convert bps to decimal
            const minimumFraction = Number(
                (minimumBasisPoints / 10000).toFixed(4),
            )
            // calculate balance without cancelledFraction
            const minimumUsdAmount = Number(
                (stableBalance * minimumFraction).toFixed(2),
            )
            return minimumUsdAmount as UsdCents
        }
    },
)

export const selectWithdrawableStableBalanceMsats = createSelector(
    selectWithdrawableStableBalanceCents,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (withdrawableCents, btcUsdExchangeRate): MSats => {
        const usdAmount = withdrawableCents / 100
        return amountUtils.fiatToMsat(usdAmount as Usd, btcUsdExchangeRate)
    },
)

export const selectMinimumWithdrawAmountMsats = createSelector(
    selectMinimumWithdrawAmountCents,
    (s: CommonState) => selectBtcUsdExchangeRate(s),
    (minimumWithdrawAmountCents, btcUsdExchangeRate): MSats => {
        const usdAmount = minimumWithdrawAmountCents / 100
        return amountUtils.fiatToMsat(usdAmount as Usd, btcUsdExchangeRate)
    },
)

export const selectMinimumDepositAmount = createSelector(
    (s: CommonState) => selectFederationStabilityPoolConfig(s),
    config => {
        const minimumMsats = config?.min_allowed_seek || 0
        return amountUtils.msatToSat(minimumMsats as MSats)
    },
)

/**
 * Get the deposit time from stabilitypool cycle duration in human-readable format
 * */
export const selectFormattedDepositTime = createSelector(
    (s: CommonState) => selectFederationStabilityPoolConfig(s),
    (_: CommonState, t: TFunction) => t,
    (config, t) => {
        if (!config) return 0
        const { secs: seconds } = config.cycle_duration

        if (seconds >= 3600) {
            // Duration exceeds one hour
            return t('feature.stabilitypool.more-than-an-hour')
        } else if (seconds < 60) {
            // Duration is less than a minute
            return seconds > 1
                ? `~${t('feature.stabilitypool.seconds', { seconds })}`
                : `~${t('feature.stabilitypool.one-second')}`
        } else {
            // Convert seconds to nearest half-minute
            const minutes = Math.round((seconds / 60) * 2) / 2
            return minutes > 1
                ? `~${t('feature.stabilitypool.minutes', { minutes })}`
                : `~${t('feature.stabilitypool.one-minute')}`
        }
    },
)
/**
 * Get the max APR from the max allowed fee rate in parts per billion
 * This calculates what % of a deposit the user can expect to pay in fees
 * after 1 full year, deducting fees every 10 minutes compounding every cycle
 */
export const selectMaximumAPR = createSelector(
    (s: CommonState) => selectFederationStabilityPoolConfig(s),
    config => {
        if (!config) return 0
        const maxFeeRatePerCycle = config.max_allowed_provide_fee_rate_ppb || 0
        // convert parts per billion to decimal
        const periodicRate = maxFeeRatePerCycle / 1_000_000_000
        // Number of 10 minute cycles in a year
        const { secs: secondsPerCycle } = config.cycle_duration
        const secondsInYear = 365 * 24 * 60 * 60
        const cyclesPerYear = secondsInYear / secondsPerCycle
        const compoundedAnnualRate =
            1 - Math.pow(1 - periodicRate, cyclesPerYear)
        const maxFeePercentage = (compoundedAnnualRate * 100).toFixed(2)
        return Number(maxFeePercentage)
    },
)

export const selectStabilityPoolCycleStartPrice = (
    s: CommonState,
    federationId?: Federation['id'],
) => {
    if (!federationId) {
        federationId = selectActiveFederationId(s)
    }
    return federationId
        ? selectFederationWalletState(s, federationId).cycleStartPrice
        : null
}