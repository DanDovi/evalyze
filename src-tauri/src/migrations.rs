use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: r#"
            CREATE TABLE videos (id INTEGER PRIMARY KEY, name TEXT NOT NULL, path TEXT NOT NULL, duration INTEGER);
            CREATE TABLE video_event_types (id INTEGER PRIMARY KEY, video_id INTEGER NOT NULL, name TEXT NOT NULL, keyboard_key TEXT NOT NULL type TEXT CHECK(category IN ('single', 'range')), FOREIGN KEY(video_id) REFERENCES videos(id));
            CREATE TABLE video_events (id INTEGER PRIMARY KEY, video_event_type_id INTEGER, start_timestamp INTEGER, end_timestamp INTEGER, FOREIGN KEY(video_event_type_id) REFERENCES video_event_types(id));
            "#,
        kind: MigrationKind::Up,
    }]
}
