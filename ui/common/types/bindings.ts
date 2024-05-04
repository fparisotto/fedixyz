import { RequestInvoiceArgs } from 'webln'

import { MSats } from '@fedi/common/types'

export type RpcMethodNames = keyof RpcMethods
export type RpcPayload<M extends RpcMethodNames> = RpcMethods[M][0]
export type RpcResponse<M extends RpcMethodNames> = RpcMethods[M][1]

// used by generated code
declare const __opaque_type__: unique symbol // https://blog.beraliv.dev/2021-05-07-opaque-type-in-typescript
export type Opaque<BaseType, TagName> = BaseType & {
    readonly [__opaque_type__]: TagName
}

export type EcashRequest = Omit<RequestInvoiceArgs, 'defaultMemo'>

// this was auto generated by ts-bindgen.sh

export type BackupServiceState =
    | { type: 'initializing' }
    | { type: 'waiting'; next_backup_timestamp: number | null }
    | { type: 'running' }

export interface BackupServiceStatus {
    lastBackupTimestamp: number | null
    state: BackupServiceState
}

export interface BalanceEvent {
    federationId: RpcFederationId
    balance: RpcAmount
}

export interface CommunityMetadataUpdatedEvent {
    newCommunity: RpcCommunity
}

export type CreateRoomRequest = any

export type CustomMessageData = Record<string, any>

export interface DeviceRegistrationEvent {
    state: DeviceRegistrationState
}

export type DeviceRegistrationState =
    | 'newDeviceNeedsAssignment'
    | 'conflict'
    | 'success'
    | 'overdue'

export type ErrorCode =
    | 'initializationFailed'
    | 'notInialized'
    | 'badRequest'
    | 'alreadyJoined'
    | 'invalidInvoice'
    | 'invalidMnemonic'
    | 'ecashCancelFailed'
    | 'panic'
    | 'invalidSocialRecoveryFile'
    | { insufficientBalance: RpcAmount }
    | 'matrixNotInitialized'
    | 'unknownObservable'
    | 'timeout'
    | 'recovery'
    | { invalidJson: string }

export type Event =
    | { transaction: TransactionEvent }
    | { log: LogEvent }
    | { federation: RpcFederation }
    | { balance: BalanceEvent }
    | { panic: PanicEvent }
    | { stabilityPoolDeposit: StabilityPoolDepositEvent }
    | { stabilityPoolWithdrawal: StabilityPoolWithdrawalEvent }
    | { recoveryComplete: RecoveryCompleteEvent }
    | { recoveryProgress: RecoveryProgressEvent }
    | { deviceRegistration: DeviceRegistrationEvent }
    | {
          stabilityPoolUnfilledDepositSwept: StabilityPoolUnfilledDepositSweptEvent
      }
    | { communityMetadataUpdated: CommunityMetadataUpdatedEvent }

export type GuardianStatus =
    | { online: { guardian: string; latency_ms: number } }
    | { error: { guardian: string; error: string } }
    | { timeout: { guardian: string; elapsed: string } }

export interface LogEvent {
    log: string
}

export interface Observable<T> {
    id: number
    initial: T
}

export type ObservableBackPaginationStatus = Observable<RpcBackPaginationStatus>

export type ObservableRoomInfo = Observable<any>

export type ObservableRoomList = ObservableVec<RpcRoomListEntry>

export type ObservableRpcSyncIndicator = Observable<RpcSyncIndicator>

export type ObservableTimelineItems = ObservableVec<RpcTimelineItem>

export interface ObservableUpdate<T> {
    id: number
    update_index: number
    update: T
}

export type ObservableVec<T> = Observable<Array<T>>

export type ObservableVecUpdate<T> = ObservableUpdate<Array<SerdeVectorDiff<T>>>

export interface PanicEvent {
    message: string
}

export interface RecoveryCompleteEvent {
    federationId: RpcFederationId
}

export interface RecoveryProgressEvent {
    federationId: RpcFederationId
    complete: number
    total: number
}

export type RpcAmount = MSats

export type RpcAppFlavor =
    | { type: 'dev' }
    | { type: 'nightly' }
    | { type: 'bravo' }

export type RpcBackPaginationStatus =
    | 'idle'
    | 'paginating'
    | 'timelineStartReached'

export interface RpcBitcoinDetails {
    address: string
    expiresAt: number
}

