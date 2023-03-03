import css from './create-deck.module.css'

type Props = {
	setMenuSection: (section: string) => void
}

const CreateDeck = ({setMenuSection}: Props) => {
	return (
		<>
			<header>
				<div className={css.headerElements}>
					<img
						src="../images/back_arrow.svg"
						alt="back-arrow"
						className={css.headerReturn}
						onClick={() => setMenuSection('mainmenu')}
					/>
					<p className={css.title}>Deck Selection</p>
				</div>
			</header>

			<div className={css.background} />
			<div className={css.body}>
				<div className={css.deckWrapper}>Body</div>
			</div>
		</>
	)
}

export default CreateDeck
