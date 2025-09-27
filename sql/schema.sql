-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leave_types table
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_days INTEGER NOT NULL,
  advance_days_required INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(20) NOT NULL DEFAULT 'blue',
  icon VARCHAR(10) NOT NULL DEFAULT '🏖️',
  is_active BOOLEAN NOT NULL DEFAULT true,
  carry_forward BOOLEAN NOT NULL DEFAULT false,
  carry_forward_limit INTEGER,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  ic_number VARCHAR(20) UNIQUE NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leave_balances table
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  allocated_days INTEGER NOT NULL,
  used_days INTEGER NOT NULL DEFAULT 0,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, leave_type_id, year)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_leave_types_updated_at BEFORE UPDATE ON leave_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leave_balances_updated_at BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_leave_types_is_active ON leave_types(is_active);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_leave_balances_user_year ON leave_balances(user_id, year);
CREATE INDEX idx_leave_balances_type_year ON leave_balances(leave_type_id, year);

-- Insert sample leave types
INSERT INTO leave_types (name, description, max_days, advance_days_required, color, icon, carry_forward, carry_forward_limit, requires_approval) VALUES
('Annual Leave', 'Yearly vacation entitlement for rest and recreation', 21, 7, 'blue', '🏖️', true, 7, true),
('Sick Leave', 'Medical leave for illness or medical appointments', 14, 0, 'red', '🏥', false, null, false),
('Emergency Leave', 'Urgent personal or family emergency situations', 5, 0, 'orange', '🚨', false, null, true),
('Maternity Leave', 'Leave for new mothers before and after childbirth', 90, 30, 'purple', '👶', false, null, true),
('Study Leave', 'Educational leave for training or professional development', 10, 14, 'green', '📚', true, 5, true);

-- Insert sample users
INSERT INTO users (name, email, employee_id, ic_number, position, department) VALUES
('John Doe', 'john.doe@company.com', 'TC001', '880515-14-5678', 'Teacher', 'Mathematics'),
('Jane Smith', 'jane.smith@company.com', 'ST001', '901203-08-7890', 'Teacher', 'Science'),
('Bob Johnson', 'bob.johnson@company.com', 'SD001', '851022-11-2345', 'Teacher', 'History'),
('Alice Brown', 'alice.brown@company.com', 'TC002', '920807-05-6789', 'Teacher', 'English'),
('Mary Wilson', 'mary.wilson@company.com', 'TC003', '750615-03-4567', 'Teacher', 'Art'),
('David Lee', 'david.lee@company.com', 'ST002', '881109-12-8901', 'Teacher', 'Physical Education');

-- Set up Row Level Security (RLS)
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now, customize based on your needs)
CREATE POLICY "Allow all operations on leave_types" ON leave_types FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on leave_balances" ON leave_balances FOR ALL USING (true);
