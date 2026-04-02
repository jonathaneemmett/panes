import { Group, Panel, Separator } from 'react-resizable-panels';

function App() {
	return (
		<div className='h-screen'>
			<Group orientation='horizontal' className='flex-1 h-full'>
				<Panel defaultSize={20} minSize={15}>
					<div className='h-full bg-neutral-900 p-2 text-white'>
						File Tree
					</div>
				</Panel>
				<Separator className='w-1 bg-neutral-700 hover:bg-blue-500 transition-colors' />
				<Panel defaultSize={50} minSize={30}>
					<div className='h-full bg-neutral-900 p-2 text-white'>
						Editor
					</div>
				</Panel>
				<Separator className='w-1 bg-neutral-700 hover:bg-blue-500 transition-colors' />
				<Panel defaultSize={30} minSize={20}>
					<div className='h-full bg-neutral-900 p-2 text-white'>
						Agent
					</div>
				</Panel>
			</Group>
		</div>
	);
}

export default App;
