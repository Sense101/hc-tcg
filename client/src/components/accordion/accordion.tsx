import classnames from 'classnames'
import React, {useState} from 'react'
import css from './accordion.module.css'
import {RarityT} from 'types/cards'

type Props = {
	children: React.ReactNode
	title?: string
	count: number
	rarity?: RarityT
}

function Accordion({children, title, count, rarity}: Props) {
	const [isActive, setIsActive] = useState<boolean>(true)
	return (
		<div className={css.accordion}>
			<div
				className={css.accordionHeader}
				onClick={() => setIsActive(!isActive)}
			>
				<h3>
					{title}{' '}
					<span>
						({count}) - {rarity?.common}, {rarity?.rare}, {rarity?.ultra_rare}
					</span>
				</h3>
				<img
					src="../images/caret-down.svg"
					alt="caret-down"
					style={isActive ? {} : {transform: 'rotate(-180deg)'}}
				/>
			</div>
			<div
				className={classnames(css.accordionContent, isActive ? null : css.hide)}
			>
				{children}
			</div>
		</div>
	)
}

export default Accordion
