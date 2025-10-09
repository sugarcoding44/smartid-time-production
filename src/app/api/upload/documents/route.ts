import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const documentType = formData.get('documentType') as string || 'leave_support'

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400, headers: corsHeaders })
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400, headers: corsHeaders })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File size exceeds 10MB limit'
      }, { status: 400, headers: corsHeaders })
    }

    // Log file details for debugging
    console.log('📤 Upload Details:');
    console.log('  File name:', file.name);
    console.log('  File size:', file.size);
    console.log('  File type:', file.type);
    console.log('  User ID:', userId);
    
    // Validate file type (common document and image formats)
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/octet-stream' // Allow generic binary files (browser fallback)
    ]
    
    // Also check file extension as fallback
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt']
    
    const isValidType = allowedTypes.includes(file.type)
    const isValidExtension = allowedExtensions.includes(fileExtension || '')

    if (!isValidType && !isValidExtension) {
      console.log('❌ File type validation failed:');
      console.log('  MIME type:', file.type);
      console.log('  Extension:', fileExtension);
      console.log('  Allowed MIME types:', allowedTypes);
      console.log('  Allowed extensions:', allowedExtensions);
      
      return NextResponse.json({
        success: false,
        error: 'Invalid file type. Allowed: JPG, JPEG, PNG, GIF, WEBP, PDF, DOC, DOCX, TXT'
      }, { status: 400, headers: corsHeaders })
    }
    
    console.log('✅ File type validation passed');
    console.log('  Valid MIME type:', isValidType);
    console.log('  Valid extension:', isValidExtension);

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${userId}/${documentType}_${timestamp}.${fileExtension}`

    // Determine correct content type based on file extension if MIME type is generic
    let contentType = file.type
    if (file.type === 'application/octet-stream' || !file.type) {
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'txt': 'text/plain'
      }
      contentType = mimeTypes[fileExtension || ''] || 'application/octet-stream'
    }
    
    console.log('📤 Content type detection:');
    console.log('  Original MIME:', file.type);
    console.log('  File extension:', fileExtension);
    console.log('  Final content type:', contentType);

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, uint8Array, {
        contentType: contentType,
        upsert: true
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to upload file to storage'
      }, { status: 500, headers: corsHeaders })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path)

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        filePath: data.path,
        fileUrl: urlData.publicUrl,
        fileSize: file.size,
        fileType: file.type
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Error in document upload API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500, headers: corsHeaders })
  }
}