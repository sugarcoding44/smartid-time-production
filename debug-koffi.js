/**
 * Debug script to test Koffi loading
 */

console.log('Testing Koffi loading...')
console.log('Node.js version:', process.version)
console.log('Platform:', process.platform)
console.log('Architecture:', process.arch)

try {
  console.log('Attempting to load Koffi...')
  const koffi = require('koffi')
  console.log('✅ Koffi loaded successfully!')
  console.log('Koffi version:', koffi.version)
  
  console.log('Attempting to load RFID DLL...')
  const path = require('path')
  const dllPath = path.join(
    'C:', 'Users', 'user', 'Downloads', 'NTAG424_SDK',
    'NTAG424  Tag SDK and demo',
    'COMM-demo software 250116', 
    'COMM-demo software 250116',
    'RFID1356.dll'
  )
  
  console.log('DLL path:', dllPath)
  
  const rfidLib = koffi.load(dllPath)
  console.log('✅ RFID DLL loaded successfully!')
  
  // Test function binding
  const openhid = rfidLib.func('openhid', 'int', ['uint16', 'uint16', 'uint8'])
  console.log('✅ Function binding successful!')
  
} catch (error) {
  console.error('❌ Error:', error.message)
  console.error('Stack:', error.stack)
}