import { useNavigation } from '@react-navigation/native'
import { Button, Text, Theme, useTheme } from '@rneui/themed'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    Image,
    useWindowDimensions,
} from 'react-native'
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context'

import { CommonState } from '@fedi/common/redux'
import {
    removeCustomGlobalMod,
    selectGlobalCustomMods,
    selectGlobalSuggestedMods,
    setCustomGlobalModVisibility,
    setSuggestedGlobalModVisibility,
} from '@fedi/common/redux/mod'
import { FediMod } from '@fedi/common/types'

import { FediModImages } from '../assets/images'
import CustomOverlay, {
    CustomOverlayContents,
} from '../components/ui/CustomOverlay'
import SvgImage, { getIconSizeMultiplier } from '../components/ui/SvgImage'
import { useAppDispatch, useAppSelector } from '../state/hooks'

const FediModSettings: React.FC = () => {
    const { theme } = useTheme()
    const { fontScale } = useWindowDimensions()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    const navigation = useNavigation()

    const suggestedFediMods = useAppSelector(selectGlobalSuggestedMods)
    const suggestedVisibility = useAppSelector(
        (s: CommonState) => s.mod.suggestedGlobalModVisibility,
    )

    const customFediMods = useAppSelector(selectGlobalCustomMods)
    const customVisibility = useAppSelector(
        (s: CommonState) => s.mod.customGlobalModVisibility,
    )

    const reduxDispatch = useAppDispatch()

    const [deletingMod, setDeletingMod] = useState<FediMod>()
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    useEffect(() => {
        if (deletingMod === undefined) {
            setIsDeleting(false)
        }
    }, [deletingMod])

    const style = styles(theme, fontScale, insets)

    const handleDeletePress = (fediMod: FediMod) => {
        setDeletingMod(fediMod)
    }

    const handleToggleCustomVisibility = useCallback(
        (mod: FediMod) => {
            reduxDispatch(
                setCustomGlobalModVisibility({
                    modId: mod.id,
                    isHidden: !customVisibility[mod.id]?.isHidden,
                }),
            )
        },
        [customVisibility, reduxDispatch],
    )

    const handleToggleSuggestedVisibility = useCallback(
        (mod: FediMod) => {
            reduxDispatch(
                setSuggestedGlobalModVisibility({
                    modId: mod.id,
                    isHidden: !suggestedVisibility[mod.id]?.isHidden,
                }),
            )
        },
        [suggestedVisibility, reduxDispatch],
    )

    const confirmationContent: CustomOverlayContents = useMemo(() => {
        const confirmModDeletion = () => {
            if (!deletingMod) {
                return
            }

            setIsDeleting(true)

            reduxDispatch(removeCustomGlobalMod({ modId: deletingMod.id }))

            setDeletingMod(undefined)
            setIsDeleting(false)
        }

        return {
            headerElement: (
                <Image
                    style={style.modTile}
                    source={{ uri: deletingMod?.imageUrl || '' }}
                    resizeMode="contain"
                />
            ),
            title: t('feature.fedimods.delete-confirmation', {
                fediMod: deletingMod?.title,
            }),
            buttons: [
                {
                    text: t('words.cancel'),
                    onPress: () => setDeletingMod(undefined),
                    primary: false,
                },
                {
                    text: t('words.delete'),
                    onPress: confirmModDeletion,
                    primary: true,
                },
            ],
        }
    }, [t, deletingMod, reduxDispatch, style.modTile])

    const renderCustomMods = useCallback(() => {
        return customFediMods.map(mod => {
            const isHidden = customVisibility[mod.id]?.isHidden

            return (
                <ModRow
                    key={mod.id}
                    isHidden={isHidden}
                    mod={mod}
                    onDelete={handleDeletePress}
                    onToggleVisibility={handleToggleCustomVisibility}
                    canDelete
                />
            )
        })
    }, [customFediMods, customVisibility, handleToggleCustomVisibility])

    const renderSuggestedMods = useCallback(() => {
        return suggestedFediMods.map(mod => {
            const isHidden = suggestedVisibility[mod.id]?.isHidden

            return (
                <ModRow
                    key={mod.id}
                    isHidden={isHidden}
                    mod={mod}
                    onToggleVisibility={handleToggleSuggestedVisibility}
                />
            )
        })
    }, [
        suggestedFediMods,
        suggestedVisibility,
        handleToggleSuggestedVisibility,
    ])

    return (
        <View style={style.container}>
            <ScrollView
                style={style.scrollContainer}
                contentContainerStyle={style.contentContainer}
                overScrollMode="auto">
                {customFediMods.length > 0 || suggestedFediMods.length > 0 ? (
                    <>
                        <Text style={style.label}>
                            {t('feature.fedimods.your-mods')}
                        </Text>
                        <View style={style.fediModsContainer}>
                            {renderSuggestedMods()}
                            {renderCustomMods()}
                        </View>

                        <CustomOverlay
                            show={!!deletingMod}
                            contents={confirmationContent}
                            loading={isDeleting}
                            onBackdropPress={() => setDeletingMod(undefined)}
                        />
                    </>
                ) : (
                    <View style={style.empty}>
                        <Pressable
                            onPress={() => navigation.navigate('AddFediMod')}>
                            <SvgImage name="NewModIcon" size={48} />
                        </Pressable>
                        <Text>{t('feature.fedimods.add-mods-homescreen')}</Text>
                    </View>
                )}
            </ScrollView>
            <Button onPress={() => navigation.navigate('AddFediMod')}>
                {t('feature.fedimods.add-a-mod')}
            </Button>
        </View>
    )
}