export interface RpcBridgeStatus {
    matrixSetup: boolean
    deviceIndexAssignmentStatus: RpcDeviceIndexAssignmentStatus
}

export interface RpcCommunity {
    inviteCode: string
    name: string
    version: number
    meta: Record<string, string>
}

export type RpcDeviceIndexAssignmentStatus = { assigned: number } | 'unassigned'

export interface RpcDuration {
    nanos: number
    secs: number
}

export interface RpcEcashInfo {
    amount: RpcAmount
    federationId: RpcFederationId | null
}

export interface RpcFederation {
    balance: RpcAmount
    id: RpcFederationId
    network: string | null
    name: string
    inviteCode: string
    meta: Record<string, string>
    recovering: boolean
    nodes: Record<string, { url: string; name: string }>
    version: number
    clientConfig: RpcJsonClientConfig | null
    fediFeeSchedule: RpcFediFeeSchedule
}

export type RpcFederationId = string

export interface RpcFederationPreview {
    id: RpcFederationId
    name: string
    meta: Record<string, string>
    inviteCode: string
    version: number
    returningMemberStatus: RpcReturningMemberStatus
}

export interface RpcFediFeeSchedule {
    remittanceThresholdMsat: number
    modules: Record<string, RpcModuleFediFeeSchedule>
}

export interface RpcFeeDetails {
    fediFee: RpcAmount
    networkFee: RpcAmount
    federationFee: RpcAmount
}

export interface RpcGenerateEcashResponse {
    ecash: string
    cancelAt: number
}

export interface RpcInitOpts {
    dataDir: string | null
    logLevel: string | null
    deviceIdentifier: string
    appFlavor: RpcAppFlavor
}

export interface RpcInvoice {
    paymentHash: string
    amount: RpcAmount
    fee: RpcFeeDetails | null
    description: string
    invoice: string
}

export interface RpcJsonClientConfig {
    global: unknown
    modules: Record<string, unknown>
}

export interface RpcLightningDetails {
    invoice: string
    fee: RpcAmount | null
}

export interface RpcLightningGateway {
    nodePubKey: RpcPublicKey
    gatewayId: RpcPublicKey
    api: string
    active: boolean
}

export type RpcLnPayState =
    | { type: 'created' }
    | { type: 'canceled' }
    | { type: 'funded' }
    | { type: 'waitingForRefund'; block_height: number; gateway_error: string }
    | { type: 'awaitingChange' }
    | { type: 'success'; preimage: string }
    | { type: 'refunded'; gateway_error: string }
    | { type: 'failed' }

export type RpcLnReceiveState =
    | { type: 'created' }
    | { type: 'waitingForPayment'; invoice: string; timeout: string }
    | { type: 'canceled'; reason: string }
    | { type: 'funded' }
    | { type: 'awaitingFunds' }
    | { type: 'claimed' }

export type RpcLnState = RpcLnPayState | RpcLnReceiveState

export interface RpcLockedSeek {
    currCycleBeginningLockedAmount: RpcAmount
    initialAmount: RpcAmount
    initialAmountCents: number
    withdrawnAmount: RpcAmount
    withdrawnAmountCents: number
    feesPaidSoFar: RpcAmount
    firstLockStartTime: number
}

export interface RpcMatrixAccountSession {
    userId: string
    deviceId: string
    displayName: string | null
    avatarUrl: string | null
}

export type RpcMatrixMembership =
    | 'ban'
    | 'invite'
    | 'join'
    | 'knock'
    | 'leave'
    | 'unknown'

export interface RpcMatrixUploadResult {
    contentUri: string
}

export interface RpcMatrixUserDirectorySearchResponse {
    results: Array<RpcMatrixUserDirectorySearchUser>
    limited: boolean
}

export interface RpcMatrixUserDirectorySearchUser {
    userId: RpcUserId
    displayName: string | null
    avatarUrl: string | null
}

