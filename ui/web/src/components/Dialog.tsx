import * as RadixDialog from '@radix-ui/react-dialog'
import { useCallback } from 'react'

import ChevronLeftIcon from '@fedi/common/assets/svgs/chevron-left.svg'
import CloseIcon from '@fedi/common/assets/svgs/close.svg'

import { useMediaQuery } from '../hooks'
import { config, keyframes, styled, theme } from '../styles'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import { Text } from './Text'

interface Props {
    open: boolean
    onOpenChange(open: boolean): void
    title?: React.ReactNode
    description?: React.ReactNode
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
    disableClose?: boolean
    /**
     * Behaves like a normal dialog when the view is greater than the `sm` breakpoint.
     * If specified, behaves like an overlay on mobile, showing a Back button and a centered header instead of a Close button.
     */
    mobileDismiss?: 'back' | 'close'
}

export const Dialog: React.FC<Props> = ({
    open,
    onOpenChange,
    title,
    description,
    children,
    size,
    disableClose,
    mobileDismiss = 'close',
}) => {
    const isSm = useMediaQuery(config.media.sm)

    const mobileDismissBack = mobileDismiss === 'back' && isSm

    const handleCloseTrigger = useCallback(
        (ev: Event) => {
            if (disableClose) ev.preventDefault()
        },
        [disableClose],
    )

    return (
        <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
            <RadixDialog.Portal>
                <Overlay>
                    <Content
                        size={size}
                        onOpenAutoFocus={ev => ev.preventDefault()}
                        onEscapeKeyDown={handleCloseTrigger}
                        onPointerDownOutside={handleCloseTrigger}
                        onInteractOutside={handleCloseTrigger}>
                        {(title || description) && (
                            <Header>
                                {title && (
                                    <>
                                        <Title>
                                            {!disableClose &&
                                                mobileDismissBack && (
                                                    <BackButtonContainer>
                                                        <IconButton
                                                            icon={
                                                                ChevronLeftIcon
                                                            }
                                                            size="md"
                                                            onClick={() =>
                                                                onOpenChange(
                                                                    false,
                                                                )
                                                            }
                                                        />
                                                    </BackButtonContainer>
                                                )}
                                            <TitleText
                                                variant="body"
                                                weight="bold"
                                                center={isSm}>
                                                {title}
                                            </TitleText>
                                        </Title>
                                    </>
                                )}
                                {description && (
                                    <Description asChild>
                                        <Text variant="caption" weight="medium">
                                            {description}
                                        </Text>
                                    </Description>
                                )}
                            </Header>
                        )}
                        <Main>{children}</Main>
                        {!disableClose && !mobileDismissBack && (
                            <CloseButton>
                                <Icon icon={CloseIcon} />
                            </CloseButton>
                        )}
                    </Content>
                </Overlay>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    )
}

const overlayShow = keyframes({
    '0%': { opacity: 0 },
    '100%': { opacity: 1 },
})

const Overlay = styled(RadixDialog.Overlay, {
    position: 'fixed',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    overflow: 'auto',
    background: theme.colors.primary80,
    animation: `${overlayShow} 150ms ease`,

    '@sm': {
        padding: 0,
        alignItems: 'flex-start',
        background: theme.colors.secondary,
    },
})

const contentShow = keyframes({
    '0%': {
        opacity: 0,
        transform: 'translateY(3%) scale(0.95)',
    },
    '100%': {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
    },
})

const Content = styled(RadixDialog.Content, {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    padding: 32,
    borderRadius: 20,
    width: '90vw',
    background: theme.colors.white,
    overflow: 'hidden',
    animation: `${contentShow} 150ms ease`,

    '@sm': {
        padding: 24,
        width: '100%',
        height: '100%',
        borderRadius: 0,
        maxWidth: 'none !important',
    },

    '@xs': {
        padding: 16,
    },

    '@standalone': {
        '@sm': {
            paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        },
        '@xs': {
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        },
    },

    variants: {
        size: {
            sm: {
                maxWidth: 340,
            },
            md: {
                maxWidth: 500,
            },
            lg: {
                maxWidth: 640,
            },
        },
    },
    defaultVariants: {
        size: 'md',
    },
})

const Header = styled('div', {
    '@sm': {
        textAlign: 'center',
    },
})

const Title = styled(RadixDialog.Title, {
    marginBottom: 8,
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
})

const BackButtonContainer = styled('div', {
    position: 'absolute',
    left: 0,
})

const TitleText = styled(Text, {
    variants: {
        center: {
            true: {
                textAlign: 'center',
                flex: 1,
            },
        },
    },
})

const Description = styled(RadixDialog.Description, {
    color: theme.colors.darkGrey,
    marginBottom: 20,
})

const Main = styled('div', {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
})

const CloseButton = styled(RadixDialog.Close, {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    opacity: 0.5,
    outline: 'none',
    cursor: 'pointer',
    zIndex: 1000,

    '&:hover, &:focus': {
        opacity: 1,
    },

    '@sm': {
        top: 18,
        right: 18,
    },
})