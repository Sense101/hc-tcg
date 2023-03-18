import classNames from 'classnames'
import {useState, useEffect, ReactNode} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {CardInfoT, RarityT} from 'types/cards'
import {CardT} from 'types/game-state'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import {validateDeck} from 'server/utils'
import css from './deck.module.scss'
import Accordion from 'components/accordion'
import DeckLayout from './layout'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {PlayerDeckT} from 'types/deck'
import EditDeck from './deck-edit'
import ImportExport from './import-export'

const TYPED_CARDS = CARDS as Record<string, CardInfoT>

const TYPE_ORDER = {
	hermit: 0,
	effect: 1,
	single_use: 2,
	item: 3,
	health: 4,
}

export const sortCards = (cards: Array<CardT>): Array<CardT> => {
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

// assigns each card in the array an 'ID' (the name of the card)
//   and an instance (a randomly generated number)
export const giveCardInstances = (cards: CardT[]): CardT[] =>
	cards.map((card: any) => ({
		cardId: card,
		cardInstance: Math.random().toString(),
	}))

const rarityCount = (cardGroup: Array<CardT>): RarityT => {
	const common = cardGroup.filter(
		(c) => TYPED_CARDS[c.cardId].rarity === 'common'
	)
	const rare = cardGroup.filter((c) => TYPED_CARDS[c.cardId].rarity === 'rare')
	const ultra_rare = cardGroup.filter(
		(c) => TYPED_CARDS[c.cardId].rarity === 'ultra_rare'
	)

	return {
		common: common.length,
		rare: rare.length,
		ultra_rare: ultra_rare.length,
	}
}

//TODO: This should probably be a component.
export const cardGroupHeader = (title: string, cards: CardT[]) => (
	<p>
		{`${title} `}
		<span style={{fontSize: '0.9rem'}}>
			{`(${cards.length}) `}
			<span className={css.common}>{rarityCount(cards).common} </span>
			<span className={css.rare}>{rarityCount(cards).rare} </span>
			<span className={css.ultraRare}>{rarityCount(cards).ultra_rare}</span>
		</span>
	</p>
)

type Props = {
	setMenuSection: (section: string) => void
}

const Deck = ({setMenuSection}: Props) => {
	// REDUX
	const dispatch = useDispatch()
	const playerDeck = useSelector(getPlayerDeck)
	const settings = useSelector(getSettings)

	// STATE
	const [mode, setMode] = useState<'select' | 'edit' | 'create'>('select')
	const [savedDecks, setSavedDecks] = useState<any>([])
	const [showImportExport, setShowImportExport] = useState<boolean>(false)
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>({
		...playerDeck,
		cards: giveCardInstances(playerDeck.cards),
	})

	// FILTERS
	const hermitCards = loadedDeck.cards.filter(
		(card) => TYPED_CARDS[card.cardId].type === 'hermit'
	)
	const effectCards = loadedDeck.cards.filter(
		(card) =>
			TYPED_CARDS[card.cardId].type === 'effect' ||
			TYPED_CARDS[card.cardId].type === 'single_use'
	)
	const itemCards = loadedDeck.cards.filter(
		(card) => TYPED_CARDS[card.cardId].type === 'item'
	)

	// MENU LOGIC
	const backToMenu = () => {
		dispatch({
			type: 'UPDATE_DECK',
			// payload: loadedDeck.cards.map((card) => card.cardId), //OLD PAYLOAD
			payload: {
				name: loadedDeck.name,
				icon: loadedDeck.icon,
				cards: loadedDeck.cards.map((card) => card.cardId),
			},
		})
		setMenuSection('mainmenu')
	}
	const createNewDeck = () => {
		// clearDeck
		setMode('create')
	}
	const editDeck = () => {
		setMode('edit')
	}

	//CARD LOGIC
	// console.log('SAVED DECKS...', JSON.parse(savedDecks))
	const loadSavedDecks = () => {
		let lsKey
		const decks = []

		if (playerDeck.name === 'Default') {
			localStorage.setItem(
				'Loadout_Default',
				JSON.stringify({
					name: 'Default',
					icon: 'any',
					cards: loadedDeck.cards,
				})
			)
		}

		//loop through Local Storage keys
		for (let i = 0; i < localStorage.length; i++) {
			lsKey = localStorage.key(i)
			// deck = lsKey?.replace(/Loadout_/g, '')

			//if ls key contains 'Loadout_' then add to decks array.
			if (lsKey?.includes('Loadout_')) {
				const key = localStorage.getItem(lsKey)
				decks.push(key)
			}
		}

		console.log('Loaded ' + decks.length + ' decks from Local Storage', decks)
		setSavedDecks(decks.sort())
	}
	const loadDeck = (deckName: string) => {
		if (!deckName)
			return console.log(`[LoadDeck]: Could not load the ${deckName} deck.`)
		const deck: PlayerDeckT = JSON.parse(
			localStorage.getItem('Loadout_' + deckName) || '{}'
		)

		// const deckIds = JSON.parse(deck).cards.filter(
		const deckIds = deck.cards.filter((card: CardT) => TYPED_CARDS[card.cardId])
		setLoadedDeck({
			...deck,
			cards: deckIds,
		})
	}
	const saveDeck = (deck: PlayerDeckT) => {
		// Check if deckName is a valid string
		if (!deck.name || /^\s*$/.test(deck.name)) {
			alert('Invalid deck name. Please try again.')
			return
		}

		const trimmedName = deck.name.trim()

		if (savedDecks.includes(trimmedName)) {
			const confirmOverwrite = confirm(
				'"' + trimmedName + '" already exists! Would you like to overwrite it?'
			)
			if (!confirmOverwrite) return
			localStorage.removeItem('Loadout_' + trimmedName)
			// setLoadedDecks([...loadedDecks].filter(d => d !== newDeckName))
		}

		// Save deck to Local Storage
		localStorage.setItem(
			'Loadout_' + trimmedName,
			JSON.stringify({
				name: deck.name,
				icon: deck.icon,
				cards: deck.cards,
			})
		)
		// setLoadedDecks([newDeckName, ...loadedDecks])
		loadSavedDecks()
		alert('"' + trimmedName + '" was saved to Local Storage!')
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
	const clearDeck = () => {
		setLoadedDeck({
			...loadedDeck,
			cards: [],
		})
	}
	const deckList: ReactNode = savedDecks.map((d: any, i: number) => {
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
	const validationMessage = validateDeck(
		loadedDeck.cards.map((card) => card.cardId)
	)

	// LOAD DECKS ON PAGE LOAD
	useEffect(() => {
		loadSavedDecks()
	}, [setSavedDecks])

	// SWITCH DECKS EFFECT
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

	// SWITCH DECK MODE
	useEffect(() => {
		router()
	}, [mode])

	// SELECT DECK MODE ... TODO: Create own component
	const SelectDeck = () => (
		<DeckLayout title="Deck Selection" back={backToMenu}>
			{showImportExport && (
				<ImportExport
					pickedCards={loadedDeck.cards}
					setPickedCards={() => alert('SET PICKED CARDS...')}
					close={() => setShowImportExport(false)}
				/>
			)}
			<DeckLayout.Sidebar
				header={
					<>
						<img src="../images/card-icon.png" alt="card-icon" />
						<p>My Decks</p>
					</>
				}
				footer={
					<>
						<button className={css.newDeckButton} onClick={createNewDeck}>
							<p>Create New Deck</p>
						</button>
						<button
							className={classNames(css.button, 'stoneButton')}
							onClick={() => setShowImportExport(true)}
						>
							Import
						</button>
					</>
				}
			>
				{deckList}
			</DeckLayout.Sidebar>
			<DeckLayout.Main
				header={
					<>
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
							<span className={css.common}>
								{rarityCount(loadedDeck.cards).common}
							</span>{' '}
							<span className={css.rare}>
								{rarityCount(loadedDeck.cards).rare}
							</span>{' '}
							<span className={css.ultraRare}>
								{rarityCount(loadedDeck.cards).ultra_rare}
							</span>
						</p>
						<p
							className={classNames(
								css.cardCount,
								loadedDeck.cards.length != 42 ? css.error : null
							)}
						>
							{loadedDeck.cards.length}/42 <span>Cards</span>
						</p>
						<button className={'stoneButton'} onClick={() => editDeck()}>
							<img src="../images/edit-icon.svg" alt="edit" />
						</button>
						<button className={'stoneButton'} onClick={() => deleteDeck()}>
							<img src="../images/delete-icon.svg" alt="delete" />
						</button>
					</>
				}
			>
				<div
					className={classNames(
						css.validationMessage,
						!validationMessage ? css.hide : null
					)}
				>
					{validationMessage}
				</div>

				<Accordion header={cardGroupHeader('Hermits', hermitCards)}>
					<CardList cards={sortCards(hermitCards)} size="small" wrap={true} />
				</Accordion>

				<Accordion header={cardGroupHeader('Effects', effectCards)}>
					<CardList cards={sortCards(effectCards)} size="small" wrap={true} />
				</Accordion>

				<Accordion header={cardGroupHeader('Items', itemCards)}>
					<CardList cards={sortCards(itemCards)} size="small" wrap={true} />
				</Accordion>
			</DeckLayout.Main>
		</DeckLayout>
	)

	// MODE ROUTER
	const router = () => {
		switch (mode) {
			case 'select':
				return <SelectDeck />
				break
			case 'edit':
				return (
					<EditDeck
						back={() => setMode('select')}
						title={'Deck Editor'}
						saveDeck={(returnedDeck) => saveDeck(returnedDeck)}
						deck={loadedDeck}
					/>
				)
				break
			case 'create':
				return (
					<EditDeck
						back={() => setMode('select')}
						title={'Deck Creation'}
						saveDeck={(returnedDeck) => saveDeck(returnedDeck)}
						deck={{
							name: '',
							icon: 'any',
							cards: [],
						}}
					/>
				)
				break
			default:
				return <SelectDeck />
		}
	}

	return router()
}

export default Deck
