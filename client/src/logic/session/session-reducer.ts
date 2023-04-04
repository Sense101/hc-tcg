import {AnyAction} from 'redux'
import {PlayerDeckT} from 'types/deck'
import {ToastT} from 'types/app'

type SessionState = {
	playerName: string
	playerId: string
	playerSecret: string
	playerDeck: PlayerDeckT
	connecting: boolean
	toast: ToastT
}

const defaultState: SessionState = {
	playerName: '',
	playerId: '',
	playerSecret: '',
	playerDeck: {name: 'Default', icon: 'any', cards: []},
	connecting: false,
	toast: {open: false, title: '', description: '', image: ''},
}

const loginReducer = (
	state = defaultState,
	action: AnyAction
): SessionState => {
	switch (action.type) {
		case 'LOGIN':
			return {...state, connecting: true}
		case 'DISCONNECT':
			return {...defaultState}
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
		case 'SET_TOAST':
			return {
				...state,
				toast: action.payload,
			}
		case 'CLOSE_TOAST':
			return {
				...state,
				toast: {
					...state.toast,
					open: false,
				},
			}
		default:
			return state
	}
}

export default loginReducer
