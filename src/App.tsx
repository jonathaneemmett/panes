import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";

interface Worktree {
  path: string;
  branch: string;
}

function App() {
  const [repoPath, setRepoPath] = useState<string | null>(null);
  const [worktrees, setWorktrees] = useState<Worktree[]>([]);
  const [newBranch, setNewBranch] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function selectRepo() {
    const selected = await open({
      directory: true,
      title: "Select a Git Repository",
    });
    if (selected) {
      setRepoPath(selected as string);
    }
  }

  async function loadWorktrees() {
    if (!repoPath) return;
    try {
      const trees = await invoke<Worktree[]>("list_worktrees", { repoPath });
      setWorktrees(trees);
      setError(null);
    } catch (e) {
      setError(String(e));
    }
  }

  async function createWorktree() {
    if (!repoPath || !newBranch.trim()) return;
    try {
      await invoke("create_worktree", { repoPath, branchName: newBranch.trim() });
      setNewBranch("");
      setError(null);
      loadWorktrees();
    } catch (e) {
      setError(String(e));
    }
  }

  async function removeWorktree(worktreePath: string) {
    if (!repoPath) return;
    try {
      await invoke("remove_worktree", { repoPath, worktreePath });
      setError(null);
      loadWorktrees();
    } catch (e) {
      setError(String(e));
    }
  }

  useEffect(() => {
    if (repoPath) loadWorktrees();
  }, [repoPath]);

  if (!repoPath) {
    return (
      <main className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-2">Panes</h1>
        <p className="text-neutral-400 mb-6">Select a git repository to get started.</p>
        <button
          onClick={selectRepo}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
        >
          Open Repository
        </button>
      </main>
    );
  }

  return (
    <main className="p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Panes</h1>
          <p className="text-neutral-400 text-sm">{repoPath}</p>
        </div>
        <button
          onClick={selectRepo}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Change Repo
        </button>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newBranch}
          onChange={(e) => setNewBranch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createWorktree()}
          placeholder="Branch name..."
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={createWorktree}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          New Workspace
        </button>
      </div>

      <div className="space-y-2">
        {worktrees.map((wt) => (
          <div
            key={wt.path}
            className="flex items-center justify-between bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4"
          >
            <div>
              <p className="font-medium">{wt.branch}</p>
              <p className="text-neutral-400 text-sm">{wt.path}</p>
            </div>
            <button
              onClick={() => removeWorktree(wt.path)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        {worktrees.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-8">
            No workspaces yet. Create one above.
          </p>
        )}
      </div>
    </main>
  );
}

export default App;
