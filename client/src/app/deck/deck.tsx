import classNames from 'classnames'
import {useState, ReactNode} from 'react'
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
import {ImportExportModal} from './modals'
import Button from 'components/button'
import AlertModal from 'components/alert-modal'
import {DeleteIcon, EditIcon, ErrorIcon} from 'components/svgs'
import {ToastT} from 'types/app'

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
export const giveCardInstances = (cards: CardT[] | string[]): CardT[] =>
	cards.map((card: any) => ({
		cardId: card,
		cardInstance: Math.random().toString(),
	}))

export const rarityCount = (cardGroup: Array<CardT>): RarityT => {
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

// TODO: Convert to component
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

export const getSavedDecks = () => {
	let lsKey
	const decks = []

	//loop through Local Storage keys
	for (let i = 0; i < localStorage.length; i++) {
		lsKey = localStorage.key(i)

		if (lsKey?.includes('Deck_')) {
			const key = localStorage.getItem(lsKey)
			decks.push(key)
		}
	}

	console.log('Loaded ' + decks.length + ' decks from Local Storage')
	return decks.sort()
}

export const savedDeckNames = getSavedDecks().map(
	(name) => JSON.parse(name || '')?.name
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
	const [savedDecks, setSavedDecks] = useState<any>(getSavedDecks)
	const [importedDeck, setImportedDeck] = useState<PlayerDeckT>({
		name: 'undefined',
		icon: 'any',
		cards: [],
	})
	const [showDeleteDeckModal, setShowDeleteDeckModal] = useState<boolean>(false)
	const [showImportExportModal, setShowImportExportModal] =
		useState<boolean>(false)
	const [showValidateDeckModal, setShowValidateDeckModal] =
		useState<boolean>(false)
	const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false)
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>({
		...playerDeck,
		cards: giveCardInstances(playerDeck.cards),
	})

	// TOASTS
	const dispatchToast = (toast: ToastT) =>
		dispatch({type: 'SET_TOAST', payload: toast})
	const deleteToast: ToastT = {
		open: true,
		title: 'Deck Deleted!',
		description: `Removed ${loadedDeck.name}`,
		image: `/images/types/type-${loadedDeck.icon}.png`,
	}
	const selectedDeckToast: ToastT = {
		open: true,
		title: 'Deck Selected!',
		description: `${loadedDeck.name} is now your active deck`,
		image: `images/types/type-${loadedDeck.icon}.png`,
	}
	const lastValidDeckToast: ToastT = {
		open: true,
		title: 'Deck Selected!',
		description: `${playerDeck.name} is now your active deck`,
		image: `images/types/type-${playerDeck.icon}.png`,
	}

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
		if (loadedDeck.cards.length < 42) {
			return setShowValidateDeckModal(true)
		}

		dispatchToast(selectedDeckToast)

		dispatch({
			type: 'UPDATE_DECK',
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
	const handleInvalidDeck = () => {
		setMenuSection('mainmenu')
		dispatchToast(lastValidDeckToast)
	}
	const handleImportDeck = (deck: PlayerDeckT) => {
		setImportedDeck(deck)
		importDeck(deck)
	}

	//DECK LOGIC
	const loadDeck = (deckName: string) => {
		if (!deckName)
			return console.log(`[LoadDeck]: Could not load the ${deckName} deck.`)
		const deck: PlayerDeckT = JSON.parse(
			localStorage.getItem('Deck_' + deckName) || '{}'
		)

		// const deckIds = JSON.parse(deck).cards.filter(
		const deckIds = deck.cards.filter((card: CardT) => TYPED_CARDS[card.cardId])
		setLoadedDeck({
			...deck,
			cards: deckIds,
		})
	}
	const importDeck = (deck: PlayerDeckT) => {
		let deckExists = false
		savedDeckNames.map((name) => {
			if (name === deck.name) {
				console.log(`Name: ${name} | Import: ${deck.name}`)
				deckExists = true
			}
		})
		deckExists && setShowOverwriteModal(true)
		!deckExists && saveDeck(deck)
	}
	const saveDeck = (deck: PlayerDeckT, prevDeck?: PlayerDeckT) => {
		//Remove previous deck from Local Storage
		prevDeck && localStorage.removeItem(`Deck_${prevDeck.name}`)

		//Save new deck to Local Storage
		localStorage.setItem(
			'Deck_' + deck.name,
			JSON.stringify({
				name: deck.name,
				icon: deck.icon,
				cards: deck.cards,
			})
		)

		//Refresh saved deck list and load new deck
		setSavedDecks(getSavedDecks())
		loadDeck(deck.name)
	}
	const deleteDeck = () => {
		dispatchToast(deleteToast)
		localStorage.removeItem('Deck_' + loadedDeck.name)
		setSavedDecks(getSavedDecks())
		loadDeck(JSON.parse(savedDecks[0]).name)
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
					playSwitchDeckSFX()
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

	//MISC
	const playSwitchDeckSFX = () => {
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
	}

	// TODO: Convert to component
	const SelectDeck = () => {
		return (
			<>
				<ImportExportModal
					setOpen={showImportExportModal}
					onClose={() => setShowImportExportModal(!showImportExportModal)}
					importDeck={(deck) => handleImportDeck(deck)}
					loadedDeck={loadedDeck}
				/>
				<AlertModal
					setOpen={showValidateDeckModal}
					onClose={() => setShowValidateDeckModal(!showValidateDeckModal)}
					action={handleInvalidDeck}
					title="Invalid Deck"
					description={`The "${loadedDeck.name}" deck is invalid and cannot be used in
					matches. If you continue, your last valid deck will be used instead.`}
					actionText="Main Menu"
				/>
				<AlertModal
					setOpen={showDeleteDeckModal}
					onClose={() => setShowDeleteDeckModal(!showDeleteDeckModal)}
					action={() => deleteDeck()}
					title="Delete Deck"
					description={`Are you sure you wish to delete the "${loadedDeck.name}" deck?`}
					actionText="Delete"
				/>
				<AlertModal
					setOpen={showOverwriteModal}
					onClose={() => setShowOverwriteModal(!showOverwriteModal)}
					action={() => saveDeck(importedDeck)}
					title="Overwrite Deck"
					description={`The "${loadedDeck.name}" deck already exists! Would you like to overwrite it?`}
					actionText="Overwrite"
				/>

				<DeckLayout title="Deck Selection" back={backToMenu}>
					<DeckLayout.Main
						header={
							<>
								<div className={css.headerGroup}>
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

									<p
										className={classNames(
											css.cardCount,
											loadedDeck.cards.length != 42 ? css.error : null
										)}
									>
										{loadedDeck.cards.length}/42
										{/* <span>Cards</span> */}
									</p>
									<div className={css.cardCount}>
										<p className={css.common}>
											{rarityCount(loadedDeck.cards).common}
										</p>{' '}
										<p className={css.rare}>
											{rarityCount(loadedDeck.cards).rare}
										</p>{' '}
										<p className={css.ultraRare}>
											{rarityCount(loadedDeck.cards).ultra_rare}
										</p>
									</div>
								</div>
							</>
						}
					>
						<div className={css.filterGroup}>
							<Button
								variant="default"
								size="small"
								onClick={() => editDeck()}
								leftSlot={<EditIcon />}
							>
								Edit Deck
							</Button>
							<Button
								variant="error"
								size="small"
								leftSlot={<DeleteIcon />}
								onClick={() => setShowDeleteDeckModal(true)}
							>
								Delete Deck
							</Button>
						</div>
						{validationMessage && (
							<div className={css.validationMessage}>
								<span style={{paddingRight: '0.5rem'}}>{<ErrorIcon />}</span>{' '}
								{validationMessage}
							</div>
						)}

						<Accordion header={cardGroupHeader('Hermits', hermitCards)}>
							<CardList
								cards={sortCards(hermitCards)}
								size="small"
								wrap={true}
							/>
						</Accordion>

						<Accordion header={cardGroupHeader('Effects', effectCards)}>
							<CardList
								cards={sortCards(effectCards)}
								size="small"
								wrap={true}
							/>
						</Accordion>

						<Accordion header={cardGroupHeader('Items', itemCards)}>
							<CardList cards={sortCards(itemCards)} size="small" wrap={true} />
						</Accordion>
					</DeckLayout.Main>
					<DeckLayout.Sidebar
						header={
							<>
								<img
									src="../images/card-icon.png"
									alt="card-icon"
									className={css.sidebarIcon}
								/>
								<p style={{marginInline: 'auto'}}>My Decks</p>
							</>
						}
						footer={
							<>
								<Button.SplitGroup style={{padding: '0.5rem'}}>
									<Button variant="primary" onClick={createNewDeck}>
										Create New Deck
									</Button>
									<Button
										variant="primary"
										onClick={() =>
											setShowImportExportModal(!showImportExportModal)
										}
									>
										<img
											src="/images/import.svg"
											alt="import"
											className={css.caret}
										/>
									</Button>
								</Button.SplitGroup>
							</>
						}
					>
						{deckList}
					</DeckLayout.Sidebar>
				</DeckLayout>
			</>
		)
	}

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
