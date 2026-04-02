import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface FileEntry {
	name: string;
	path: string;
	is_dir: boolean;
}

interface FileTreeProps {
	repoPath: string;
	onFileSelect: (path: string) => void;
}

function TreeNode({
	entry,
	depth,
	onFileSelect,
}: {
	entry: FileEntry;
	depth: number;
	onFileSelect: (path: string) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const [children, setChildren] = useState<FileEntry[] | null>(null);

	async function toggle() {
		if (!entry.is_dir) {
			onFileSelect(entry.path);
			return;
		}
		if (!expanded) {
			const entries: FileEntry[] = await invoke('read_directory', {
				path: entry.path,
			});
			setChildren(entries);
		}
		setExpanded(!expanded);
	}
	return (
		<div>
			<div
				onClick={toggle}
				className='flex items-center py-0.5 px-2 hover:bg-neutral-700/50
  cursor-pointer text-sm'
				style={{ paddingLeft: `${depth * 16 + 8}px` }}>
				<span className='w-4 text-neutral-500 text-xs'>
					{entry.is_dir ? (expanded ? '▼' : '▶') : ''}
				</span>
				<span
					className={
						entry.is_dir ? 'font-medium' : 'text-neutral-300'
					}>
					{entry.name}
				</span>
			</div>
			{expanded &&
				children.map((child) => (
					<TreeNode
						key={child.path}
						entry={child}
						depth={depth + 1}
						onFileSelect={onFileSelect}
					/>
				))}
		</div>
	);
}

export default function FileTree({ repoPath, onFileSelect }: FileTreeProps) {
	const [entries, setEntries] = useState<FileEntry[]>([]);

	useEffect(() => {
		invoke<FileEntry[]>('read_directory', { path: repoPath }).then(
			setEntries,
		);
	}, [repoPath]);

	return (
		<div className='h-full overflow-y-auto py-1'>
			{entries.map((entry) => (
				<TreeNode
					key={entry.path}
					entry={entry}
					depth={0}
					onFileSelect={onFileSelect}
				/>
			))}
		</div>
	);
}
