import {useDeferredValue, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'
import classNames from 'classnames'
import {sortCards, cardGroupHeader, rarityCount, savedDeckNames} from './deck'
import css from './deck.module.scss'
import DeckLayout from './layout'
import CARDS from 'server/cards'
import {validateDeck} from 'server/utils'
import {CardInfoT, HermitCardT, ItemCardT} from 'types/cards'
import {CardT} from 'types/game-state'
import {PlayerDeckT} from 'types/deck'
import CardList from 'components/card-list'
import Accordion from 'components/accordion'
import Button from 'components/button'
import errorIcon from 'components/svgs/errorIcon'
import Dropdown from 'components/dropdown'
import AlertModal from 'components/alert-modal'

const RARITIES = ['any', 'common', 'rare', 'ultra_rare']
const DECK_ICONS = [
	'any',
	'balanced',
	'builder',
	'explorer',
	'farm',
	'miner',
	'prankster',
	'pvp',
	'redstone',
	'speedrunner',
	'terraform',
]
const iconDropdownOptions = DECK_ICONS.map((option) => ({
	name: option,
	key: option,
	icon: `/images/types/type-${option}.png`,
}))
const rarityDropdownOptions = RARITIES.map((option) => ({
	name: option,
	key: option,
	icon: `/images/rarities/rarity-${option}.png`,
}))

type DeckNameT = {
	loadedDeck: PlayerDeckT
	setDeckName: (name: string) => void
}

const DeckName = ({loadedDeck, setDeckName}: DeckNameT) => {
	const [deckNameInput, setDeckNameInput] = useState<string>(loadedDeck.name)
	const inputValidationMessage =
		deckNameInput.length < 1
			? 'Deck name cannot be empty'
			: 'Deck name may only contain letters, numbers, and spaces.'

	return (
		<div>
			<label htmlFor="deckname">
				Deck Name
				<input
					type="text"
					value={deckNameInput}
					onChange={(e) => setDeckNameInput(e.target.value)}
					maxLength={32}
					placeholder="Untitled Deck"
					className={classNames(css.input)}
					required={true}
					pattern={`^[a-zA-Z0-9 ]*$`}
					onBlur={() => setDeckName(deckNameInput)}
				/>
				<span className={css.errorMessage}>{inputValidationMessage}</span>
			</label>
		</div>
	)
}

type Props = {
	back: () => void
	title: string
	saveDeck: (loadedDeck: PlayerDeckT, initialDeck?: PlayerDeckT) => void
	deck: PlayerDeckT
}

function EditDeck({back, title, saveDeck, deck}: Props) {
	const dispatch = useDispatch()

	// STATE
	const [textQuery, setTextQuery] = useState<string>('')
	const [rarityQuery, setRarityQuery] = useState<string>('')
	const [typeQuery, setTypeQuery] = useState<string>('')
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>(deck)
	const [inputIsFocused, setInputIsFocused] = useState<boolean>(false)
	const [showOverwriteModal, setShowOverwriteModal] = useState<boolean>(false)
	const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false)

	const deferredTextQuery = useDeferredValue(textQuery)
	const deckNameRef = useRef<HTMLInputElement>(null)

	//MISC
	const initialDeckState = deck
	const TYPED_CARDS = CARDS as Record<string, CardInfoT>
	const HTYPE_CARDS = CARDS as Record<string, HermitCardT | ItemCardT>
	const allCards = Object.values(TYPED_CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)
	const selectedCards = {
		hermits: loadedDeck.cards.filter(
			(card) => TYPED_CARDS[card.cardId].type === 'hermit'
		),
		items: loadedDeck.cards.filter(
			(card) => TYPED_CARDS[card.cardId].type === 'item'
		),
		effects: loadedDeck.cards.filter(
			(card) =>
				TYPED_CARDS[card.cardId].type === 'effect' ||
				TYPED_CARDS[card.cardId].type === 'single_use'
		),
	}
	const filteredCards: CardT[] = allCards.filter(
		(card) =>
			// Card Name Filter
			TYPED_CARDS[card.cardId].name
				.toLowerCase()
				.includes(deferredTextQuery.toLowerCase()) &&
			// Card Type Filter
			(HTYPE_CARDS[card.cardId].hermitType === undefined
				? TYPED_CARDS[card.cardId]
				: HTYPE_CARDS[card.cardId].hermitType.includes(typeQuery)) &&
			// Card Rarity Filter
			(rarityQuery !== ''
				? TYPED_CARDS[card.cardId].rarity === rarityQuery
				: TYPED_CARDS[card.cardId].rarity?.includes(rarityQuery))
	)

	//CARD LOGIC
	const clearDeck = () => {
		setLoadedDeck({...loadedDeck, cards: []})
	}
	const addCard = (card: CardT) => {
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			cards: [
				...loadedDeck.cards,
				{cardId: card.cardId, cardInstance: Math.random().toString()},
			],
		}))
	}
	const removeCard = (card: CardT) => {
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			cards: loadedDeck.cards.filter(
				(pickedCard) => pickedCard.cardInstance !== card.cardInstance
			),
		}))
	}

	//DECK LOGIC
	const clearFilters = () => {
		setTextQuery('')
		setRarityQuery('')
		setTypeQuery('')
	}
	const handleDeckIcon = (option: any) => {
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			icon: option,
		}))
	}
	const handleBack = () => {
		if (initialDeckState == loadedDeck) {
			back()
		} else {
			setShowUnsavedModal(true)
		}
	}
	const handleSave = () => {
		const newDeck = {
			...loadedDeck,
			name: deckNameRef.current?.value.trim() || '',
		}

		//If deck name is empty, do nothing
		if (newDeck.name === '') return

		// Check to see if deck name already exists in Local Storage.
		//TODO: Can't use includes as it will match partial values in names. Need match to be exact.
		if (
			savedDeckNames.includes(newDeck.name) &&
			initialDeckState.name !== newDeck.name
		) {
			return setShowOverwriteModal(true)
		}

		// Send toast and return to select deck screen
		saveAndReturn(newDeck, initialDeckState)
	}
	const overwrite = () => {
		const newDeck = {
			...loadedDeck,
			name: deckNameRef.current?.value.trim() || '',
		}
		saveAndReturn(newDeck)
	}
	const saveAndReturn = (deck: PlayerDeckT, initialDeck?: PlayerDeckT) => {
		saveDeck(deck, initialDeck)
		dispatch({
			type: 'SET_TOAST',
			payload: {
				open: true,
				title: 'Deck Saved!',
				description: `Saved ${deck.name}`,
				image: `/images/types/type-${deck.icon}.png`,
			},
		})
		back()
	}
	const validationMessage = validateDeck(
		loadedDeck.cards.map((card) => card.cardId)
	)

	return (
		<>
			<AlertModal
				setOpen={showOverwriteModal}
				onClose={() => setShowOverwriteModal(!showOverwriteModal)}
				action={overwrite}
				title="Overwrite Deck"
				description={`The "${loadedDeck.name}" deck already exists! Would you like to overwrite it?`}
				actionText="Overwrite"
			/>
			<AlertModal
				setOpen={showUnsavedModal}
				onClose={() => setShowUnsavedModal(!showUnsavedModal)}
				action={back}
				title="Leave Editor"
				description="Changes you have made will not be saved. Are you sure you want to leave?"
				actionText="Discard"
			/>
			<DeckLayout title={title} back={handleBack}>
				<DeckLayout.Main
					header={
						<>
							<Dropdown
								button={
									<button className={css.deckImage}>
										<img
											src={`/images/rarities/rarity-${
												rarityQuery === '' ? 'any' : rarityQuery
											}.png`}
										/>
									</button>
								}
								label="Rarity Filter"
								options={rarityDropdownOptions}
								action={(option) =>
									setRarityQuery(option === 'any' ? '' : option)
								}
							/>
							<Dropdown
								button={
									<button className={css.deckImage}>
										<img
											src={`/images/types/type-${
												typeQuery === '' ? 'any' : typeQuery
											}.png`}
										/>
									</button>
								}
								label="Type Filter"
								options={iconDropdownOptions}
								action={(option) =>
									setTypeQuery(option === 'any' ? '' : option)
								}
							/>
							<input
								placeholder="Search cards..."
								className={css.input}
								value={textQuery}
								onChange={(e) => setTextQuery(e.target.value)}
							/>
							<div className={css.dynamicSpace} />
							<Button
								// className={css.clearFilters}
								size="small"
								variant="default"
								onClick={clearFilters}
							>
								Clear Filter
							</Button>
						</>
					}
				>
					<Accordion header={'Hermits'}>
						<CardList
							cards={sortCards(filteredCards).filter(
								(card) => TYPED_CARDS[card.cardId].type === 'hermit'
							)}
							size="small"
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
					<Accordion header={'Items'}>
						<CardList
							cards={sortCards(filteredCards).filter(
								(card) => TYPED_CARDS[card.cardId].type === 'item'
							)}
							size="small"
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
					<Accordion header={'Effects'}>
						<CardList
							cards={sortCards(filteredCards).filter(
								(card) =>
									TYPED_CARDS[card.cardId].type === 'effect' ||
									TYPED_CARDS[card.cardId].type === 'single_use'
							)}
							size="small"
							wrap={true}
							onClick={addCard}
						/>
					</Accordion>
				</DeckLayout.Main>
				<DeckLayout.Sidebar
					width="half"
					header={
						<>
							<p>My Cards</p>
							<div className={css.dynamicSpace} />
							<div className={css.deckDetails}>
								<p
									className={classNames(
										css.cardCount,
										css.dark,
										loadedDeck.cards.length != 42 ? css.error : null
									)}
								>
									{loadedDeck.cards.length}/42
									{/* <span>Cards</span> */}
								</p>
								<div className={classNames(css.cardCount, css.dark)}>
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
					footer={
						<Button
							variant="primary"
							onClick={handleSave}
							styles={{margin: '0.5rem'}}
						>
							Save Deck
						</Button>
					}
				>
					<div style={{margin: '0.5rem'}}>
						{validationMessage && (
							<div className={css.validationMessage}>
								<span style={{paddingRight: '0.5rem'}}>{errorIcon()}</span>{' '}
								{validationMessage}
							</div>
						)}

						<label className={css.editDeckInfo}>
							<h2>Deck Name and Icon</h2>
							<div className={css.editDeckInfoSettings}>
								<Dropdown
									button={
										<button className={css.deckImage}>
											<img src={`/images/types/type-${loadedDeck.icon}.png`} />
										</button>
									}
									label="Deck Icon"
									options={iconDropdownOptions}
									action={(option) => handleDeckIcon(option)}
								/>
								<div className={css.inputValidationGroup}>
									<input
										type="text"
										ref={deckNameRef}
										maxLength={32}
										defaultValue={loadedDeck.name}
										placeholder="Untitled Deck"
										className={classNames(css.input)}
										required={true}
										pattern={`^[a-zA-Z0-9 ]*$`}
										onBlur={() => setInputIsFocused(true)}
										data-focused={inputIsFocused}
									/>
									<span className={css.errorMessage}>
										{deckNameRef.current && deckNameRef.current.value.length < 1
											? 'Deck name cannot be empty'
											: 'Deck name may only contain letters, numbers, and spaces.'}
									</span>
								</div>
							</div>
						</label>

						<br />
						<br />
						<DeckName
							loadedDeck={loadedDeck}
							setDeckName={(deckName) =>
								setLoadedDeck({
									...loadedDeck,
									name: deckName,
								})
							}
						/>
						<br />
						<br />

						<div style={{zIndex: '-1'}}>
							<Accordion
								header={cardGroupHeader('Hermits', selectedCards.hermits)}
							>
								<CardList
									cards={sortCards(selectedCards.hermits)}
									size="small"
									wrap={true}
									onClick={removeCard}
								/>
							</Accordion>
						</div>
						<Accordion header={cardGroupHeader('Items', selectedCards.items)}>
							<CardList
								cards={sortCards(selectedCards.items)}
								size="small"
								wrap={true}
								onClick={removeCard}
							/>
						</Accordion>
						<Accordion
							header={cardGroupHeader('Effects', selectedCards.effects)}
						>
							<CardList
								cards={sortCards(selectedCards.effects)}
								size="small"
								wrap={true}
								onClick={removeCard}
							/>
						</Accordion>
						<Button
							variant="stone"
							style={{margin: '0.5rem', width: '100%'}}
							onClick={clearDeck}
						>
							Remove All
						</Button>
					</div>
				</DeckLayout.Sidebar>
			</DeckLayout>
		</>
	)
}

export default EditDeck
