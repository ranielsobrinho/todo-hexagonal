-- Database initialization script for todo-hexagonal

CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    done BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_todos_done ON todos(done);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE todos TO todo;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO todo;
