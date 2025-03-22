use std::error::Error;
use std::fs;
use sqlx::{sqlite, Pool, Sqlite, SqlitePool};
use tauri::{AppHandle, Manager};

pub struct Database {
    pub pool: Pool<Sqlite>,
}

impl Database {
    pub async fn new(app_handle: &AppHandle) -> Result<Self, Box<dyn Error>> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .expect("Failed to get app dir");

        // Create the directory if it doesn't exist
        fs::create_dir_all(&app_dir)?;

        let db_path = app_dir.join("app_data.sqlite");

        // Set the DATABASE_URL environment variable
        std::env::set_var("DATABASE_URL", format!("sqlite://{}", db_path.to_string_lossy()));

        println!("Initializing database at {:?}", db_path);

        let connection_options = sqlx::sqlite::SqliteConnectOptions::new()
            .filename(&db_path)
            .create_if_missing(true)
            .journal_mode(sqlite::SqliteJournalMode::Wal);

        let pool = SqlitePool::connect_with(connection_options).await?;

        sqlx::migrate!().run(&pool).await?;

        Ok(Self { pool })
    }
}

#[allow(dead_code)]
pub struct DatabaseState(pub Pool<Sqlite>);
