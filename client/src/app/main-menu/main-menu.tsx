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
import Button from 'components/button'

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
			<div className={css.menuBackground}>
				<div className={css.mainContainer}>
					{/* Button Container */}
					<TcgLogo />
					<div className={css.mainButtonContainer}>
						<Button
							variant="primary"
							className={css.MenuButton}
							onClick={handleRandomMatchmaking}
						>
							Public Game
						</Button>
						<div className={css.smallButtonContainer}>
							<Button
								variant="default"
								className={css.MenuButton}
								onClick={handleCreatePrivateGame}
							>
								Create Private Game
							</Button>
							<Button
								variant="default"
								className={css.MenuButton}
								onClick={handleJoinPrivateGame}
							>
								Join Private Game
							</Button>
						</div>
						<Button
							variant="secondary"
							className={classNames(css.MenuButton, 'stoneButton')}
							onClick={handleDeck}
						>
							Customize Deck
						</Button>
						<Button onClick={() => setSubsection('more')}>Settings</Button>
						<Button onClick={handleLogOut}>Log Out</Button>
						<div style={{display: 'flex', justifyContent: 'center'}}>
							<LinkContainer />
						</div>
						<Beef />
					</div>
				</div>
			</div>
		)
	}

	return content
}

export default MainMenu
