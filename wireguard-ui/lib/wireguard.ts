import fs from 'fs';
import path from 'path';

/**
 * Creates a file in the /etc/wireguard/ directory.
 *
 * @param filename - The name of the file to create.
 * @param content - The content to write to the file.
 * @throws Error if file creation fails or the filename is invalid.
 */
export async function createWireguardFile(filename: string, content: string): Promise<void> {
  // Security check to prevent directory traversal attacks
  if (!filename || filename.includes('/') || filename.includes('..')) {
    throw new Error('Invalid filename');
  }

  // Define the path to the WireGuard directory
  const filePath = path.join('/etc/wireguard', filename);

  try {
    // Write content to the file with secure permissions
    fs.writeFileSync(filePath, content, { mode: 0o600 }); // Mode 600 for security
  } catch (error) {
    console.error('Error writing file:', error);
    throw new Error('File creation failed');
  }
}