export interface RpcMethods {
    bridgeStatus: [
        Record<string, never>,
        {
            matrixSetup: boolean
            deviceIndexAssignmentStatus: RpcDeviceIndexAssignmentStatus
        },
    ]
    onAppForeground: [Record<string, never>, null]
    joinFederation: [
        { inviteCode: string },
        {
            balance: RpcAmount
            id: RpcFederationId
            network: string | null
            name: string
            inviteCode: string
            meta: Record<string, string>
            recovering: boolean
            nodes: Record<string, { url: string; name: string }>
            version: number
            clientConfig: RpcJsonClientConfig | null
            fediFeeSchedule: RpcFediFeeSchedule
        },
    ]
    federationPreview: [
        { inviteCode: string },
        {
            id: RpcFederationId
            name: string
            meta: Record<string, string>
            inviteCode: string
            version: number
            returningMemberStatus: RpcReturningMemberStatus
        },
    ]
    leaveFederation: [{ federationId: RpcFederationId }, null]
    listFederations: [
        Record<string, never>,
        Array<{
            balance: RpcAmount
            id: RpcFederationId
            network: string | null
            name: string
            inviteCode: string
            meta: Record<string, string>
            recovering: boolean
            nodes: Record<string, { url: string; name: string }>
            version: number
            clientConfig: RpcJsonClientConfig | null
            fediFeeSchedule: RpcFediFeeSchedule
        }>,
    ]
    guardianStatus: [
        { federationId: RpcFederationId },
        Array<
            | { online: { guardian: string; latency_ms: number } }
            | { error: { guardian: string; error: string } }
            | { timeout: { guardian: string; elapsed: string } }
        >,
    ]
    generateInvoice: [
        {
            federationId: RpcFederationId
            amount: RpcAmount
            description: string
            expiry: number | null
        },
        string,
    ]
    decodeInvoice: [
        { federationId: RpcFederationId | null; invoice: string },
        {
            paymentHash: string
            amount: RpcAmount
            fee: RpcFeeDetails | null
            description: string
            invoice: string
        },
    ]
    payInvoice: [
        { federationId: RpcFederationId; invoice: string },
        { preimage: string },
    ]
    listGateways: [
        { federationId: RpcFederationId },
        Array<{
            nodePubKey: RpcPublicKey
            gatewayId: RpcPublicKey
            api: string
            active: boolean
        }>,
    ]
    switchGateway: [
        { federationId: RpcFederationId; gatewayId: RpcPublicKey },
        null,
    ]
    generateAddress: [{ federationId: RpcFederationId }, string]
    previewPayAddress: [
        { federationId: RpcFederationId; address: string; sats: bigint },
        { fediFee: RpcAmount; networkFee: RpcAmount; federationFee: RpcAmount },
    ]
    payAddress: [
        { federationId: RpcFederationId; address: string; sats: bigint },
        { txid: string },
    ]
    generateEcash: [
        { federationId: RpcFederationId; amount: RpcAmount },
        { ecash: string; cancelAt: number },
    ]
    receiveEcash: [{ federationId: RpcFederationId; ecash: string }, MSats]
    validateEcash: [
        { ecash: string },
        { amount: RpcAmount; federationId: RpcFederationId | null },
    ]
    cancelEcash: [{ federationId: RpcFederationId; ecash: string }, null]
    listTransactions: [
        {
            federationId: RpcFederationId
            startTime: number | null
            limit: number | null
        },
        Array<{
            id: string
            createdAt: number
            amount: RpcAmount
            fediFeeStatus: RpcOperationFediFeeStatus | null
            direction: RpcTransactionDirection
            notes: string
            onchainState: RpcOnchainState | null
            bitcoin: RpcBitcoinDetails | null
            lnState: RpcLnState | null
            lightning: RpcLightningDetails | null
            oobState: RpcOOBState | null
            onchainWithdrawalDetails: WithdrawalDetails | null
            stabilityPoolState: RpcStabilityPoolTransactionState | null
        }>,
    ]
    updateTransactionNotes: [
        { federationId: RpcFederationId; transactionId: string; notes: string },
        null,
    ]
    getMnemonic: [Record<string, never>, Array<string>]
    checkMnemonic: [{ mnemonic: Array<string> }, boolean]
    recoverFromMnemonic: [
        { mnemonic: Array<string> },
        Array<{
            deviceIndex: number
            deviceIdentifier: string
            lastRegistrationTimestamp: number
        }>,
    ]
    uploadBackupFile: [
        { federationId: RpcFederationId; videoFilePath: string },
        string,
    ]
    locateRecoveryFile: [Record<string, never>, string]
    validateRecoveryFile: [{ path: string }, null]
    recoveryQr: [Record<string, never>, { recoveryId: RpcRecoveryId } | null]
    cancelSocialRecovery: [Record<string, never>, null]
    socialRecoveryApprovals: [
        Record<string, never>,
        { approvals: Array<SocialRecoveryApproval>; remaining: number },
    ]
    completeSocialRecovery: [
        Record<string, never>,
        Array<{
            deviceIndex: number
            deviceIdentifier: string
            lastRegistrationTimestamp: number
        }>,
    ]
    socialRecoveryDownloadVerificationDoc: [
        { federationId: RpcFederationId; recoveryId: RpcRecoveryId },
        string | null,
    ]
    approveSocialRecoveryRequest: [
        {
            federationId: RpcFederationId
            recoveryId: RpcRecoveryId
            peerId: RpcPeerId
            password: string
        },
        null,
    ]
    signLnurlMessage: [
        { message: string; domain: string; federationId: RpcFederationId },
        { signature: string; pubkey: RpcPublicKey },
    ]
    backupStatus: [
        { federationId: RpcFederationId },
        { lastBackupTimestamp: number | null; state: BackupServiceState },
    ]
    xmppCredentials: [
        { federationId: RpcFederationId },
        { password: string; keypairSeed: string; username: string | null },
    ]
    backupXmppUsername: [
        { federationId: RpcFederationId; username: string },
        null,
    ]
    getNostrPubKey: [Record<string, never>, string]
    getNostrPubKeyBech32: [Record<string, never>, string]
    signNostrEvent: [
        { eventHash: string; federationId: RpcFederationId },
        string,
    ]
    stabilityPoolAccountInfo: [
        { federationId: RpcFederationId; forceUpdate: boolean },
        {
            idleBalance: RpcAmount
            stagedSeeks: Array<RpcAmount>
            stagedCancellation: number | null
            lockedSeeks: Array<RpcLockedSeek>
            timestamp: number
            isFetchedFromServer: boolean
        },
    ]
    stabilityPoolNextCycleStartTime: [{ federationId: RpcFederationId }, bigint]
    stabilityPoolCycleStartPrice: [{ federationId: RpcFederationId }, bigint]
    stabilityPoolDepositToSeek: [
        { federationId: RpcFederationId; amount: RpcAmount },
        string,
    ]
    stabilityPoolWithdraw: [
        {
            federationId: RpcFederationId
            unlockedAmount: RpcAmount
            lockedBps: number
        },
        string,
    ]
    stabilityPoolAverageFeeRate: [
        { federationId: RpcFederationId; numCycles: bigint },
        bigint,
    ]
    stabilityPoolAvailableLiquidity: [{ federationId: RpcFederationId }, MSats]
    getSensitiveLog: [Record<string, never>, boolean]
    setSensitiveLog: [{ enable: boolean }, null]
    setMintModuleFediFeeSchedule: [
        { federationId: RpcFederationId; sendPpm: bigint; receivePpm: bigint },
        null,
    ]
    setWalletModuleFediFeeSchedule: [
        { federationId: RpcFederationId; sendPpm: bigint; receivePpm: bigint },
        null,
    ]
    setLightningModuleFediFeeSchedule: [
        { federationId: RpcFederationId; sendPpm: bigint; receivePpm: bigint },
        null,
    ]
    setStabilityPoolModuleFediFeeSchedule: [
        { federationId: RpcFederationId; sendPpm: bigint; receivePpm: bigint },
        null,
    ]
    getAccruedOutstandingFediFeesPerTXType: [
        { federationId: RpcFederationId },
        Array<[string, 'receive' | 'send', MSats]>,
    ]
    getAccruedPendingFediFeesPerTXType: [
        { federationId: RpcFederationId },
        Array<[string, 'receive' | 'send', MSats]>,
    ]
    dumpDb: [{ federationId: string }, string]
    fetchRegisteredDevices: [
        Record<string, never>,
        Array<{
            deviceIndex: number
            deviceIdentifier: string
            lastRegistrationTimestamp: number
        }>,
    ]
    registerAsNewDevice: [
        Record<string, never>,
        {
            balance: RpcAmount
            id: RpcFederationId
            network: string | null
            name: string
            inviteCode: string
            meta: Record<string, string>
            recovering: boolean
            nodes: Record<string, { url: string; name: string }>
            version: number
            clientConfig: RpcJsonClientConfig | null
            fediFeeSchedule: RpcFediFeeSchedule
        } | null,
    ]
    transferExistingDeviceRegistration: [
        { index: number },
        {
            balance: RpcAmount
            id: RpcFederationId
            network: string | null
            name: string
            inviteCode: string
            meta: Record<string, string>
            recovering: boolean
            nodes: Record<string, { url: string; name: string }>
            version: number
            clientConfig: RpcJsonClientConfig | null
            fediFeeSchedule: RpcFediFeeSchedule
        } | null,
    ]
    deviceIndexAssignmentStatus: [
        Record<string, never>,
        { assigned: number } | 'unassigned',
    ]
    matrixObserverCancel: [{ id: bigint }, null]
    matrixInit: [Record<string, never>, null]
    matrixGetAccountSession: [
        { cached: boolean },
        {
            userId: string
            deviceId: string
            displayName: string | null
            avatarUrl: string | null
        },
    ]
    matrixObserveSyncIndicator: [
        Record<string, never>,
        Observable<RpcSyncIndicator>,
    ]
    matrixRoomList: [Record<string, never>, ObservableVec<RpcRoomListEntry>]
    matrixRoomListUpdateRanges: [{ ranges: RpcRanges }, null]
    matrixRoomTimelineItems: [
        { roomId: RpcRoomId },
        ObservableVec<RpcTimelineItem>,
    ]
    matrixRoomTimelineItemsPaginateBackwards: [
        { roomId: RpcRoomId; eventNum: number },
        null,
    ]
    matrixRoomObserveTimelineItemsPaginateBackwards: [
        { roomId: RpcRoomId },
        Observable<RpcBackPaginationStatus>,
    ]
    matrixSendMessage: [{ roomId: RpcRoomId; message: string }, null]
    matrixSendMessageJson: [
        {
            roomId: RpcRoomId
            msgtype: string
            body: string
            data: CustomMessageData
        },
        null,
    ]
    matrixRoomCreate: [{ request: CreateRoomRequest }, string]
    matrixRoomCreateOrGetDm: [{ userId: RpcUserId }, string]
    matrixRoomJoin: [{ roomId: RpcRoomId }, null]
    matrixRoomJoinPublic: [{ roomId: RpcRoomId }, null]
    matrixRoomLeave: [{ roomId: RpcRoomId }, null]
    matrixRoomObserveInfo: [{ roomId: RpcRoomId }, Observable<any>]
    matrixRoomInviteUserById: [{ roomId: RpcRoomId; userId: RpcUserId }, null]
    matrixRoomSetName: [{ roomId: RpcRoomId; name: string }, null]
    matrixRoomSetTopic: [{ roomId: RpcRoomId; topic: string }, null]
    matrixRoomGetMembers: [
        { roomId: RpcRoomId },
        Array<{
            userId: RpcUserId
            displayName: string | null
            avatarUrl: string | null
            powerLevel: number
            membership: RpcMatrixMembership
        }>,
    ]
    matrixUserDirectorySearch: [
        { searchTerm: string; limit: number },
        { results: Array<RpcMatrixUserDirectorySearchUser>; limited: boolean },
    ]
    matrixSetDisplayName: [{ displayName: string }, null]
    matrixSetAvatarUrl: [{ avatarUrl: string }, null]
    matrixUploadMedia: [
        { path: string; mimeType: string },
        { contentUri: string },
    ]
    matrixRoomGetPowerLevels: [{ roomId: RpcRoomId }, any]
    matrixRoomSetPowerLevels: [
        { roomId: RpcRoomId; new: RpcRoomPowerLevelsEventContent },
        null,
    ]
    matrixRoomSendReceipt: [{ roomId: RpcRoomId; eventId: string }, boolean]
    matrixRoomSetNotificationMode: [
        { roomId: RpcRoomId; mode: RpcRoomNotificationMode },
        null,
    ]
    matrixRoomGetNotificationMode: [
        { roomId: RpcRoomId },
        'allMessages' | 'mentionsAndKeywordsOnly' | 'mute' | null,
    ]
    matrixSetPusher: [{ pusher: RpcPusher }, null]
    matrixUserProfile: [{ userId: RpcUserId }, any]
    matrixRoomKickUser: [
        { roomId: RpcRoomId; userId: RpcUserId; reason: string | null },
        null,
    ]
    matrixRoomBanUser: [
        { roomId: RpcRoomId; userId: RpcUserId; reason: string | null },
        null,
    ]
    matrixRoomUnbanUser: [
        { roomId: RpcRoomId; userId: RpcUserId; reason: string | null },
        null,
    ]
    matrixIgnoreUser: [{ userId: RpcUserId }, null]
    matrixUnignoreUser: [{ userId: RpcUserId }, null]
    matrixRoomPreviewContent: [
        { roomId: RpcRoomId },
        Array<
            | { kind: 'event'; value: RpcTimelineItemEvent }
            | { kind: 'dayDivider'; value: number }
            | { kind: 'readMarker' }
            | { kind: 'unknown' }
        >,
    ]
    matrixPublicRoomInfo: [{ roomId: string }, any]
    matrixRoomMarkAsUnread: [{ roomId: RpcRoomId; unread: boolean }, null]
    communityPreview: [
        { inviteCode: string },
        {
            inviteCode: string
            name: string
            version: number
            meta: Record<string, string>
        },
    ]
    joinCommunity: [
        { inviteCode: string },
        {
            inviteCode: string
            name: string
            version: number
            meta: Record<string, string>
        },
    ]
    leaveCommunity: [{ inviteCode: string }, null]
    listCommunities: [
        Record<string, never>,
        Array<{
            inviteCode: string
            name: string
            version: number
            meta: Record<string, string>
        }>,
    ]
}

