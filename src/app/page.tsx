'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

interface ProgressEventPayload {
	progress: number;
}

interface ProgressEventProps {
	payload: ProgressEventPayload;
}

export default function Page() {
	const [busy, setBusy] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const [timeLabel, setTimeLabel] = useState<string>('');

	useEffect(() => {
		const timeIntervalId = setInterval(() => {
			setTimeLabel(new Date().toLocaleTimeString());
		}, 1000);

		const unListen = listen('PROGRESS', (e: ProgressEventProps) => {
			setProgress(e.payload.progress);

			if (e.payload.progress === 100) {
				toast.success('Success');
			}
		});

		return () => {
			clearInterval(timeIntervalId);
			unListen.then(f => f());
		};
	}, []);

	return (
		<>
			<Toaster />
			<div className='w-full h-screen flex justify-center items-center flex-col space-y-2'>
				<div className='fixed top-2 left-2'>
					<span className='text-xs font-bold'>{timeLabel}</span>
				</div>
				<div className='w-[70%] flex items-center space-x-2'>
					<Progress value={progress} />
					{busy && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
					<span className='text-xs font-bold'>{progress}%</span>
				</div>

				<div className='flex space-x-2'>
					{!busy ? (
						<Button
							size={'sm'}
							variant={'default'}
							disabled={busy}
							onClick={() => {
								setBusy(true);
								setTimeout(async () => {
									const { appWindow } = await import('@tauri-apps/api/window');
									await invoke('progress_tracker', {
										window: appWindow
									});
									setBusy(false);
								}, 1000);
							}}
						>
							Start
						</Button>
					) : (
						<Button
							size={'sm'}
							variant={'destructive'}
							disabled={!busy}
							onClick={async () => {
								const { appWindow } = await import('@tauri-apps/api/window');
								await appWindow.emit('STOP');
								setProgress(0);
								setBusy(false);
							}}
						>
							Abort
						</Button>
					)}
				</div>
			</div>
		</>
	);
}
