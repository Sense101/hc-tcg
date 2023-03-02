import classNames from 'classnames'
import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT} from 'types/cards'
import {CardT} from 'types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import {validateDeck} from 'server/utils'
import css from './deck.module.css'
import {getPlayerDeck} from 'logic/session/session-selectors'
import Accordion from 'components/accordion'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

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
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const [pickedCards, setPickedCards] = useState<CardT[]>(
		playerDeck.map((cardId: any) => ({
			cardId: cardId,
			cardInstance: Math.random().toString(),
		}))
	)

	const [deckName, setDeckName] = useState<string>('')

	const [selectedDeck, setSelectedDeck] = useState<string>('')

	const [loadedDecks, setLoadedDecks] = useState<any>([])

	const [myDecksOpen, setMyDecksOpen] = useState<boolean>(true)

	const commonCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'common'
	)
	const rareCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'rare'
	)
	const ultraRareCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].rarity === 'ultra_rare'
	)

	const validationMessage = validateDeck(pickedCards.map((card) => card.cardId))

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
	const backToMenu = () => {
		dispatch({
			type: 'UPDATE_DECK',
			payload: pickedCards.map((card) => card.cardId),
		})
		setMenuSection('mainmenu')
	}

	//TODO: Not working yet...
	const createNewDeck = () => {
		console.log('CREATE NEW DECK')
		setMenuSection('create-deck')
	}

	const loadSavedDecks = () => {
		let lskey, deck
		const deckList = []

		//loop through Local Storage keys
		for (let i = 0; i < localStorage.length; i++) {
			lskey = localStorage.key(i)
			deck = lskey?.replace(/Loadout_/g, '')

			//if ls key contains 'Loadout_' then add to deckList array.
			if (lskey?.includes('Loadout_')) {
				deckList.push(deck)
			}
		}

		console.log(
			'Loaded ' + deckList.length + ' decks from Local Storage',
			deckList.sort()
		)
		setLoadedDecks(deckList.sort())
	}

	useEffect(() => {
		loadSavedDecks()
	}, [])

	const clearDeck = () => {
		setPickedCards([])
	}

	const saveDeck = () => {
		// Check if deckName is a valid string
		if (!deckName || /^\s*$/.test(deckName)) {
			alert('Invalid deck name. Please try again.')
			return
		}
		const newDeckName = deckName.trim()

		// Check if deck name already exists
		if (loadedDecks.includes(newDeckName)) {
			const confirmOverwrite = confirm(
				'"' + newDeckName + '" already exists! Would you like to overwrite it?'
			)
			if (!confirmOverwrite) return
			localStorage.removeItem('Loadout_' + newDeckName)
			setLoadedDecks([...loadedDecks].filter((d) => d !== newDeckName))
		}

		// Save deck to Local Storage
		localStorage.setItem('Loadout_' + newDeckName, JSON.stringify(pickedCards))
		console.log(JSON.stringify(pickedCards))
		setLoadedDecks([newDeckName, ...loadedDecks])
		loadSavedDecks()
		alert('"' + newDeckName + '" was saved to Local Storage!')
	}

	const loadDeck = (selectedDeck: any) => {
		console.log('Loading deck: ', selectedDeck)
		setSelectedDeck(selectedDeck)
		if (!selectedDeck) return console.log('Could not load deck...')
		const deck: any = localStorage.getItem('Loadout_' + selectedDeck)
		const deckIds = JSON.parse(deck).filter(
			(card: CardT) => TYPED_CARDS[card.cardId]
		)
		setPickedCards(deckIds)
	}

	const deleteDeck = (deck: string) => {
		const confirmDelete = confirm(
			'Are you sure you want to delete the "' + deck + '" deck ?'
		)
		if (confirmDelete) {
			localStorage.removeItem('Loadout_' + deck)
			clearDeck()
			console.log(deck + ' was removed from LocalStorage.')

			const removedDeck = [...loadedDecks].filter((d) => d !== deck)
			setLoadedDecks(removedDeck)
			console.log('Decks in localstorage: ', removedDeck)
		}
	}

	const allCards = Object.values(TYPED_CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)

	const sortedAllCards = sortCards(allCards)
	const sortedDeckCards = sortCards(pickedCards)

	const sampleDecks = [
		{
			id: 1,
			image: '../images/types/type-redstone.png',
			alt: 'redstone',
			name: 'Redstone Deck',
		},
		{
			id: 2,
			image: '../images/types/type-prankster.png',
			alt: 'prankster',
			name: 'Obsidian Destroyer',
		},
		{
			id: 3,
			image: '../images/types/type-builder.png',
			alt: 'builder',
			name: 'Builders melt your face so much it hurts!',
		},
		{
			id: 4,
			image: '../images/types/type-farm.png',
			alt: 'farm',
			name: "Tango's Deck",
		},
		{
			id: 5,
			image: '../images/types/type-balanced.png',
			alt: 'balanced',
			name: 'Balanced Beauty',
		},
		{
			id: 6,
			image: '../images/types/type-prankster.png',
			alt: 'prankster',
			name: 'Mumbo Madness',
		},
		{
			id: 7,
			image: '../images/types/type-builder.png',
			alt: 'builder',
			name: 'Build',
		},
		{
			id: 8,
			image: '../images/types/type-explorer.png',
			alt: 'farm',
			name: 'Exploring these cards',
		},
		{
			id: 9,
			image: '../images/types/type-pvp.png',
			alt: 'pvp',
			name: '*Sword noises*',
		},
		{
			id: 10,
			image: '../images/types/type-terraform.png',
			alt: 'prankster',
			name: 'Future Gem Deck',
		},
		{
			id: 11,
			image: '../images/types/type-speedrunner.png',
			alt: 'speedrunner',
			name: 'Gotta go fast!',
		},
		{
			id: 12,
			image: '../images/types/type-miner.png',
			alt: 'miner',
			name: 'TFC only',
		},
		{
			id: 21,
			image: '../images/types/type-redstone.png',
			alt: 'redstone',
			name: 'Redstone Deck',
		},
		{
			id: 22,
			image: '../images/types/type-prankster.png',
			alt: 'prankster',
			name: 'Obsidian Destroyer',
		},
		{
			id: 23,
			image: '../images/types/type-builder.png',
			alt: 'builder',
			name: 'This is a super long deck nameie',
		},
		{
			id: 24,
			image: '../images/types/type-farm.png',
			alt: 'farm',
			name: "Tango's Deck",
		},
		{
			id: 25,
			image: '../images/types/type-balanced.png',
			alt: 'balanced',
			name: 'Balanced Beauty',
		},
		{
			id: 26,
			image: '../images/types/type-prankster.png',
			alt: 'prankster',
			name: 'Mumbo Madness',
		},
		{
			id: 27,
			image: '../images/types/type-builder.png',
			alt: 'builder',
			name: 'Build',
		},
		{
			id: 28,
			image: '../images/types/type-explorer.png',
			alt: 'farm',
			name: 'Exploring these cards',
		},
		{
			id: 29,
			image: '../images/types/type-pvp.png',
			alt: 'pvp',
			name: '*Sword noises*',
		},
	]

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
				<div className={css.deckWrapper}>
					{/* MOBILE DECK SELECTION SECTION */}
					<section className={css.mobileDeckSelect}>
						{/* Header */}
						<div
							className={css.myDecksHeader}
							onClick={() => setMyDecksOpen(!myDecksOpen)}
						>
							<img src="../images/card-icon.png" alt="card-icon" />
							<p>My Decks</p>
						</div>

						{/* Content */}
						<div
							className={classNames(
								css.mobileDeckContent,
								myDecksOpen ? css.hide : null
							)}
						>
							{/* Deck list */}
							<ul className={css.mobileDeckList}>
								{sampleDecks.map((scard) => (
									<li
										className={css.myDecksItem}
										key={scard.id}
										onClick={() => {
											setMyDecksOpen(!myDecksOpen)
											console.log(scard)
										}}
									>
										<div className={css.deckImage}>
											<img src={scard.image} alt={scard.alt} />
										</div>
										{scard.name}
									</li>
								))}
							</ul>

							{/* Create button */}
							<div className={css.newDeckButton} onClick={createNewDeck}>
								<p>Create New Deck</p>
							</div>
						</div>
					</section>

					{/* SELECTED DECK SECTION */}
					<section className={css.deck}>
						<div className={css.deckHeader}>
							<div className={css.deckImage}>
								<img src="../images/types/type-explorer.png" alt="explorer" />
							</div>
							<p>Char limit 32</p>
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
								<Accordion
									title="Hermits"
									count={sortedDeckCards.slice(0, 9).length}
								>
									<CardList
										cards={sortedDeckCards.slice(0, 9)}
										size="small"
										wrap={true}
									/>
								</Accordion>
								<Accordion
									title="Effects"
									count={sortedDeckCards.slice(10, 20).length}
								>
									<CardList
										cards={sortedDeckCards.slice(10, 20)}
										size="small"
										wrap={true}
									/>
								</Accordion>
								<Accordion
									title="Items"
									count={sortedDeckCards.slice(20, 42).length}
								>
									<CardList
										cards={sortedDeckCards.slice(20, 42)}
										size="small"
										wrap={true}
									/>
								</Accordion>
							</div>
						</div>
					</section>

					{/* MY DECKS SECTION */}
					<section className={css.myDecks}>
						<div className={css.myDecksHeader}>
							<img src="../images/card-icon.png" alt="card-icon" />
							<p>My Decks</p>
						</div>

						<ul className={css.myDecksList}>
							{sampleDecks.map((scard) => (
								<li className={css.myDecksItem} key={scard.id}>
									<div className={css.deckImage}>
										<img src={scard.image} alt={scard.alt} />
									</div>
									{scard.name}
								</li>
							))}
						</ul>

						<div className={css.newDeckButton} onClick={createNewDeck}>
							<p>Create New Deck</p>
						</div>
					</section>
				</div>
			</div>

			{/* HIDING ALL THE OLD STUFF SO I CAN EASILY REFERENCE IT */}
			<div className={css.hide}>
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
								{loadedDecks.map((d: string) => (
									<option key={d} value={d}>
										{d}
									</option>
								))}
							</select>
							<button
								type="button"
								onClick={() => {
									deleteDeck(selectedDeck)
								}}
							>
								Delete
							</button>
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
