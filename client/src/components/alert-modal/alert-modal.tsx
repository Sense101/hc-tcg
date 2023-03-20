import {ReactNode} from 'react'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import css from './alert-modal.module.scss'
import Button from 'components/button'

type AlertModal = {
	button: ReactNode
	title: ReactNode
	description: ReactNode
	actionText: string
	action: () => void
}

const AlertModal = ({
	button,
	title,
	description,
	actionText,
	action,
}: AlertModal) => (
	<AlertDialog.Root>
		<AlertDialog.Trigger asChild>
			<Button variant="stone">{button}</Button>
		</AlertDialog.Trigger>
		<AlertDialog.Portal container={document.getElementById('modal')}>
			<AlertDialog.Overlay className={css.AlertDialogOverlay} />
			<AlertDialog.Content className={css.AlertDialogContent}>
				<AlertDialog.Title className={css.AlertDialogTitle}>
					{title}
					<AlertDialog.Cancel>
						<button className={css.xClose}>
							<img src="/images/CloseX.svg" alt="close" />
						</button>
					</AlertDialog.Cancel>
				</AlertDialog.Title>
				<AlertDialog.Description className={css.AlertDialogDescription}>
					{description}
				</AlertDialog.Description>
				<div className={css.buttonContainer}>
					<AlertDialog.Cancel asChild>
						<Button>Cancel</Button>
					</AlertDialog.Cancel>
					<AlertDialog.Action asChild>
						<Button variant="error" onClick={action}>
							{actionText}
						</Button>
					</AlertDialog.Action>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>
)

export default AlertModal
