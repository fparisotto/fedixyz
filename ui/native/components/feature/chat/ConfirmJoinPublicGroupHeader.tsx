import { useNavigation } from '@react-navigation/native'
import React from 'react'

import { NavigationHook } from '../../../types/navigation'
import Header from '../../ui/Header'

const ConfirmJoinPublicGroupHeader: React.FC = () => {
    const navigation = useNavigation<NavigationHook>()
    return (
        <Header
            closeButton
            onClose={() => {
                if (navigation.canGoBack()) navigation.goBack()
            }}
        />
    )
}

export default ConfirmJoinPublicGroupHeader
