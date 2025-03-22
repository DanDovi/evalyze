CREATE TABLE analyses
(
    id       INTEGER PRIMARY KEY,
    name     TEXT NOT NULL,
    path     TEXT NOT NULL,
    duration float,
    created_at     TEXT DEFAULT (datetime('now')),
    updated_at     TEXT DEFAULT (datetime('now')),
    last_opened_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE analysis_event_types
(
    id           INTEGER PRIMARY KEY,
    analysis_id     INTEGER NOT NULL,
    name         TEXT    NOT NULL,
    keyboard_key TEXT    NOT NULL,
    category TEXT CHECK(category IN ('single', 'range')),
    FOREIGN KEY (analysis_id) REFERENCES analyses (id)
);

CREATE TABLE analysis_events
(
    id                  INTEGER PRIMARY KEY,
    analysis_event_type_id INTEGER,
    start_timestamp     INTEGER,
    end_timestamp       INTEGER,
    FOREIGN KEY (analysis_event_type_id) REFERENCES analysis_event_types (id)
);