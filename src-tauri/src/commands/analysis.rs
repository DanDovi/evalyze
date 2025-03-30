use crate::db::DatabaseState;
use serde::{Deserialize, Serialize};
use sqlx::{Error as SqlxError, QueryBuilder, Sqlite};
use std::fs;
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use thiserror::Error;

#[tauri::command]
pub fn my_custom_command() {
    println!("I was invoked from JavaScript!");
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct AnalysisData {
    pub id: i64,
    pub name: String,
    pub path: String,
    pub duration: f64,
    pub created_at: String,
    pub updated_at: String,
    pub last_opened_at: String,
}

#[derive(Debug, sqlx::Type, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
#[sqlx(rename_all = "lowercase")]
pub enum EventCategory {
    Single,
    Range,
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow)]
pub struct AnalysisEventType {
    pub id: i64,
    pub analysis_id: i64,
    pub name: String,
    pub keyboard_key: String,
    pub category: EventCategory,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddAnalysisEventType {
    name: String,
    keyboard_key: String,
    category: EventCategory,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AddAnalysisParams {
    name: String,
    path: String,
    duration: f64,
    event_types: Vec<AddAnalysisEventType>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisWithEvents {
    analysis_data: AnalysisData,
    event_types: Vec<AnalysisEventType>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisEventSummary {
    event_type_id: i64,
    start_timestamp: f64,
    end_timestamp: Option<f64>,
}

// Use thiserror::Error to implement serializable errors
// that are returned by commands
#[derive(Debug, Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),

    #[error(transparent)]
    SerdeJson(#[from] serde_json::Error),

    // New variant for database errors
    #[error(transparent)]
    Database(#[from] SqlxError),

    // New variant for string-related errors
    #[error("String error: {0}")]
    StringError(String), // Include a String to represent the error message
}

// Errors must implement serde::Serialize to be used in Commands
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
pub async fn add_analysis(
    state: tauri::State<'_, DatabaseState>,
    params: AddAnalysisParams,
) -> Result<i64, Error> {
    let pool = &state.0;

    let mut tx = pool.begin().await.expect("Error starting transaction");

    let stmt = r#"
        INSERT INTO analyses (name, path, duration)
        VALUES (?, ?, ?)"#;

    let res = sqlx::query(stmt)
        .bind(params.name)
        .bind(params.path)
        .bind(params.duration)
        .execute(&mut *tx)
        .await;

    let res = match res {
        Ok(result) => result,
        Err(e) => {
            return Err(Error::Database(e));
        }
    };

    if res.rows_affected() != 1 {
        return Err(Error::StringError("Failed to insert analysis".to_string()));
    }

    let analysis_id = res.last_insert_rowid();

    if params.event_types.is_empty() {
        tx.commit().await.expect("Failed to commit transaction");
        return Ok(analysis_id);
    }

    let mut query_builder: QueryBuilder<Sqlite> = QueryBuilder::new(
        "INSERT INTO analysis_event_types (analysis_id, name, keyboard_key, category) ",
    );

    query_builder.push_values(params.event_types, |mut b, event_type| {
        b.push_bind(analysis_id)
            .push_bind(event_type.name)
            .push_bind(event_type.keyboard_key)
            .push_bind(event_type.category);
    });

    match query_builder.build().execute(&mut *tx).await {
        Ok(_) => {
            tx.commit().await.expect("Failed to commit transaction");
            Ok(analysis_id)
        }
        Err(e) => Err(Error::Database(e)),
    }
}

#[tauri::command]
pub async fn get_all_analyses(
    state: tauri::State<'_, DatabaseState>,
) -> Result<Vec<AnalysisData>, Error> {
    let stmt = r#"
        SELECT id, name, path, duration, created_at, updated_at, last_opened_at
        FROM analyses
    "#;

    let pool = &state.0;

    let query_result = sqlx::query_as::<_, AnalysisData>(stmt);

    let analyses = query_result.fetch_all(pool).await?;

    Ok(analyses)
}

#[tauri::command]
pub async fn get_analysis_by_id(
    state: tauri::State<'_, DatabaseState>,
    id: i64,
) -> Result<AnalysisWithEvents, Error> {
    let stmt = r#"
        SELECT id, name, path, duration, created_at, updated_at, last_opened_at
        FROM analyses
        WHERE id = ?
    "#;

    let pool = &state.0;

    let query_result = sqlx::query_as::<_, AnalysisData>(stmt).bind(id);

    let analysis = query_result.fetch_one(pool).await;

    let analysis = match analysis {
        Ok(analysis) => analysis,
        Err(e) => {
            return Err(Error::Database(e));
        }
    };

    let stmt = r#"
        SELECT id, analysis_id, name, keyboard_key, category
        FROM analysis_event_types
        WHERE analysis_id = ?
    "#;

    let query_result = sqlx::query_as::<_, AnalysisEventType>(stmt).bind(id);

    let event_types = query_result.fetch_all(pool).await;

    let event_types = match event_types {
        Ok(event_types) => event_types,
        Err(e) => {
            return Err(Error::Database(e));
        }
    };

    Ok(AnalysisWithEvents {
        analysis_data: analysis,
        event_types,
    })
}

#[tauri::command]
pub async fn save_events_to_csv(
    app_handle: AppHandle,
    state: tauri::State<'_, DatabaseState>,
    analysis_id: i64,
    events: Vec<AnalysisEventSummary>,
) -> Result<(), Error> {
    let pool = &state.0;

    let stmt = r#"
        SELECT id, analysis_id, name, keyboard_key, category
        FROM analysis_event_types
        WHERE analysis_id = ?
    "#;

    let query_result = sqlx::query_as::<_, AnalysisEventType>(stmt).bind(analysis_id);
    let event_types = query_result.fetch_all(pool).await?;

    if event_types.is_empty() {
        return Err(Error::StringError(
            "No event types found for the given analysis ID".to_string(),
        ));
    }

    // Select where to save the file
    let file_path = app_handle
        .dialog()
        .file()
        .add_filter("CSV", &["csv"])
        .blocking_save_file();

    if file_path.is_none() {
        return Err(Error::StringError("File path not selected".to_string()));
    }

    let file_path = file_path.expect("File path not selected");

    let name_map: std::collections::HashMap<i64, String> = event_types
        .iter()
        .map(|event_type| (event_type.id, event_type.name.clone()))
        .collect();

    let mut wtr = csv::Writer::from_writer(vec![]);
    wtr.write_record(&["Event Type", "Start Time", "End Time"])
        .or_else(|_| Err(Error::StringError("Failed to write header".to_string())))?;

    // Write the records
    for event in events {
        let event_type_name = name_map.get(&event.event_type_id).ok_or(Error::StringError("Event type not found".to_string()))?;

        wtr.serialize((
            event_type_name,
            event.start_timestamp,
            match event.end_timestamp {
                Some(end_time) => end_time.to_string(),
                None => "".to_string(),
            }
        ))
        .or_else(|_| Err(Error::StringError("Failed to serialize event".to_string())))?;
    }

    // Flush the writer
    wtr.flush()?;

    let csv_data = wtr
        .into_inner()
        .or_else(|_| Err(Error::StringError("Failed to get CSV data".to_string())))?;

    // Get the CSV data as a string
    let csv_data = String::from_utf8(csv_data).expect("Failed to convert CSV data to string");

    fs::write(file_path.to_string(), csv_data)?;

    Ok(())
}
