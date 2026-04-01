use std::process::Command;
use serde::Serialize;

#[derive(Serialize)]
pub struct Worktree {
    pub path: String,
    pub branch: String,
}

#[tauri::command]
fn create_worktree(repo_path: &str, branch_name: &str) -> Result<Worktree, String> {
    let worktree_dir = format!(
        "{}/panes-workspaces/{}",
        dirs::home_dir().unwrap().to_string_lossy(),
        branch_name
    );

    let output = Command::new("git")
        .args(["worktree", "add", "-b", branch_name, &worktree_dir])
        .current_dir(repo_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(Worktree {
        path: worktree_dir,
        branch: branch_name.to_string(),
    })
}

#[tauri::command]
fn list_worktrees(repo_path: &str) -> Result<Vec<Worktree>, String> {
    let output = Command::new("git")
        .args(["worktree", "list", "--porcelain"])
        .current_dir(repo_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut worktrees: Vec<Worktree> = Vec::new();
    let mut current_path = String::new();

    for line in stdout.lines() {
        if let Some(path) = line.strip_prefix("worktree ") {
            current_path = path.to_string();
        } else if let Some(branch) = line.strip_prefix("branch refs/heads/") {
            worktrees.push(Worktree {
                path: current_path.clone(),
                branch: branch.to_string(),
            });
        }
    }

    Ok(worktrees)
}

#[tauri::command]
fn remove_worktree(repo_path: &str, worktree_path: &str) -> Result<(), String> {
    let output = Command::new("git")
        .args(["worktree", "remove", worktree_path, "--force"])
        .current_dir(repo_path)
        .output()
        .map_err(|e| format!("Failed to run git: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            create_worktree,
            list_worktrees,
            remove_worktree,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
