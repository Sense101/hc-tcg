import classNames from 'classnames'
import {useState, useEffect} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT, RarityT} from 'types/cards'
import {CardT} from 'types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import {validateDeck} from 'server/utils'
import css from './deck.module.css'
import Accordion from 'components/accordion'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {PlayerDeckT} from 'types/deck'
import ImportExport from './import-export'

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
	// REDUX
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const settings = useSelector(getSettings)

	// STATE
	const [savedDecks, setSavedDecks] = useState<any>([])
	const [myDecksOpen, setMyDecksOpen] = useState<boolean>(true)
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>(playerDeck)
	const [showImportExport, setShowImportExport] = useState<boolean>(false)
	const [pickedCards, setPickedCards] = useState<CardT[]>(
		playerDeck.cards.map((cardId: any) => ({
			cardId: cardId,
			cardInstance: Math.random().toString(),
		}))
	)

	// FILTERS
	const hermitCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].type === 'hermit'
	)
	const effectCards = pickedCards.filter(
		(card) =>
			TYPED_CARDS[card.cardId].type === 'effect' ||
			TYPED_CARDS[card.cardId].type === 'single_use'
	)
	const itemCards = pickedCards.filter(
		(card) => TYPED_CARDS[card.cardId].type === 'item'
	)
	const rarityCount = (cardGroup: Array<CardT>): RarityT => {
		const common = cardGroup.filter(
			(c) => TYPED_CARDS[c.cardId].rarity === 'common'
		)
		const rare = cardGroup.filter(
			(c) => TYPED_CARDS[c.cardId].rarity === 'rare'
		)
		const ultra_rare = cardGroup.filter(
			(c) => TYPED_CARDS[c.cardId].rarity === 'ultra_rare'
		)

		return {
			common: common.length,
			rare: rare.length,
			ultra_rare: ultra_rare.length,
		}
	}

	// MENU LOGIC
	const backToMenu = () => {
		dispatch({
			type: 'UPDATE_DECK',
			// payload: pickedCards.map((card) => card.cardId), //OLD PAYLOAD
			payload: {
				name: loadedDeck.name,
				icon: loadedDeck.icon,
				cards: pickedCards.map((card) => card.cardId),
			},
		})
		setMenuSection('mainmenu')
	}
	const createNewDeck = () => {
		console.log('CREATE DECK')
		dispatch({
			type: 'UPDATE_DECK',
			payload: [],
		})
		setMenuSection('create-deck')
	}
	const editDeck = () => {
		console.log('EDIT DECK')
		dispatch({
			type: 'UPDATE_DECK',
			payload: pickedCards.map((card) => card.cardId),
		})
		setMenuSection('create-deck')
	}

	//CARD LOGIC
	const loadSavedDecks = () => {
		let lsKey
		const decks = []

		if (playerDeck.name === 'Default') {
			localStorage.setItem(
				'Loadout_Default',
				JSON.stringify({
					name: 'Default',
					icon: 'any',
					cards: pickedCards,
				})
			)
		}

		//loop through Local Storage keys
		for (let i = 0; i < localStorage.length; i++) {
			lsKey = localStorage.key(i)
			// deck = lsKey?.replace(/Loadout_/g, '')

			//if ls key contains 'Loadout_' then add to deckList array.
			if (lsKey?.includes('Loadout_')) {
				decks.push(localStorage.getItem(lsKey))
			}
		}

		console.log('Loaded ' + decks.length + ' decks from Local Storage', decks)
		setSavedDecks(decks.sort())
	}

	const clearDeck = () => {
		setPickedCards([])
	}

	const loadDeck = (deckName: string) => {
		if (!deckName) return console.log('Could not load deck...')
		const deck: PlayerDeckT = JSON.parse(
			localStorage.getItem('Loadout_' + deckName) || '{}'
		)
		console.log('Loading deck:', deck)

		// const deckIds = JSON.parse(deck).cards.filter(
		const deckIds = deck.cards.filter((card: CardT) => TYPED_CARDS[card.cardId])
		setLoadedDeck(deck)
		setPickedCards(deckIds)
	}

	const deleteDeck = () => {
		const confirmDelete = confirm(
			'Are you sure you want to delete the "' + loadedDeck.name + '" deck ?'
		)
		if (confirmDelete) {
			localStorage.removeItem('Loadout_' + loadedDeck.name)
			clearDeck()
			console.log(loadedDeck.name + ' was removed from LocalStorage.')

			// const removedDeck = [...savedDecks].filter((d) => d !== loadedDeck)
			// setSavedDecks(removedDeck)
			// console.log('Decks in localstorage: ', removedDeck)
			loadSavedDecks()
			// Load first deck from local storage
			loadDeck(JSON.parse(savedDecks[0]).name)
		}
	}

	const deckList = savedDecks.map((d: any, i: number) => {
		const deck: PlayerDeckT = JSON.parse(d)
		return (
			<li
				className={classNames(
					css.myDecksItem,
					loadedDeck.name === deck.name ? css.selectedDeck : null
				)}
				key={i}
				onClick={() => {
					loadDeck(deck.name)
					setMyDecksOpen(true)
				}}
			>
				<div className={css.deckImage}>
					<img
						src={'../images/types/type-' + deck.icon + '.png'}
						alt={'deck-icon'}
					/>
				</div>
				{deck.name}
			</li>
		)
	})

	const validationMessage = validateDeck(pickedCards.map((card) => card.cardId))

	// LOAD DECKS ON PAGE LOAD
	useEffect(() => {
		loadSavedDecks()
	}, [setSavedDecks])

	// SWITCH DECKS SFX
	useEffect(() => {
		if (settings.soundOn !== 'off') {
			const pageTurn = [
				'/sfx/Page_turn1.ogg',
				'/sfx/Page_turn2.ogg',
				'/sfx/Page_turn3.ogg',
			]
			const audio = new Audio(
				pageTurn[Math.floor(Math.random() * pageTurn.length)]
			)
			audio.play()
		}
		console.log('Loaded Deck: ', loadedDeck)
	}, [loadedDeck])

	// JSX
	return (
		<>
			<header>
				<div className={css.headerElements}>
					<img
						src="../images/back_arrow.svg"
						alt="back-arrow"
						className={css.headerReturn}
						onClick={backToMenu}
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
							<ul className={css.mobileDeckList}>{deckList}</ul>

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
								<img
									src={
										'../images/types/type-' +
										(!loadedDeck.icon ? 'any' : loadedDeck.icon) +
										'.png'
									}
									alt="deck-icon"
								/>
							</div>
							<p className={css.deckName}>{loadedDeck.name}</p>
							<div className={css.dynamicSpace}></div>
							<p>
								{rarityCount(pickedCards).common},
								{rarityCount(pickedCards).rare},
								{rarityCount(pickedCards).ultra_rare}
							</p>
							<p
								className={classNames(
									css.cardCount,
									pickedCards.length != 42 ? css.error : null
								)}
							>
								{pickedCards.length}/42 <span>Cards</span>
							</p>
							<button onClick={() => editDeck()}>
								<img src="../images/edit-icon.svg" alt="edit" />
							</button>
							<button onClick={() => deleteDeck()}>
								<img src="../images/delete-icon.svg" alt="delete" />
							</button>
						</div>

						<div className={css.deckBody}>
							<div className={css.deckScroll}>
								<div
									className={classNames(
										css.validationMessage,
										!validationMessage ? css.hide : null
									)}
								>
									{validationMessage}
								</div>

								<Accordion
									header={
										<p>
											Hermits{' '}
											<span style={{fontSize: '0.9rem'}}>
												({hermitCards.length}){' '}
												<span>{rarityCount(hermitCards).common}, </span>
												<span>{rarityCount(hermitCards).rare}, </span>
												<span>{rarityCount(hermitCards).ultra_rare}</span>
											</span>
										</p>
									}
								>
									<CardList
										cards={sortCards(hermitCards)}
										size="small"
										wrap={true}
									/>
								</Accordion>
								<Accordion
									header={'Effects' + effectCards.length}
									// rarity={rarityCount(effectCards)}
								>
									<CardList
										cards={sortCards(effectCards)}
										size="small"
										wrap={true}
									/>
								</Accordion>
								<Accordion
									header={'Items' + itemCards.length}
									// rarity={rarityCount(itemCards)}
								>
									<CardList
										cards={sortCards(itemCards)}
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
							<img
								src="../images/card-icon.png"
								alt="card-icon"
								onClick={() => loadSavedDecks()}
							/>
							<p>My Decks</p>
						</div>

						<ul className={css.myDecksList}>{deckList}</ul>

						<div className={css.newDeckButton} onClick={createNewDeck}>
							<p>Create New Deck</p>
						</div>
					</section>
				</div>
			</div>
			{showImportExport ? (
				<ImportExport
					pickedCards={pickedCards}
					setPickedCards={setPickedCards}
					close={() => setShowImportExport(false)}
				/>
			) : null}
		</>
	)
}

export default Deck
