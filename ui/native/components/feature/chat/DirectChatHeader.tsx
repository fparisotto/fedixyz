import { RouteProp, useRoute } from '@react-navigation/native'
import { Text, Theme, useTheme } from '@rneui/themed'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { selectChatMember } from '@fedi/common/redux'

import { useAppSelector } from '../../../state/hooks'
import { RootStackParamList } from '../../../types/navigation'
import Avatar from '../../ui/Avatar'
import Header from '../../ui/Header'

type ChatRouteProp = RouteProp<RootStackParamList, 'DirectChat'>

/** @deprecated XMPP legacy code  */
const DirectChatHeader: React.FC = () => {
    const { theme } = useTheme()
    const route = useRoute<ChatRouteProp>()
    const memberId = route.params.memberId
    const member = useAppSelector(s => selectChatMember(s, memberId))
    const username = member?.username || memberId.split('@')[0] || ''

    return (
        <>
            <Header
                backButton
                containerStyle={styles(theme).container}
                leftContainerStyle={styles(theme).headerLeftContainer}
                centerContainerStyle={styles(theme).headerCenterContainer}
                headerCenter={
                    <View style={styles(theme).memberContainer}>
                        <Avatar id={member?.id || ''} name={username} />
                        <Text
                            bold
                            numberOfLines={1}
                            style={styles(theme).memberText}>
                            {username}
                        </Text>
                    </View>
                }
            />
        </>
    )
}

const styles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        headerLeftContainer: {
            height: theme.sizes.md,
        },
        headerCenterContainer: {
            flex: 6,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
        },
        memberText: {
            marginLeft: theme.spacing.sm,
        },
        memberContainer: {
            padding: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
    })

export default DirectChatHeader
