-- MIGRATION SCRIPTS: Current Schema → New Flexible Schema
-- Execute in order, with rollback capability

-- ============================================================================
-- PHASE 1: ADD NEW TABLES AND COLUMNS
-- ============================================================================

-- 1. Add new columns to programs table
ALTER TABLE programs 
ADD COLUMN name VARCHAR(255),
ADD COLUMN session_duration DECIMAL(4,2) DEFAULT 1.5,
ADD COLUMN is_monthly BOOLEAN DEFAULT false,
ADD COLUMN venue_split_percent_new DECIMAL(5,2) DEFAULT 50.0;

-- 2. Create program templates table
CREATE TABLE program_templates (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_cuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    program_name VARCHAR(255) NOT NULL,
    session_duration DECIMAL(4,2) NOT NULL DEFAULT 1.5,
    is_monthly BOOLEAN NOT NULL DEFAULT false,
    venue_split_percent DECIMAL(5,2) NOT NULL DEFAULT 50.0,
    program_type_id VARCHAR(30),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (program_type_id) REFERENCES program_types(id)
);

-- 3. Create pricing templates table
CREATE TABLE pricing_templates (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_cuid(),
    template_id VARCHAR(30) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    "order" INTEGER DEFAULT 0,
    FOREIGN KEY (template_id) REFERENCES program_templates(id) ON DELETE CASCADE
);

