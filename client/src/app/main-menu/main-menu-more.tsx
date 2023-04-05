import css from './main-menu.module.css'
import {useSelector, useDispatch} from 'react-redux'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getStats} from 'logic/fbdb/fbdb-selectors'
import {resetStats} from 'logic/fbdb/fbdb-actions'
import Button from 'components/button'

type Props = {
	setMenuSection: (section: string) => void
}
function More({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const stats = useSelector(getStats)
	const settings = useSelector(getSettings)

	const handleSoundChange = () => {
		dispatch(setSetting('soundOn', settings.soundOn !== 'off' ? 'off' : 'on'))
	}
	const handleProfanityChange = () => {
		dispatch(
			setSetting(
				'profanityFilter',
				settings.profanityFilter !== 'off' ? 'off' : 'on'
			)
		)
	}
	const handleResetStats = () => {
		dispatch(resetStats())
	}
	const getDescriptor = (value?: string) => {
		if (value !== 'off') return 'Enabled'
		return 'Disabled'
	}
	const convertLegacyDecks = () => {
		let conversionCount = 0
		for (let i = 0; i < localStorage.length; i++) {
			const lsKey = localStorage.key(i)

			if (lsKey?.includes('Loadout_')) {
				conversionCount = conversionCount + 1
				const legacyName = lsKey.replace('Loadout_', '[Legacy] ')
				const legacyDeck = localStorage.getItem(lsKey)

				const convertedDeck = {
					name: legacyName,
					icon: 'any',
					cards: JSON.parse(legacyDeck || ''),
				}

				localStorage.setItem(
					`Deck_${legacyName}`,
					JSON.stringify(convertedDeck)
				)

				localStorage.removeItem(lsKey)
				console.log(`Converted deck!:`, lsKey, legacyName)
			}
		}

		dispatch({
			type: 'SET_TOAST',
			payload: {
				show: true,
				title: 'Convert Legacy Decks',
				description: conversionCount
					? `Converted ${conversionCount} decks!`
					: `No decks to convert!`,
				image: `/images/card-icon.png`,
			},
		})
	}
	return (
		<div className={`${css.menuBackground} ${css.moreBackground} temp`}>
			<div className={css.moreContainer}>
				<div className={css.moreButtonContainer}>
					<Button
						variant="stone"
						className={css.menuButton}
						onClick={handleSoundChange}
					>
						Sounds: {getDescriptor(settings.soundOn)}
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						onClick={handleProfanityChange}
					>
						Profanity filter: {getDescriptor(settings.profanityFilter)}
					</Button>
					<Button
						variant="stone"
						className={css.menuButton}
						onClick={convertLegacyDecks}
					>
						Convert Legacy Decks
					</Button>
					<div className={css.smallButtonContainer} style={{marginTop: '1rem'}}>
						<Button
							variant="stone"
							className={css.menuButton}
							onClick={() => setMenuSection('mainmenu')}
						>
							Back to menu
						</Button>
						<Button variant="stone" onClick={handleResetStats}>
							Reset Stats
						</Button>
					</div>
				</div>
				{/* stats */}
				<div className={css.stats}>
					<div className={css.stat}>
						<div className={css.statName}>Wins</div>
						<div className={css.statValue}>{stats.w}</div>
					</div>
					<div className={css.stat}>
						<div className={css.statName}>Losses</div>
						<div className={css.statValue}>{stats.l}</div>
					</div>
					<div className={css.stat}>
						<div className={css.statName}>Ties</div>
						<div className={css.statValue}>{stats.t}</div>
					</div>
					<div className={css.stat}>
						<div className={css.statName}>Forfeit Wins</div>
						<div className={css.statValue}>{stats.fw}</div>
					</div>
					<div className={css.stat}>
						<div className={css.statName}>Forfeit Losses</div>
						<div className={css.statValue}>{stats.fl}</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default More
