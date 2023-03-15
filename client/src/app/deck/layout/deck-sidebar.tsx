import {ReactNode, useState} from 'react'
import classNames from 'classnames'
import css from './deck-sidebar.module.scss'

type Props = {
	children: ReactNode
	header?: ReactNode
	footer?: ReactNode
}

function DeckSidebar({children, header, footer}: Props) {
	const [active, setActive] = useState<boolean>(true)

	return (
		<section className={css.sidebar}>
			<div className={css.header} onClick={() => setActive(!active)}>
				{header}
			</div>

			<div className={classNames(css.bodyWrapper, active ? css.hide : null)}>
				<div className={css.body}>{children}</div>
				{footer}
			</div>
		</section>
	)
}

export default DeckSidebar
