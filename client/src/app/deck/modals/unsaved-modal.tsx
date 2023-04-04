import * as AlertDialog from '@radix-ui/react-alert-dialog'
import css from '../../../components/alert-modal/alert-modal.module.scss'
import Button from 'components/button'

type Modal = {
	setOpen: boolean
	onClose: (isOpen: boolean) => void
	discard: () => void
}

const OverwriteModal = ({setOpen, onClose, discard}: Modal) => {
	return (
		<AlertDialog.Root open={setOpen} onOpenChange={(e) => onClose(e)}>
			<AlertDialog.Portal container={document.getElementById('modal')}>
				<AlertDialog.Overlay className={css.AlertDialogOverlay} />
				<AlertDialog.Content className={css.AlertDialogContent}>
					<AlertDialog.Title className={css.AlertDialogTitle}>
						Leave Editor?
						<AlertDialog.Cancel>
							<button className={css.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Cancel>
					</AlertDialog.Title>
					<AlertDialog.Description className={css.AlertDialogDescription}>
						{/* You have modified the {deck.name} deck but you haven't confirmed
						these changes. Do you want to discard these changes? */}
						Changes you have made will not be saved. Are you sure you want to
						leave?
					</AlertDialog.Description>
					<div className={css.buttonContainer}>
						<AlertDialog.Action asChild>
							<Button>Cancel</Button>
						</AlertDialog.Action>
						<AlertDialog.Action onClick={discard} asChild>
							<Button variant="error">Discard</Button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}

export default OverwriteModal
