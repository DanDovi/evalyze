use tauri::Manager;

mod commands;
mod db;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_persisted_scope::init());

    let app = builder.setup(|app| {
        let handle = app.handle().clone();

        tauri::async_runtime::block_on(async move {
            let database = db::Database::new(&handle)
                .await
                .expect("failed to initialize database");

            app.manage(db::DatabaseState(database.pool));
        });

        Ok(())
    });

    app.invoke_handler(tauri::generate_handler![
        greet,
        commands::analysis::add_analysis,
        commands::analysis::get_all_analyses,
        commands::analysis::get_analysis_by_id
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
