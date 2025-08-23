async function debugAPI() {
  try {
    const response = await fetch('http://localhost:3002/api/programs/flexible')
    const text = await response.text()
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    console.log('Response text:', text)
    
    if (response.ok) {
      const data = JSON.parse(text)
      console.log('Parsed data type:', typeof data)
      console.log('Is array:', Array.isArray(data))
      console.log('Data:', data)
    }
  } catch (error) {
    console.error('Debug error:', error)
  }
}

debugAPI().catch(console.error)