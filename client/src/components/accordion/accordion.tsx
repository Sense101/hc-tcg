import classnames from 'classnames'
import React, {useState} from 'react'
import css from './accordion.module.css'

type Props = {
	children: React.ReactNode
	title?: string
	count: number
}

function Accordion({children, title, count}: Props) {
	const [isActive, setIsActive] = useState<boolean>(true)
	return (
		<div className={css.accordion}>
			<div
				className={css.accordionHeader}
				onClick={() => setIsActive(!isActive)}
			>
				<h3>
					{title} <span>({count})</span>
				</h3>
				<img src="../images/caret-down.svg" alt="caret-down" />
			</div>
			<div
				className={classnames(
					css.accordionContent,
					isActive ? null : css.hideAccordion
				)}
			>
				{children}
			</div>
		</div>
	)
}

export default Accordion
