-- Migration: Add assigned_to column to todos table
-- Run this once on your PostgreSQL database (local and production)

ALTER TABLE todos ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100);