export interface RpcModuleFediFeeSchedule {
    sendPpm: number
    receivePpm: number
}

export type RpcOOBReissueState =
    | { type: 'created' }
    | { type: 'issuing' }
    | { type: 'done' }
    | { type: 'failed'; error: string }

export type RpcOOBSpendState =
    | { type: 'created' }
    | { type: 'userCanceledProcessing' }
    | { type: 'userCanceledSuccess' }
    | { type: 'userCanceledFailure' }
    | { type: 'refunded' }
    | { type: 'success' }

export type RpcOOBState = RpcOOBSpendState | RpcOOBReissueState

export type RpcOnchainDepositState =
    | { type: 'waitingForTransaction' }
    | ({ type: 'waitingForConfirmation' } & RpcOnchainDepositTransactionData)
    | ({ type: 'confirmed' } & RpcOnchainDepositTransactionData)
    | ({ type: 'claimed' } & RpcOnchainDepositTransactionData)
    | { type: 'failed' }

export interface RpcOnchainDepositTransactionData {
    txid: string
}

export type RpcOnchainState = RpcOnchainDepositState | RpcOnchainWithdrawState

export type RpcOnchainWithdrawState =
    | { type: 'created' }
    | { type: 'succeeded' }
    | { type: 'failed' }

export type RpcOperationFediFeeStatus =
    | { type: 'pendingSend'; fedi_fee: RpcAmount }
    | { type: 'pendingReceive'; fedi_fee_ppm: number }
    | { type: 'success'; fedi_fee: RpcAmount }
    | { type: 'failedSend'; fedi_fee: RpcAmount }
    | { type: 'failedReceive'; fedi_fee_ppm: number }

