import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugSignup() {
    console.log('Attempting debug signup...')
    const email = `debug_nan_test_${Date.now()}@test.com`
    const password = 'password123'

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: 'Debug NaN User',
                avatar_url: 'https://placehold.co/100'
            }
        }
    })

    if (error) {
        console.error('Signup Failed!')
        console.error('Error Name:', error.name)
        console.error('Error Message:', error.message)
        console.error('Error Status:', error.status)
        console.error('Full Error:', JSON.stringify(error, null, 2))
    } else {
        console.log('Signup Successful!')
        console.log('User ID:', data.user?.id)
    }
}

debugSignup()

async function debugLogin() {
    console.log('Attempting debug login...')
    const email = 'realtime_retry@test.com'
    const password = 'password123'

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        console.error('Login Failed!')
        console.error('Error Name:', error.name)
        console.error('Error Message:', error.message)
        console.error('Error Status:', error.status)
    } else {
        console.log('Login Successful!')
        console.log('User ID:', data.user?.id)
    }
}

debugLogin()
