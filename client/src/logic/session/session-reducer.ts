import {AnyAction} from 'redux'
import {PlayerDeckT} from 'types/deck'

type SessionState = {
	playerName: string
	playerId: string
	playerSecret: string
	playerDeck: PlayerDeckT
	connecting: boolean
}

const defaultState: SessionState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
	playerDeck: {name: 'Default', icon: 'any', cards: []},
	connecting: false,
}

const loginReducer = (
	state = defaultState,
	action: AnyAction
): SessionState => {
	switch (action.type) {
		case 'LOGIN':
			return {...state, connecting: true}
		case 'DISCONNECT':
			return {
				...state,
				connecting: false,
				playerName: '',
				playerId: '',
				playerSecret: '',
				playerDeck: {
					name: 'Default',
					icon: 'any',
					cards: [],
				},
			}
		case 'SET_PLAYER_INFO':
			return {
				...state,
				connecting: false,
				...action.payload,
			}
		case 'SET_NEW_DECK':
			return {
				...state,
				playerDeck: action.payload,
			}
		default:
			return state
	}
}

export default loginReducer