-- 4. Create pricing options table
CREATE TABLE pricing_options (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_cuid(),
    program_id VARCHAR(30) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    "order" INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- 5. Create registration entries table
CREATE TABLE registration_entries (
    id VARCHAR(30) PRIMARY KEY DEFAULT gen_random_cuid(),
    registration_id VARCHAR(30) NOT NULL,
    pricing_option_id VARCHAR(30) NOT NULL,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE,
    FOREIGN KEY (pricing_option_id) REFERENCES pricing_options(id),
    UNIQUE(registration_id, pricing_option_id)
);

-- ============================================================================
-- PHASE 2: MIGRATE EXISTING DATA
-- ============================================================================

-- 1. Populate new program fields from program_types
UPDATE programs 
SET 
    name = pt.name,
    session_duration = pt.session_hours,
    is_monthly = pt.is_monthly,
    venue_split_percent_new = programs.venue_split_percent
FROM program_types pt 
WHERE programs.program_type_id = pt.id;

-- 2. Create default templates from existing program types
INSERT INTO program_templates (name, description, program_name, session_duration, is_monthly, venue_split_percent, program_type_id)
SELECT 
    pt.name || ' Template' as name,
    'Auto-generated template from existing program type' as description,
    pt.name as program_name,
    pt.session_hours as session_duration,
    pt.is_monthly,
    50.0 as venue_split_percent,
    pt.id as program_type_id
FROM program_types pt;

-- 3. Create pricing options from existing programs
-- For each program, create pricing options from fullPrice, halfPrice, subscriptionPrice
DO $$
DECLARE
    program_record RECORD;
    option_order INTEGER;
BEGIN
    FOR program_record IN SELECT * FROM programs LOOP
        option_order := 0;
        
        -- Create Full Price option (always exists)
        INSERT INTO pricing_options (program_id, name, price, "order")
        VALUES (program_record.id, 'Full Price', program_record.full_price, option_order);
        option_order := option_order + 1;
        
        -- Create Half Price option if it exists
        IF program_record.half_price IS NOT NULL THEN
            INSERT INTO pricing_options (program_id, name, price, "order")
            VALUES (program_record.id, 'Half Price', program_record.half_price, option_order);
            option_order := option_order + 1;
        END IF;
        
        -- Create Subscription Price option if it exists
        IF program_record.subscription_price IS NOT NULL THEN
            INSERT INTO pricing_options (program_id, name, price, "order")
            VALUES (program_record.id, 'Subscription', program_record.subscription_price, option_order);
        END IF;
    END LOOP;
END $$;

-- 4. Create registration entries from existing registrations
DO $$
DECLARE
    reg_record RECORD;
    full_option_id VARCHAR(30);
    half_option_id VARCHAR(30);
    sub_option_id VARCHAR(30);
BEGIN
    FOR reg_record IN SELECT * FROM registrations LOOP
        -- Find pricing option IDs for this registration's program
        SELECT id INTO full_option_id 
        FROM pricing_options 
        WHERE program_id = reg_record.program_id AND name = 'Full Price';
        
        SELECT id INTO half_option_id 
        FROM pricing_options 
        WHERE program_id = reg_record.program_id AND name = 'Half Price';
        
        SELECT id INTO sub_option_id 
        FROM pricing_options 
        WHERE program_id = reg_record.program_id AND name = 'Subscription';
        
        -- Create registration entries for non-zero quantities
        IF reg_record.full_registrations > 0 AND full_option_id IS NOT NULL THEN
            INSERT INTO registration_entries (registration_id, pricing_option_id, quantity)
            VALUES (reg_record.id, full_option_id, reg_record.full_registrations);
        END IF;
        
        IF reg_record.half_registrations > 0 AND half_option_id IS NOT NULL THEN
            INSERT INTO registration_entries (registration_id, pricing_option_id, quantity)
            VALUES (reg_record.id, half_option_id, reg_record.half_registrations);
        END IF;
        
        IF reg_record.subscription_registrations > 0 AND sub_option_id IS NOT NULL THEN
            INSERT INTO registration_entries (registration_id, pricing_option_id, quantity)
            VALUES (reg_record.id, sub_option_id, reg_record.subscription_registrations);
        END IF;
    END LOOP;
END $$;

-- 5. Add default pricing templates to templates (based on common patterns)
DO $$
DECLARE
    template_record RECORD;
BEGIN
    FOR template_record IN SELECT * FROM program_templates LOOP
        -- Add common pricing patterns
        INSERT INTO pricing_templates (template_id, name, price, "order") VALUES
        (template_record.id, 'Full Season', 50000, 0),
        (template_record.id, 'Half Season', 25000, 1);
        
        -- Add subscription option for monthly programs
        IF template_record.is_monthly THEN
            INSERT INTO pricing_templates (template_id, name, price, "order") VALUES
            (template_record.id, 'Monthly Pass', 61500, 2);
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- PHASE 3: VALIDATION QUERIES (Run these to verify migration)
-- ============================================================================

-- Check that all programs have names
SELECT COUNT(*) as programs_without_names FROM programs WHERE name IS NULL;

-- Check that all pricing options were created
SELECT 
    p.name as program_name,
    COUNT(po.id) as pricing_options_count
FROM programs p
LEFT JOIN pricing_options po ON p.id = po.program_id
GROUP BY p.id, p.name
ORDER BY pricing_options_count;

-- Check that all registration entries were created
SELECT 
    COUNT(r.id) as total_registrations,
    COUNT(re.id) as total_registration_entries
FROM registrations r
LEFT JOIN registration_entries re ON r.id = re.registration_id;

-- Verify financial calculations still match
SELECT 
    r.id,
    p.name as program_name,
    -- Old calculation
    (r.full_registrations * p.full_price + 
     COALESCE(r.half_registrations * p.half_price, 0) + 
     COALESCE(r.subscription_registrations * p.subscription_price, 0)) as old_revenue,
    -- New calculation
    SUM(re.quantity * po.price) as new_revenue
FROM registrations r
JOIN programs p ON r.program_id = p.id
LEFT JOIN registration_entries re ON r.id = re.registration_id
LEFT JOIN pricing_options po ON re.pricing_option_id = po.id
GROUP BY r.id, p.name, p.full_price, p.half_price, p.subscription_price, 
         r.full_registrations, r.half_registrations, r.subscription_registrations
HAVING 
    (r.full_registrations * p.full_price + 
     COALESCE(r.half_registrations * p.half_price, 0) + 
     COALESCE(r.subscription_registrations * p.subscription_price, 0)) != 
    COALESCE(SUM(re.quantity * po.price), 0);

-- ============================================================================
-- PHASE 4: CLEANUP (Only run after validation passes)
-- ============================================================================

-- Remove old columns (ONLY AFTER CONFIRMING MIGRATION SUCCESS)
-- ALTER TABLE programs DROP COLUMN full_price;
-- ALTER TABLE programs DROP COLUMN half_price;  
-- ALTER TABLE programs DROP COLUMN subscription_price;
-- ALTER TABLE programs DROP COLUMN venue_split_percent;
-- ALTER TABLE programs RENAME COLUMN venue_split_percent_new TO venue_split_percent;

-- ALTER TABLE registrations DROP COLUMN full_registrations;
-- ALTER TABLE registrations DROP COLUMN half_registrations;
-- ALTER TABLE registrations DROP COLUMN subscription_registrations;

-- Remove unused program_type fields
-- ALTER TABLE program_types DROP COLUMN is_monthly;
-- ALTER TABLE program_types DROP COLUMN session_hours;

-- ============================================================================
-- ROLLBACK SCRIPT (In case we need to revert)
-- ============================================================================

/*
-- ROLLBACK: Remove new tables and columns
DROP TABLE IF EXISTS registration_entries CASCADE;
DROP TABLE IF EXISTS pricing_options CASCADE;
DROP TABLE IF EXISTS pricing_templates CASCADE;
DROP TABLE IF EXISTS program_templates CASCADE;

ALTER TABLE programs DROP COLUMN IF EXISTS name;
ALTER TABLE programs DROP COLUMN IF EXISTS session_duration;
ALTER TABLE programs DROP COLUMN IF EXISTS is_monthly;
ALTER TABLE programs DROP COLUMN IF EXISTS venue_split_percent_new;

-- Restore original functionality
-- (Original data should still be intact in original columns)
*/