interface ModRowProps {
    canDelete?: boolean
    isHidden: boolean
    mod: FediMod
    onDelete?: (mod: FediMod) => void
    onToggleVisibility: (mod: FediMod) => void
}

const ModRow = ({
    canDelete,
    isHidden,
    mod,
    onDelete,
    onToggleVisibility,
}: ModRowProps) => {
    const { theme } = useTheme()
    const { fontScale } = useWindowDimensions()
    const insets = useSafeAreaInsets()
    const [loaded, setLoaded] = useState(false)
    // use local image if we have it
    // then try image url
    // fallback to default
    const [imageSrc, setImageSrc] = useState(
        FediModImages[mod.id] ||
            (mod.imageUrl ? { uri: mod.imageUrl } : FediModImages.default),
    )

    const style = styles(theme, fontScale, insets)

    return (
        <View key={mod.id} style={style.fediMod}>
            <Image
                style={[style.iconImage, !loaded ? style.loadingState : {}]}
                source={imageSrc}
                resizeMode="contain"
                // use fallback if url fails to load
                onError={() => {
                    setImageSrc(FediModImages.default)
                }}
                onLoadEnd={() => setLoaded(true)}
            />

            <View style={style.fediModText}>
                <Text>{mod.title}</Text>
                <Text small>{mod.url}</Text>
            </View>
            <Pressable onPress={() => onToggleVisibility(mod)}>
                <SvgImage name={isHidden ? 'EyeClosed' : 'Eye'} size={24} />
            </Pressable>
            {canDelete && (
                <Pressable onPress={() => onDelete?.(mod)}>
                    <SvgImage name="Close" size={24} />
                </Pressable>
            )}
        </View>
    )
}

const styles = (theme: Theme, fontScale: number, insets: EdgeInsets) => {
    const iconSize = theme.sizes.lg * getIconSizeMultiplier(fontScale)

    return StyleSheet.create({
        scrollContainer: {
            flex: 1,
        },
        contentContainer: {
            flexGrow: 1,
            gap: theme.spacing.lg,
        },
        container: {
            flex: 1,
            flexDirection: 'column',
            gap: theme.spacing.md,
            paddingTop: theme.spacing.lg,
            paddingLeft: insets.left + theme.spacing.lg,
            paddingRight: insets.right + theme.spacing.lg,
            paddingBottom: Math.max(insets.bottom, theme.spacing.lg),
        },
        empty: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
        },
        fediModsContainer: {
            gap: theme.spacing.lg,
        },
        fediMod: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
            justifyContent: 'space-between',
        },
        fediModText: {
            flex: 1,
        },
        iconImage: {
            width: 32,
            height: 32,
            overflow: 'hidden',
            borderRadius: 8,
        },
        loadingState: {
            opacity: 0,
            width: 1,
            height: 1,
        },
        label: {
            color: theme.colors.darkGrey,
        },
        modTile: {
            width: iconSize,
            height: iconSize,
            overflow: 'hidden',
            borderRadius: theme.borders.fediModTileRadius,
            marginBottom: theme.spacing.lg,
        },
    })
}

export default FediModSettings
