import {useDispatch} from 'react-redux'
import {useState} from 'react'
import {
	randomMatchmaking,
	createPrivateGame,
	joinPrivateGame,
} from 'logic/matchmaking/matchmaking-actions'
import css from './main-menu.module.css'
import {logout} from 'logic/session/session-actions'
import TcgLogo from 'components/tcg-logo'
import LinkContainer from 'components/link-container'
import More from './main-menu-more'
import Beef from 'components/beef'
import classNames from 'classnames'

type Props = {
	setMenuSection: (section: string) => void
}
function MainMenu({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const [subsection, setSubsection] = useState<string | null>(null)

	const handleRandomMatchmaking = () => dispatch(randomMatchmaking())
	const handleCreatePrivateGame = () => dispatch(createPrivateGame())
	const handleJoinPrivateGame = () => dispatch(joinPrivateGame())
	const handleLogOut = () => dispatch(logout())
	const handleDeck = () => setMenuSection('deck')

	let content = null

	if (subsection === 'more') {
		content = <More setMenuSection={() => setSubsection(null)} />
	} else {
		content = (
			<div className={`${css.menuBackground} temp`}>
				<div className={css.mainContainer}>
					{/* Button Container */}
					<TcgLogo />
					<div className={css.mainButtonContainer}>
						<button
							className={classNames(css.menuButton, 'stoneButton')}
							onClick={handleRandomMatchmaking}
						>
							Public Game
						</button>
						<button
							className={classNames(css.menuButton, 'stoneButton')}
							onClick={handleCreatePrivateGame}
						>
							Create Private Game
						</button>
						<button
							className={classNames(css.menuButton, 'stoneButton')}
							onClick={handleJoinPrivateGame}
						>
							Join Private Game
						</button>
						<button
							className={classNames(css.menuButton, 'stoneButton')}
							onClick={handleDeck}
						>
							Customize Deck
						</button>
						<button
							className={classNames(css.menuButton, 'stoneButton')}
							onClick={handleDeck}
						>
							Deck Selection
						</button>

						{/* Smaller Button Container */}
						<div className={css.smallButtonContainer}>
							<button
								className={classNames(css.menuButton, 'stoneButton')}
								onClick={handleLogOut}
							>
								Log Out
							</button>
							<button
								className={classNames(css.menuButton, 'stoneButton')}
								onClick={() => setSubsection('more')}
							>
								More
							</button>
						</div>
					</div>
					<LinkContainer />
					<Beef />
				</div>
			</div>
		)
	}

	return content
}

export default MainMenu