export type RpcOperationId = string

export interface RpcPayAddressResponse {
    txid: string
}

export interface RpcPayInvoiceResponse {
    preimage: string
}

export type RpcPeerId = number

export type RpcPublicKey = string

export type RpcPublicRoomChunk = any

export type RpcPusher = any

export type RpcRanges = Array<{ start: number; end: number }>

export type RpcRecoveryId = string

export interface RpcRegisteredDevice {
    deviceIndex: number
    deviceIdentifier: string
    lastRegistrationTimestamp: number
}

export type RpcReturningMemberStatus =
    | { type: 'unknown' }
    | { type: 'newMember' }
    | { type: 'returningMember' }

export type RpcRoomId = string

export type RpcRoomListEntry =
    | { kind: 'empty' }
    | { kind: 'invalidated'; value: string }
    | { kind: 'filled'; value: string }

export interface RpcRoomMember {
    userId: RpcUserId
    displayName: string | null
    avatarUrl: string | null
    powerLevel: number
    membership: RpcMatrixMembership
}

export type RpcRoomNotificationMode =
    | 'allMessages'
    | 'mentionsAndKeywordsOnly'
    | 'mute'

export type RpcRoomPowerLevelsEventContent = any

export interface RpcSignedLnurlMessage {
    signature: string
    pubkey: RpcPublicKey
}

