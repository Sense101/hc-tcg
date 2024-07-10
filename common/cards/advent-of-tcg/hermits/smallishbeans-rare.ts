import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {CardInstance} from '../../../types/game-state'
import {getActiveRowPos} from '../../../utils/board'
import Card, {Hermit, hermit} from '../../base/card'

class SmallishbeansRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'smallishbeans_rare',
		numericId: 219,
		name: 'Joel',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 2,
		type: 'pvp',
		health: 280,
		primary: {
			name: '11ft',
			cost: ['pvp', 'any'],
			damage: 70,
			power: null,
		},
		secondary: {
			name: 'Lore',
			cost: ['pvp', 'pvp', 'any'],
			damage: 30,
			power: 'Deal 20 extra damage for each item attached. Double items count twice.',
		},
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player, row} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const activeRow = getActiveRowPos(player)
			if (!activeRow) return

			let partialSum = 0

			activeRow.row.itemCards.forEach((item) => {
				if (!item || !item.props.id.includes('item')) return
				if (item.props.rarity === 'rare') partialSum += 1
				partialSum += 1
			})

			attack.addDamage(this.props.id, partialSum * 20)
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default SmallishbeansRareHermitCard
