import classNames from 'classnames'
import css from './button.module.scss'
import './button.module.scss'
import {ReactNode} from 'react'

interface ButtonT extends React.ComponentPropsWithoutRef<'button'> {
	variant?: 'default' | 'primary' | 'secondary' | 'error' | 'stone'
	emphasis?: boolean
	onClick?: () => void
	children: ReactNode
	styles?: React.CSSProperties
}

const Button = ({children, variant, emphasis, onClick, styles}: ButtonT) => {
	return (
		<button
			className={classNames(
				css.button,
				variant ? css[variant] : '',
				emphasis ? css.emphasis : ''
			)}
			onClick={onClick}
			style={styles}
		>
			{children}
		</button>
	)
}

interface SplitButtonT extends React.ComponentPropsWithoutRef<'div'> {
	children: ReactNode
	props?: React.HTMLAttributes<HTMLDivElement>
}

const SplitButton = ({children, ...props}: SplitButtonT) => (
	<div className={css.splitButton} {...props}>
		{children}
	</div>
)

Button.SplitGroup = SplitButton

export default Button
