import {useState} from 'react'
import {useSelector} from 'react-redux'
import {getPlayerName, getToast} from 'logic/session/session-selectors'
import {getGameState} from 'logic/game/game-selectors'
import {getStatus} from 'logic/matchmaking/matchmaking-selectors'
import LostConnection from 'components/lost-connection'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import Login from './login'
import Game from './game'
import MainMenu from './main-menu'
import Deck from './deck'
import MatchMaking from './match-making'
import Toast from 'components/toast'

function App() {
	const playerName = useSelector(getPlayerName)
	const matchmakingStatus = useSelector(getStatus)
	const gameState = useSelector(getGameState)
	const socketStatus = useSelector(getSocketStatus)
	const toastMessage = useSelector(getToast)
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
				default:
					return <MainMenu setMenuSection={setMenuSection} />
			}
		}
		return <Login />
	}

	return (
		<main>
			{router()}
			{playerName && !socketStatus ? <LostConnection /> : null}
			<Toast
				title={toastMessage.title}
				description={toastMessage.description}
				image={toastMessage.image}
				setOpen={toastMessage.open}
			/>
		</main>
	)
}

export default App
