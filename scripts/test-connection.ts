
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkConnection() {
    console.log('Testing connection to:', supabaseUrl)

    // Try to select from gatherings table
    const { data, error } = await supabase.from('gatherings').select('*').limit(1)

    if (error) {
        console.error('Connection failed or table missing:', error.message)
        if (error.code === '42P01') { // undefined_table
            console.error('CRITICAL: The "gatherings" table does not exist. Please run the SQL script in Supabase Dashboard.')
        }
    } else {
        console.log('Success! Connected to "gatherings" table.')
        console.log('Data:', data)
    }
}

checkConnection()
