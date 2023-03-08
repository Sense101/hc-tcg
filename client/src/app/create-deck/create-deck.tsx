import classNames from 'classnames'
import {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import {validateDeck} from 'server/utils'
import css from './create-deck.module.css'
import {getPlayerDeck} from 'logic/session/session-selectors'
import Accordion from 'components/accordion'

//
// THIS PAGE IS VERY MUCH A WIP AND DOES NOT CURRENTLY WORK.
//

const TYPED_CARDS = CARDS as Record<string, CardInfoT>
// const HERMIT_CARDS = CARDS as Record<string, HermitCardT>

const TYPE_ORDER = {
	hermit: 0,
	effect: 1,
	single_use: 2,
	item: 3,
	health: 4,
}

const sortCards = (cards: Array<CardT>): Array<CardT> => {
	return cards.slice().sort((a: CardT, b: CardT) => {
		const cardInfoA = TYPED_CARDS[a.cardId]
		const cardInfoB = TYPED_CARDS[b.cardId]
		if (cardInfoA.type !== cardInfoB.type) {
			return TYPE_ORDER[cardInfoA.type] - TYPE_ORDER[cardInfoB.type]
		} else if (
			cardInfoA.type === 'hermit' &&
			cardInfoB.type === 'hermit' &&
			cardInfoA.hermitType !== cardInfoB.hermitType
		) {
			return cardInfoA.hermitType.localeCompare(cardInfoB.hermitType)
		}
		return cardInfoA.name.localeCompare(cardInfoB.name)
	})
}

type Props = {
	setMenuSection: (section: string) => void
}

const Deck = ({setMenuSection}: Props) => {
	// REDUX
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	// console.log('Player Deck: ', playerDeck)

	// STATE
	const [deckName, setDeckName] = useState<string>('')
	const [savedDecks, setSavedDecks] = useState<any>([])
	// const [loadedDecks, setLoadedDecks] = useState<any>([])
	const [myDecksOpen, setMyDecksOpen] = useState<boolean>(true)
	const [pickedCards, setPickedCards] = useState<CardT[]>(
		playerDeck.cards.map((cardId: any) => ({
			cardId: cardId,
			cardInstance: Math.random().toString(),
			// cardInfo: TYPED_CARDS[cardId],
		}))
	)

	console.log('Picked Cards: ', pickedCards)

	// FILTERS
	const commonCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'common'
	)
	const rareCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'rare'
	)
	const ultraRareCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'ultra_rare'
	)
	const hermitCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].type === 'hermit'
	)
	// const effectCards = pickedCards.filter(
	// 	(card) =>
	// 		TYPED_CARDS[card.cardId].type === 'effect' ||
	// 		TYPED_CARDS[card.cardId].type === 'single_use'
	// )
	// const itemCards = pickedCards.filter(
	// 	(card) => TYPED_CARDS[card.cardId].type === 'item'
	// )

	// MENU LOGIC
	const backToMenu = () => {
		dispatch({
			type: 'UPDATE_DECK',
			payload: pickedCards.map((card) => card.cardId),
		})
		setMenuSection('mainmenu')
	}

	// CARD LOGIC
	const addCard = (card: CardT) => {
		setPickedCards((pickedCards) => {
			return [
				...pickedCards,
				{cardId: card.cardId, cardInstance: Math.random().toString()},
			]
		})
	}
	const removeCard = (card: CardT) => {
		setPickedCards((pickedCards) =>
			pickedCards.filter(
				(pickedCard) => pickedCard.cardInstance !== card.cardInstance
			)
		)
	}
	const clearDeck = () => {
		setPickedCards([])
	}
	// const saveDeck = () => {
	// 	// Check if deckName is a valid string
	// 	if (!deckName || /^\s*$/.test(deckName)) {
	// 		alert('Invalid deck name. Please try again.')
	// 		return
	// 	}
	// 	const newDeckName = deckName.trim()

	// 	// Check if deck name already exists
	// 	if (loadedDecks.includes(newDeckName)) {
	// 		const confirmOverwrite = confirm(
	// 			'"' + newDeckName + '" already exists! Would you like to overwrite it?'
	// 		)
	// 		if (!confirmOverwrite) return
	// 		localStorage.removeItem('Loadout_' + newDeckName)
	// 		setLoadedDecks([...loadedDecks].filter((d) => d !== newDeckName))
	// 	}

	// 	// Save deck to Local Storage
	// 	localStorage.setItem('Loadout_' + newDeckName, JSON.stringify({name: newDeckName, icon: 'balanced', cards:pickedCards}))
	// 	console.log(JSON.stringify(pickedCards))
	// 	setLoadedDecks([newDeckName, ...loadedDecks])
	// 	alert('"' + newDeckName + '" was saved to Local Storage!')
	// }
	const saveDeck = () => {
		// Check if deckName is a valid string
		if (!deckName || /^\s*$/.test(deckName)) {
			alert('Invalid deck name. Please try again.')
			return
		}
		const newDeckName = deckName.trim()

		// Check if deck name already exists
		if (savedDecks.includes(newDeckName)) {
			const confirmOverwrite = confirm(
				'"' + newDeckName + '" already exists! Would you like to overwrite it?'
			)
			if (!confirmOverwrite) return
			localStorage.removeItem('Loadout_' + newDeckName)
			setSavedDecks([...savedDecks].filter((d) => d !== newDeckName))
		}

		// Save deck to Local Storage
		// localStorage.setItem('Loadout_' + newDeckName, JSON.stringify(pickedCards))
		localStorage.setItem(
			'Loadout_' + newDeckName,
			JSON.stringify({name: newDeckName, icon: 'redstone', cards: pickedCards})
		)
		console.log(JSON.stringify(pickedCards))
		setSavedDecks([newDeckName, ...savedDecks])
		// loadSavedDecks()
		alert('"' + newDeckName + '" was saved to Local Storage!')
	}

	const loadDeck = (selectedDeck: any) => {
		console.log('Loading deck: ', selectedDeck)
		if (!selectedDeck) return console.log('Could not load deck...')
		const deck: any = localStorage.getItem('Loadout_' + selectedDeck)
		const deckIds = JSON.parse(deck).filter(
			(card: CardT) => TYPED_CARDS[card.cardId]
		)
		setPickedCards(deckIds)
	}

	const allCards = Object.values(TYPED_CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)

	// const deckList = (
	// 	<Accordion title="Hermits" count={hermitCards.length}>
	// 		<p>{}</p>
	// 	</Accordion>
	// )

	// const deckList = hermitCards.map((c, i) => {
	// 	const card = HERMIT_CARDS[c.cardId]
	// 	return (
	// 		<li key={i}>
	// 			{card.name} - {card.type} - {card.health}
	// 		</li>
	// 	)
	// })

	const deckList = hermitCards.map((c, i) => {
		const card = TYPED_CARDS[c.cardId]
		return (
			<li key={i}>
				{card.name || 'name'} - {card.type || 'type'}
			</li>
		)
	})

	const validationMessage = validateDeck(pickedCards.map((card) => card.cardId))
	const sortedAllCards = sortCards(allCards)
	const sortedDeckCards = sortCards(pickedCards)

	return (
		<>
			<header>
				<div className={css.headerElements}>
					<img
						src="../images/back_arrow.svg"
						alt="back-arrow"
						className={css.headerReturn}
						onClick={() => setMenuSection('deck')}
					/>
					<p className={css.title}>Deck Editor</p>
				</div>
			</header>

			<div className={css.background} />
			<div className={css.body}>
				<div className={css.deckWrapper}>
					{/* MOBILE DECK SELECTION SECTION */}
					<section className={css.mobileDeckSelect}>
						{/* Header */}
						<div
							className={css.myDecksHeader}
							onClick={() => setMyDecksOpen(!myDecksOpen)}
						>
							<img src="../images/card-icon.png" alt="card-icon" />
							<p>My Cards</p>
						</div>

						{/* Content */}
						<div
							className={classNames(
								css.mobileDeckContent,
								myDecksOpen ? css.hide : null
							)}
						>
							{/* Deck list */}
							<div className={css.mobileDeckList}>
								{deckList}
								<br />
								{hermitCards.map((c) => c.cardId)}
							</div>

							{/* Create button */}
							<div className={css.newDeckButton}>
								<p>Create New Deck</p>
							</div>
						</div>
					</section>

					{/* ALL CARDS SECTION */}
					<section className={css.deck}>
						<div className={css.deckHeader}>
							<div className={css.deckImage}>
								<img src="../images/types/type-explorer.png" alt="explorer" />
							</div>
							<input
								maxLength={32}
								name="deckName"
								placeholder="Untitled deck"
								onBlur={(e) => {
									console.log(e.target.value)
								}}
							/>
							<div className={css.dynamicSpace}></div>
							<p className={css.cardCount}>
								42/42 <span>Cards</span>
							</p>
							<button>
								<img src="../images/edit-icon.svg" alt="edit" />
							</button>
							<button>
								<img src="../images/delete-icon.svg" alt="delete" />
							</button>
						</div>

						<div className={css.deckBody}>
							<div className={css.deckScroll}>
								<Accordion title="Hermits" count={1}>
									<CardList cards={sortedAllCards} size="small" wrap={true} />
								</Accordion>
							</div>
						</div>
					</section>

					{/* MY CARDS SECTION */}
					<section className={css.myDecks}>
						<div className={css.myDecksHeader}>
							<img src="../images/card-icon.png" alt="card-icon" />
							<p>My Cards</p>
							<p>
								{pickedCards.length}/42 <span>cards</span>
							</p>
						</div>

						<ul className={css.myDecksList}>
							{deckList} <br />
							{hermitCards.map((c) => c.cardId)}
						</ul>

						<div className={css.newDeckButton}>
							<p>Create New Deck</p>
						</div>
					</section>
				</div>
			</div>

			{/* HIDING ALL THE OLD STUFF SO I CAN EASILY REFERENCE IT */}
			<div>
				<div className={css.deck}>
					<div className={css.header}>
						<button disabled={!!validationMessage} onClick={backToMenu}>
							Back to menu
						</button>
						<div className={css.limits}>{validationMessage}</div>
						<div className={css.dynamicSpace} />
						<button onClick={clearDeck}>Clear</button>
						<div>
							<input
								maxLength={25}
								name="deckName"
								placeholder="Deck Name..."
								onBlur={(e) => {
									setDeckName(e.target.value)
								}}
							/>
							<button type="button" onClick={saveDeck}>
								Save
							</button>

							<select
								className={css.deckSelection}
								name="deckSelection"
								id="deckSelection"
								onChange={(e) => {
									loadDeck(e.target.value)
								}}
							>
								<option value="">Saved Decks</option>
								{/* {loadedDecks.map((d: string) => (
									<option key={d} value={d}>
										{d}
									</option>
								))} */}
							</select>
							<button type="button">Delete</button>
						</div>
					</div>

					<div className={css.cards}>
						<div className={classNames(css.cardColumn, css.allCards)}>
							<div className={css.cardsTitle}>All cards</div>
							<CardList
								cards={sortedAllCards}
								onClick={addCard}
								size="small"
								wrap={true}
							/>
						</div>
						<div className={classNames(css.cardColumn, css.selectedCards)}>
							<div className={css.cardsTitle}>
								<span>Your deck ({pickedCards.length})</span>
								<span> - </span>
								<span className={css.commonAmount} title="Common">
									{commonCards.length}
								</span>
								<span> </span>
								<span className={css.rareAmount} title="Rare">
									{rareCards.length}
								</span>
								<span> </span>
								<span className={css.ultraRareAmount} title="Ultra rare">
									{ultraRareCards.length}
								</span>
							</div>
							<CardList
								cards={sortedDeckCards}
								onClick={removeCard}
								size="small"
								wrap={true}
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default Deck
