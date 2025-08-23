-- MIGRATION STEP 1: Add new tables and columns (safe - no data changes)
-- This step only adds new structures, existing data remains untouched

BEGIN;

-- Add new columns to programs table (with defaults to not break existing data)
ALTER TABLE programs 
ADD COLUMN name VARCHAR(255),
ADD COLUMN session_duration DECIMAL(4,2) DEFAULT 1.5,
ADD COLUMN is_monthly BOOLEAN DEFAULT false,
ADD COLUMN venue_split_percent_new DECIMAL(5,2) DEFAULT 50.0;

-- Create program templates table
CREATE TABLE program_templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    program_name VARCHAR(255) NOT NULL,
    session_duration DECIMAL(4,2) NOT NULL DEFAULT 1.5,
    is_monthly BOOLEAN NOT NULL DEFAULT false,
    venue_split_percent DECIMAL(5,2) NOT NULL DEFAULT 50.0,
    program_type_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create pricing templates table
CREATE TABLE pricing_templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    template_id TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_pricing_template_template FOREIGN KEY (template_id) REFERENCES program_templates(id) ON DELETE CASCADE
);

-- Create pricing options table
CREATE TABLE pricing_options (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    program_id TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_pricing_option_program FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- Create registration entries table
CREATE TABLE registration_entries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    registration_id TEXT NOT NULL,
    pricing_option_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_registration_entry_registration FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    CONSTRAINT fk_registration_entry_pricing_option FOREIGN KEY (pricing_option_id) REFERENCES pricing_options(id),
    UNIQUE(registration_id, pricing_option_id)
);

-- Add indexes for performance
CREATE INDEX idx_pricing_options_program_id ON pricing_options(program_id);
CREATE INDEX idx_registration_entries_registration_id ON registration_entries(registration_id);
CREATE INDEX idx_program_templates_program_type_id ON program_templates(program_type_id);

COMMIT;

-- Verify new tables were created
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('program_templates', 'pricing_templates', 'pricing_options', 'registration_entries')
ORDER BY table_name, ordinal_position;