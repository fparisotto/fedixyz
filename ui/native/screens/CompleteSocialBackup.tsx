import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button, Theme, useTheme } from '@rneui/themed'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import Share from 'react-native-share'

import { makeLog } from '@fedi/common/utils/log'

import HoloGuidance from '../components/ui/HoloGuidance'
import SvgImage, { SvgImageSize } from '../components/ui/SvgImage'
import {
    completeSocialBackup,
    useBackupRecoveryContext,
} from '../state/contexts/BackupRecoveryContext'
import { useBridge } from '../state/hooks'
import type { RootStackParamList } from '../types/navigation'

const log = makeLog('CompleteSocialBackup')

export type Props = NativeStackScreenProps<
    RootStackParamList,
    'CompleteSocialBackup'
>

const BACKUPS_REQUIRED = 2

const CompleteSocialBackup: React.FC<Props> = ({ navigation }: Props) => {
    const { t } = useTranslation()
    const { theme } = useTheme()
    const { locateRecoveryFile } = useBridge()
    const [backupsCompleted, setBackupsCompleted] = useState<number>(0)
    const { dispatch } = useBackupRecoveryContext()
    const [isCreatingBackup, setIsCreatingBackup] = useState(false)

    const createBackup = async () => {
        setIsCreatingBackup(true)
        try {
            const recoveryFilePath = await locateRecoveryFile()
            await Share.open({
                title: 'Your Fedi Backup File',
                // FIXME: this needs file:// prefix ... should do this with a util?
                url: `file://${recoveryFilePath}`,
            })
            setBackupsCompleted(
                Math.min(BACKUPS_REQUIRED, backupsCompleted + 1),
            )
        } catch (error) {
            log.error('createBackup', error)
        }
        setIsCreatingBackup(false)
    }

    return (
        <ScrollView contentContainerStyle={styles(theme).container}>
            <HoloGuidance
                iconImage={<SvgImage name="FediFile" size={SvgImageSize.lg} />}
                title={t('feature.backup.save-your-wallet-backup-file')}
                titleProps={{ bold: true }}
                message={t('feature.backup.save-your-wallet-backup-file-where')}
            />
            <View style={styles(theme).buttonsContainer}>
                {backupsCompleted > 0 && (
                    <Button
                        fullWidth
                        type="clear"
                        title={t(
                            'feature.backup.save-your-wallet-backup-file-again',
                        )}
                        onPress={createBackup}
                        loading={isCreatingBackup}
                    />
                )}
                <Button
                    fullWidth
                    title={
                        backupsCompleted === 0
                            ? t('feature.backup.save-file')
                            : t('words.complete')
                    }
                    containerStyle={styles(theme).saveFileButton}
                    onPress={() => {
                        if (backupsCompleted === 0) {
                            createBackup()
                        } else {
                            dispatch(completeSocialBackup())
                            navigation.navigate('SocialBackupSuccess')
                        }
                    }}
                    loading={isCreatingBackup}
                />
            </View>
        </ScrollView>
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
        buttonsContainer: {
            marginTop: 'auto',
            alignItems: 'center',
            width: '100%',
            marginBottom: theme.spacing.md,
        },
        saveFileButton: {
            marginTop: theme.spacing.md,
        },
    })

export default CompleteSocialBackup