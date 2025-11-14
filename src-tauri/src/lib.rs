// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let main_window = app.get_webview_window("main").unwrap();

            // 延迟显示窗口，等待内容加载
            std::thread::spawn(move || {
                #[cfg(not(debug_assertions))]
                std::thread::sleep(std::time::Duration::from_millis(400));
                main_window.show().unwrap();
                main_window.set_focus().unwrap();

                // 在开发环境自动打开开发者工具
                #[cfg(debug_assertions)]
                main_window.open_devtools();
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
