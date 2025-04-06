use tauri::Manager;

mod commands;
mod db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {

    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
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
        commands::analysis::add_analysis,
        commands::analysis::get_all_analyses,
        commands::analysis::get_analysis_by_id,
        commands::analysis::save_events_to_csv,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