export interface RpcStabilityPoolAccountInfo {
    idleBalance: RpcAmount
    stagedSeeks: Array<RpcAmount>
    stagedCancellation: number | null
    lockedSeeks: Array<RpcLockedSeek>
    timestamp: number
    isFetchedFromServer: boolean
}

export interface RpcStabilityPoolConfig {
    kind: string
    min_allowed_seek: RpcAmount
    max_allowed_provide_fee_rate_ppb: number | null
    min_allowed_cancellation_bps: number | null
    cycle_duration: RpcDuration
}

export type RpcStabilityPoolTransactionState =
    | { type: 'pendingDeposit' }
    | {
          type: 'completeDeposit'
          initial_amount_cents: number
          fees_paid_so_far: RpcAmount
      }
    | { type: 'pendingWithdrawal'; estimated_withdrawal_cents: number }
    | { type: 'completeWithdrawal'; estimated_withdrawal_cents: number }

export type RpcSyncIndicator = 'hide' | 'show'

export type RpcTimelineEventSendState =
    | { kind: 'notSentYet' }
    | { kind: 'sendingFailed'; error: string; is_recoverable: boolean }
    | { kind: 'sent'; event_id: string }

export type RpcTimelineItem =
    | { kind: 'event'; value: RpcTimelineItemEvent }
    | { kind: 'dayDivider'; value: number }
    | { kind: 'readMarker' }
    | { kind: 'unknown' }

