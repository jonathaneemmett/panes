import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";

function App() {
  const [repoPath, setRepoPath] = useState<string | null>(null);

  async function selectRepo() {
    const selected = await open({
      directory: true,
      title: "Select a Git Repository",
    });
    if (selected) {
      setRepoPath(selected as string);
    }
  }

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
    <main className="p-4 min-h-screen">
      <h1 className="text-2xl font-bold">Panes</h1>
      <p className="text-neutral-400 mt-2">Repo: {repoPath}</p>
    </main>
  );
}

export default App;
