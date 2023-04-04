import * as AlertDialog from '@radix-ui/react-alert-dialog'
import css from '../../../components/alert-modal/alert-modal.module.scss'
import Button from 'components/button'
import {PlayerDeckT} from 'types/deck'

type Modal = {
	setOpen: boolean
	onClose: (isOpen: boolean) => void
	overwrite: () => void
	deck: PlayerDeckT
}

const OverwriteModal = ({setOpen, onClose, overwrite, deck}: Modal) => {
	return (
		<AlertDialog.Root open={setOpen} onOpenChange={(e) => onClose(e)}>
			<AlertDialog.Portal container={document.getElementById('modal')}>
				<AlertDialog.Overlay className={css.AlertDialogOverlay} />
				<AlertDialog.Content className={css.AlertDialogContent}>
					<AlertDialog.Title className={css.AlertDialogTitle}>
						Overwrite Deck
						<AlertDialog.Cancel>
							<button className={css.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Cancel>
					</AlertDialog.Title>
					<AlertDialog.Description className={css.AlertDialogDescription}>
						The {<span style={{fontWeight: 'bold'}}>{deck.name}</span>} deck
						already exists! Would you like to overwrite it?
					</AlertDialog.Description>
					<div className={css.buttonContainer}>
						<AlertDialog.Action asChild>
							<Button>Cancel</Button>
						</AlertDialog.Action>
						<AlertDialog.Action onClick={overwrite} asChild>
							<Button variant="error">Overwrite</Button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}

export default OverwriteModal
