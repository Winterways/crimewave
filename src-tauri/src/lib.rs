// The whole game lives in ../../dist/index.html (built by build.sh); the shell
// only opens a window on it and lets outbound links use the system browser.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running Koprulu Idle");
}
