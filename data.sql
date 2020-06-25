
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS jobs;

CREATE TABLE companies
(
  handle TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  num_employees INTEGER,
  description TEXT,
  logo_url TEXT
);

CREATE TABLE jobs
(
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT CHECK (equity <= 1) NOT NULL,
  company_handle TEXT REFERENCES companies(handle) ON DELETE CASCADE,
  date_posted TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