export type RpcTimelineItemContent =
    | { kind: 'message'; value: any }
    | { kind: 'json'; value: any }
    | { kind: 'redactedMessage' }
    | { kind: 'unknown' }

export interface RpcTimelineItemEvent {
    id: string
    txnId: string | null
    eventId: string | null
    content: RpcTimelineItemContent
    localEcho: boolean
    timestamp: number
    sender: string
    sendState: RpcTimelineEventSendState | null
}

export interface RpcTransaction {
    id: string
    createdAt: number
    amount: RpcAmount
    fediFeeStatus: RpcOperationFediFeeStatus | null
    direction: RpcTransactionDirection
    notes: string
    onchainState: RpcOnchainState | null
    bitcoin: RpcBitcoinDetails | null
    lnState: RpcLnState | null
    lightning: RpcLightningDetails | null
    oobState: RpcOOBState | null
    onchainWithdrawalDetails: WithdrawalDetails | null
    stabilityPoolState: RpcStabilityPoolTransactionState | null
}

export type RpcTransactionDirection = 'receive' | 'send'

export type RpcUserId = string

export interface RpcXmppCredentials {
    password: string
    keypairSeed: string
    username: string | null
}

export type SerdeVectorDiff<T> =
    | { kind: 'append'; values: T[] }
    | { kind: 'clear' }
    | { kind: 'pushFront'; value: T }
    | { kind: 'pushBack'; value: T }
    | { kind: 'popFront' }
    | { kind: 'popBack' }
    | { kind: 'insert'; index: number; value: T }
    | { kind: 'set'; index: number; value: T }
    | { kind: 'remove'; index: number }
    | { kind: 'truncate'; length: number }
    | { kind: 'reset'; values: T[] }

export interface SocialRecoveryApproval {
    guardianName: string
    approved: boolean
}

export interface SocialRecoveryEvent {
    approvals: Array<SocialRecoveryApproval>
    remaining: number
}

export interface StabilityPoolDepositEvent {
    federationId: RpcFederationId
    operationId: RpcOperationId
    state: StabilityPoolDepositState
}

export type StabilityPoolDepositState =
    | 'initiated'
    | 'txAccepted'
    | { txRejected: string }
    | { primaryOutputError: string }
    | 'success'

export interface StabilityPoolUnfilledDepositSweptEvent {
    amount: RpcAmount
}

export interface StabilityPoolWithdrawalEvent {
    federationId: RpcFederationId
    operationId: RpcOperationId
    state: StabilityPoolWithdrawalState
}

export type StabilityPoolWithdrawalState =
    | 'invalidOperationType'
    | 'withdrawUnlockedInitiated'
    | { txRejected: string }
    | 'withdrawUnlockedAccepted'
    | { primaryOutputError: string }
    | 'success'
    | { cancellationSubmissionFailure: string }
    | 'cancellationInitiated'
    | 'cancellationAccepted'
    | { awaitCycleTurnoverError: string }
    | { withdrawIdleSubmissionFailure: string }
    | 'withdrawIdleInitiated'
    | 'withdrawIdleAccepted'

export interface TransactionEvent {
    federationId: RpcFederationId
    transaction: RpcTransaction
}

export type TsAny = any

export type UserProfile = any

export interface WithdrawalDetails {
    address: string
    txid: string
    fee: RpcAmount
    feeRate: number
}
