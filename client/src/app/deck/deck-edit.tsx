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

type Props = {
	back: () => void
	title: string
	deck: PlayerDeckT
}

function EditDeck({back, title, deck}: Props) {
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
				{cardId: card.cardId, cardInstance: card.cardInstance},
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

	return (
		<DeckLayout title={title} back={back}>
			<DeckLayout.Sidebar
				header={
					<>
						<img src="../images/card-icon.png" alt="card-icon" />
						<p>My Cards</p>
					</>
				}
				footer={
					<div
						className={css.newDeckButton}
						onClick={() => alert('Save Deck...')}
					>
						<p>Save Deck</p>
					</div>
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
				<button onClick={clearDeck}>Remove All</button>
			</DeckLayout.Sidebar>
			<DeckLayout.Main
				header={
					<div>
						<input
							placeholder="Search cards..."
							value={textQuery}
							onChange={(e) => setTextQuery(e.target.value)}
						/>
						<button onClick={() => setTextQuery('')}>x</button>
						<select
							name="type"
							id="type"
							className={css.typeFilter}
							onChange={(e) => setRarityQuery(e.target.value)}
						>
							<option value="">Rarity</option>
							<option disabled>──────────</option>
							<option value="common">⭐</option>
							<option value="rare">⭐⭐</option>
							<option value="ultra_rare">⭐⭐⭐</option>
						</select>
						<select
							name="type"
							id="type"
							onChange={(e) => setTypeQuery(e.target.value)}
						>
							<option value="">Type</option>
							<option disabled>──────────</option>
							<option value="balanced">Balanced</option>
							<option value="builder">Builder</option>
							<option value="explorer">Explorer</option>
							<option value="farm">Farm</option>
							<option value="miner">Miner</option>
							<option value="prankster">Prankster</option>
							<option value="pvp">PVP</option>
							<option value="redstone">Redstone</option>
							<option value="speedrunner">Speedrunner</option>
							<option value="terraform">Terraform</option>
						</select>
					</div>
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
		</DeckLayout>
	)
}

export default EditDeck
