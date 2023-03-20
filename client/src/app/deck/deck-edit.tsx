import {useState} from 'react'
import DeckLayout from './layout'
import CardList from 'components/card-list'
import CARDS from 'server/cards'
import Accordion from 'components/accordion'
import {CardInfoT, HermitCardT, ItemCardT} from 'types/cards'
import {CardT} from 'types/game-state'
import {PlayerDeckT} from 'types/deck'
import css from './deck.module.scss'
import {sortCards, cardGroupHeader} from './deck'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'
import Button from 'components/button'

const DECK_ICONS = [
	'any',
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

const RARITIES = ['any', 'common', 'rare', 'ultra_rare']

type Props = {
	back: () => void
	title: string
	saveDeck: (loadedDeck: PlayerDeckT) => void
	deck: PlayerDeckT
}

function EditDeck({back, title, saveDeck, deck}: Props) {
	// STATE
	const [textQuery, setTextQuery] = useState<string>('')
	const [rarityQuery, setRarityQuery] = useState<string>('')
	const [typeQuery, setTypeQuery] = useState<string>('')
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>(deck)

	//MISC
	const TYPED_CARDS = CARDS as Record<string, CardInfoT>
	const HTYPE_CARDS = CARDS as Record<string, HermitCardT | ItemCardT>
	const allCards = Object.values(TYPED_CARDS).map(
		(card: CardInfoT): CardT => ({
			cardId: card.id,
			cardInstance: card.id,
		})
	)

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

	const filteredCards: CardT[] = allCards.filter(
		(card) =>
			// Card Name Filter
			TYPED_CARDS[card.cardId].name
				.toLowerCase()
				.includes(textQuery.toLowerCase()) &&
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

	const handleDeckName = (e: any) => {
		setLoadedDeck((loadedDeck) => ({
			...loadedDeck,
			name: e.target.value,
		}))
	}

	const handleBack = () => {
		// alert('TEST!')
		back()
	}

	return (
		<DeckLayout title={title} back={handleBack}>
			<DeckLayout.Sidebar
				header={
					<>
						<img src="../images/card-icon.png" alt="card-icon" />
						<p>My Cards</p>
					</>
				}
				footer={
					<Button
						variant="primary"
						onClick={() => saveDeck(loadedDeck)}
						styles={{margin: '0.5rem'}}
					>
						Save Deck
					</Button>
				}
			>
				<Accordion
					header={cardGroupHeader('Hermits', hermitCards)}
					// header={'test'}
				>
					<CardList
						cards={sortCards(hermitCards)}
						size="small"
						wrap={true}
						onClick={removeCard}
					/>
				</Accordion>
				<Accordion header={cardGroupHeader('Items', itemCards)}>
					<CardList
						cards={sortCards(itemCards)}
						size="small"
						wrap={true}
						onClick={removeCard}
					/>
				</Accordion>
				<Accordion header={cardGroupHeader('Effects', effectCards)}>
					<CardList
						cards={sortCards(effectCards)}
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
			</DeckLayout.Sidebar>
			<DeckLayout.Main
				header={
					<>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button
									className={css.IconButton}
									aria-label="Customise options"
								>
									<img src={`/images/types/type-${loadedDeck.icon}.png`} />
								</button>
							</DropdownMenu.Trigger>

							<DropdownMenu.Content
								className={css.DropdownMenuContent}
								sideOffset={4}
							>
								<DropdownMenu.Arrow></DropdownMenu.Arrow>
								<DropdownMenu.Label className={css.DropdownMenuLabel}>
									Deck Icon
								</DropdownMenu.Label>
								{DECK_ICONS.map((option) => (
									<React.Fragment key={option}>
										<DropdownMenu.RadioItem
											value={option}
											key={option}
											onSelect={() => handleDeckIcon(option)}
											className={css.DropdownMenuItem}
										>
											<DropdownMenu.ItemIndicator>x</DropdownMenu.ItemIndicator>
											<img
												src={`/images/types/type-${option}.png`}
												style={{height: '1.5rem', width: '1.5rem'}}
												alt={option}
											/>
											<span>{option}</span>
										</DropdownMenu.RadioItem>
									</React.Fragment>
								))}
							</DropdownMenu.Content>
						</DropdownMenu.Root>

						<input
							type="text"
							maxLength={32}
							value={loadedDeck.name}
							placeholder="Untitled Deck"
							onChange={handleDeckName}
							className={css.editableDeckName}
						/>
						<div className={css.dynamicSpace}></div>
					</>
				}
			>
				{/* Filters Section */}
				<div className={css.filters}>
					<button className={css.clearFilters} onClick={clearFilters}>
						x
					</button>
					{/* RADIX DECK ICON DROPDOWN */}
					{/* TODO: MOVE INTO HEADER */}

					{/* RADIX RARITY FILTER DROPDOWN */}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<button className={css.IconButton} aria-label="Customise options">
								<img
									src={`/images/rarities/rarity-${
										rarityQuery === '' ? 'any' : rarityQuery
									}.png`}
								/>
							</button>
						</DropdownMenu.Trigger>

						<DropdownMenu.Content
							className={css.DropdownMenuContent}
							sideOffset={4}
						>
							<DropdownMenu.Arrow></DropdownMenu.Arrow>
							<DropdownMenu.Label className={css.DropdownMenuLabel}>
								Rarity Filter
							</DropdownMenu.Label>
							{RARITIES.map((option) => (
								<>
									<DropdownMenu.RadioItem
										value={option}
										key={option}
										onSelect={() =>
											setRarityQuery(option === 'any' ? '' : option)
										}
										className={css.DropdownMenuItem}
									>
										<DropdownMenu.ItemIndicator>x</DropdownMenu.ItemIndicator>
										<img
											// src={`../../images/rarity-${option}.png`}
											src={`/images/rarities/rarity-${option}.png`}
											// src={any}
											style={{height: '1.5rem', width: '1.5rem'}}
											alt={option}
										/>
										<span>{option}</span>
									</DropdownMenu.RadioItem>
								</>
							))}
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					{/* RADIX TYPE FILTER DROPDOWN */}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<button className={css.IconButton} aria-label="Customise options">
								<img
									src={`/images/types/type-${
										typeQuery === '' ? 'any' : typeQuery
									}.png`}
								/>
							</button>
						</DropdownMenu.Trigger>

						<DropdownMenu.Content
							className={css.DropdownMenuContent}
							sideOffset={4}
						>
							<DropdownMenu.Arrow></DropdownMenu.Arrow>
							<DropdownMenu.Label className={css.DropdownMenuLabel}>
								Type Filter
							</DropdownMenu.Label>
							{DECK_ICONS.map((option) => (
								<>
									<DropdownMenu.RadioItem
										value={option}
										key={option}
										onSelect={() =>
											setTypeQuery(option === 'any' ? '' : option)
										}
										className={css.DropdownMenuItem}
									>
										<DropdownMenu.ItemIndicator>x</DropdownMenu.ItemIndicator>
										<img
											src={`/images/types/type-${option}.png`}
											style={{height: '1.5rem', width: '1.5rem'}}
											alt={option}
										/>
										<span>{option}</span>
									</DropdownMenu.RadioItem>
								</>
							))}
						</DropdownMenu.Content>
					</DropdownMenu.Root>

					{/* REST OF THE UI */}
					<input
						placeholder="Search cards..."
						value={textQuery}
						onChange={(e) => setTextQuery(e.target.value)}
					/>
				</div>

				{/* Cards Section */}
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
		</DeckLayout>
	)
}

export default EditDeck
