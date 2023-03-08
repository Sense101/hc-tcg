import {useState} from 'react'
import {useSelector} from 'react-redux'
import {getPlayerName} from 'logic/session/session-selectors'
import {getGameState} from 'logic/game/game-selectors'
import {getStatus} from 'logic/matchmaking/matchmaking-selectors'
import LostConnection from 'components/lost-connection'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import Login from './login'
import Game from './game'
import MainMenu from './main-menu'
import Deck from './deck'
import CreateDeck from './create-deck'
import MatchMaking from './match-making'
import css from './app.module.css'

function App() {
	const playerName = useSelector(getPlayerName)
	const matchmakingStatus = useSelector(getStatus)
	const gameState = useSelector(getGameState)
	const socketStatus = useSelector(getSocketStatus)
	const [menuSection, setMenuSection] = useState<string>('mainmenu')

	const router = () => {
		if (gameState) {
			return <Game />
		} else if (matchmakingStatus) {
			return <MatchMaking />
		} else if (playerName) {
			switch (menuSection) {
				case 'deck':
					return <Deck setMenuSection={setMenuSection} />
					break
				case 'create-deck':
					return <CreateDeck setMenuSection={setMenuSection} />
					break
				default:
					return <MainMenu setMenuSection={setMenuSection} />
			}
		}
		return <Login />
	}

	return (
		<main>
			<div className={css.form}>{router()}</div>
			{playerName && !socketStatus ? <LostConnection /> : null}
		</main>
	)
}

export default App
