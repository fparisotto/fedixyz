import { useNavigation } from '@react-navigation/native'
import { Header as HeaderRNE, useTheme } from '@rneui/themed'
import React from 'react'
import { View, ViewStyle } from 'react-native'

import { reset } from '../../state/navigation'
import { NavigationHook } from '../../types/navigation'
import { PressableIcon } from './PressableIcon'

interface HeaderBase {
    headerLeft?: React.ReactNode
    headerCenter?: React.ReactNode
    headerRight?: React.ReactNode
    leftContainerStyle?: ViewStyle
    centerContainerStyle?: ViewStyle
    rightContainerStyle?: ViewStyle
    containerStyle?: ViewStyle
    empty?: boolean
    dark?: boolean
    backButton?: boolean
    onBackButtonPress?: () => void
    closeButton?: boolean
    onClose?: () => void
    inline?: boolean
}

interface HeaderWithBackButton extends HeaderBase {
    headerLeft: React.ReactNode
    backButton?: never
}

interface HeaderWithCloseButton extends HeaderBase {
    headerRight: React.ReactNode
    closeButton?: never
}

type HeaderProps = HeaderBase | HeaderWithBackButton | HeaderWithCloseButton

const Header: React.FC<HeaderProps> = ({
    headerLeft,
    headerCenter,
    headerRight,
    leftContainerStyle = {},
    centerContainerStyle = {},
    rightContainerStyle = {},
    containerStyle = {},
    empty,
    dark,
    backButton,
    onBackButtonPress,
    closeButton,
    onClose,
    inline,
}: HeaderProps) => {
    const { theme } = useTheme()
    const navigation = useNavigation<NavigationHook>()

    if (empty) {
        return <View style={{ marginTop: theme.spacing.xxl }} />
    }

    // This logic allows for custom UI in the left side of the Header
    // but the backButton prop overrides any custom headerLeft component
    let leftComponent = <>{headerLeft || null}</>
    if (backButton) {
        leftComponent = (
            <PressableIcon
                testID="HeaderBackButton"
                onPress={() =>
                    typeof onBackButtonPress === 'function'
                        ? onBackButtonPress()
                        : navigation.canGoBack()
                        ? navigation.goBack()
                        : navigation.navigate('TabsNavigator')
                }
                hitSlop={10}
                svgName="ChevronLeft"
                containerStyle={{
                    // shifts the width of the pressable padding
                    // to preserve exact position
                    transform: [{ translateX: -theme.spacing.xs }],
                }}
            />
        )
    }

    // This logic allows for custom UI in the right side of the Header
    // but the closeButton prop overrides any custom headerRight component
    let rightComponent = <>{headerRight || null}</>
    if (closeButton) {
        rightComponent = (
            <PressableIcon
                testID="HeaderCloseButton"
                onPress={
                    typeof onClose === 'function'
                        ? onClose
                        : () => navigation.dispatch(reset('TabsNavigator'))
                }
                hitSlop={10}
                svgName="Close"
            />
        )
    }

    // Merge default container styles defined in theme with prop overrides
    const {
        leftContainerStyle: defaultLeftContainerStyle,
        centerContainerStyle: defaultCenterContainerStyle,
        rightContainerStyle: defaultRightContainerStyle,
        containerStyle: defaultContainerStyle,
    } = theme.components.Header
    const mergedLeftContainerStyle = {
        ...defaultLeftContainerStyle,
        ...leftContainerStyle,
    }
    const mergedCenterContainerStyle = {
        ...defaultCenterContainerStyle,
        ...centerContainerStyle,
    }
    const mergedRightContainerStyle = {
        ...defaultRightContainerStyle,
        ...rightContainerStyle,
    }
    const mergedContainerStyle = {
        ...defaultContainerStyle,
        borderBottomColor: inline
            ? 'transparent'
            : dark
            ? theme.colors.primary
            : defaultContainerStyle.borderBottomColor,
        shadowColor: inline ? 'transparent' : defaultContainerStyle.shadowColor,
        paddingTop: theme.spacing.lg,
        ...containerStyle,
    }

    return (
        <HeaderRNE
            backgroundColor={
                dark ? theme.colors.primary : theme.colors.secondary
            }
            barStyle={dark ? 'light-content' : 'dark-content'}
            containerStyle={mergedContainerStyle}
            centerComponent={<>{headerCenter || null}</>}
            leftComponent={leftComponent}
            rightComponent={rightComponent}
            leftContainerStyle={mergedLeftContainerStyle}
            centerContainerStyle={mergedCenterContainerStyle}
            rightContainerStyle={mergedRightContainerStyle}
            edges={inline ? ['left', 'right'] : undefined}
        />
    )
}

export default Header