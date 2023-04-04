import classNames from 'classnames'
import css from './button.module.scss'
import './button.module.scss'
import {ReactNode, forwardRef} from 'react'
import React from 'react'

// interface ButtonT extends React.ComponentPropsWithoutRef<'button'> {
interface ButtonT extends React.ComponentPropsWithRef<'button'> {
	ref?: any
	variant?: 'default' | 'primary' | 'secondary' | 'error' | 'stone'
	size?: 'small' | 'medium' | 'large'
	emphasis?: boolean
	leftSlot?: ReactNode
	rightSlot?: ReactNode
	children: ReactNode
	styles?: React.CSSProperties
	onClick?: () => void
}

const Button = ({
	variant,
	size,
	emphasis,
	leftSlot,
	rightSlot,
	children,
	styles,
	onClick,
}: ButtonT) => {
	return (
		<button
			className={classNames(
				css.button,
				variant && css[variant],
				size && css[size],
				emphasis && css.emphasis
			)}
			onClick={onClick}
			style={styles}
		>
			{leftSlot && <span className={css.leftSlot}>{leftSlot}</span>}
			{children}
			{rightSlot && <span className={css.rightSlot}>{rightSlot}</span>}
		</button>
	)
}

const RefButton = forwardRef(function TestButton(
	{
		variant,
		size,
		emphasis,
		leftSlot,
		rightSlot,
		children,
		styles,
		onClick,
	}: ButtonT,
	ref: React.ForwardedRef<any>
) {
	return (
		<button
			ref={ref}
			className={classNames(
				css.button,
				variant && css[variant],
				size && css[size],
				emphasis && css.emphasis
			)}
			onClick={onClick}
			style={styles}
		>
			{leftSlot && <span className={css.leftSlot}>{leftSlot}</span>}
			{children}
			{rightSlot && <span className={css.rightSlot}>{rightSlot}</span>}
		</button>
	)
})

interface SplitButtonT extends React.ComponentPropsWithRef<'div'> {
	children: ReactNode
	props?: React.HTMLAttributes<HTMLDivElement>
}

const SplitButton = ({children, ...props}: SplitButtonT) => (
	<div className={css.splitButton} {...props}>
		{children}
	</div>
)

Button.SplitGroup = SplitButton
Button.Ref = RefButton

export default Button
