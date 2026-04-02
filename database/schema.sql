-- ============================================================
-- MEDICAL DIARY — DATABASE SCHEMA
-- ============================================================

-- USERS
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name   VARCHAR(255),
    date_of_birth DATE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- DIARY
-- ============================================================

-- Predefined symptom list (searchable)
CREATE TABLE symptoms (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) UNIQUE NOT NULL,  -- e.g. "Headache", "Fatigue"
    category VARCHAR(100)                  -- e.g. "Neurological", "General"
);

-- One diary entry per logging session
CREATE TABLE diary_entries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notes       TEXT,                      -- free text notes
    logged_at   TIMESTAMP DEFAULT NOW(),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Symptoms attached to a diary entry (many symptoms per entry)
CREATE TABLE diary_symptoms (
    id              SERIAL PRIMARY KEY,
    diary_entry_id  UUID NOT NULL REFERENCES diary_entries(id) ON DELETE CASCADE,
    symptom_id      INT REFERENCES symptoms(id),        -- NULL if custom
    custom_symptom  VARCHAR(255),                        -- free text if not in list
    severity        SMALLINT CHECK (severity BETWEEN 1 AND 10),
    CONSTRAINT symptom_or_custom CHECK (
        symptom_id IS NOT NULL OR custom_symptom IS NOT NULL
    )
);

-- ============================================================
-- MEDICAL RECORDS
-- ============================================================

CREATE TABLE medical_records (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,          -- e.g. "Annual Blood Test"
    record_type VARCHAR(100) NOT NULL,          -- "blood", "scan", "xray", "consultation", "other"
    visit_date  DATE NOT NULL,
    doctor_name VARCHAR(255),
    clinic_name VARCHAR(255),
    notes       TEXT,                           -- doctor recommendations, observations
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Files attached to a medical record (PDFs, images, etc.)
CREATE TABLE medical_files (
    id              SERIAL PRIMARY KEY,
    record_id       UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    file_name       VARCHAR(255) NOT NULL,
    file_url        TEXT NOT NULL,              -- storage path or cloud URL
    file_type       VARCHAR(50),               -- "pdf", "jpg", "png", etc.
    file_size_kb    INT,
    uploaded_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEARCH
-- ============================================================

CREATE TABLE search_history (
    id          SERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query       TEXT NOT NULL,
    searched_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_diary_entries_user    ON diary_entries(user_id);
CREATE INDEX idx_diary_entries_logged  ON diary_entries(logged_at);
CREATE INDEX idx_diary_symptoms_entry  ON diary_symptoms(diary_entry_id);
CREATE INDEX idx_medical_records_user  ON medical_records(user_id);
CREATE INDEX idx_medical_records_date  ON medical_records(visit_date);
CREATE INDEX idx_medical_records_type  ON medical_records(record_type);
CREATE INDEX idx_medical_files_record  ON medical_files(record_id);
CREATE INDEX idx_search_history_user   ON search_history(user_id);
