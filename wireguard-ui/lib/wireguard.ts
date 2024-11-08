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
    throw new Error('File creation failed');
  }
}

/**
 * Removes a file in the /etc/wireguard/ directory.
 *
 * @param filename - The name of the file to remove.
 * @throws Error if file removal fails or the filename is invalid.
 */
export async function removeWireguardFile(filename: string): Promise<void> {
  // Security check to prevent directory traversal attacks
  if (!filename || filename.includes('/') || filename.includes('..')) {
    throw new Error('Invalid filename');
  }

  // Define the path to the WireGuard directory
  const filePath = path.join('/etc/wireguard', filename);

  try {
    // Check if the file exists before attempting to remove it
    if (!fs.existsSync(filePath)) {
      return
    }
    fs.unlinkSync(filePath);
  } catch (error) {
    throw new Error('File removal failed');
  }
}
