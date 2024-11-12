import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

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
    throw new Error('Invalid filename')
  }

  filename = filename + '.conf'

  // Define the path to the WireGuard directory
  const filePath = path.join('/etc/wireguard', filename)

  try {
    // Write content to the file with secure permissions
    fs.writeFileSync(filePath, content, { mode: 0o600 }) // Mode 600 for security
  } catch {
    throw new Error('File creation failed')
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
    throw new Error('Invalid filename')
  }

  filename = filename + '.conf'

  // Define the path to the WireGuard directory
  const filePath = path.join('/etc/wireguard', filename)

  try {
    // Check if the file exists before attempting to remove it
    if (!fs.existsSync(filePath)) {
      return
    }
    fs.unlinkSync(filePath)
  } catch {
    throw new Error('File removal failed')
  }
}

// Check if WireGuard interface exists
const checkWireGuardInterfaceExists = (interfaceName: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    exec(`wg show ${interfaceName}`, (err, stderr) => {
      if (err || stderr) {
        reject(new Error(`WireGuard interface ${interfaceName} does not exist.`))
      } else {
        resolve(true)
      }
    })
  })
}

/**
 * Starts a WireGuard server using the specified configuration file.
 *
 * @param filename - The name of the configuration file to use (without '.conf').
 * @throws Error if starting the server fails or the filename is invalid.
 */
export async function startWireguardServer(filename: string): Promise<void> {
  // Security check to prevent directory traversal attacks
  if (!filename || filename.includes('/') || filename.includes('..')) {
    throw new Error('Invalid filename')
  }

  try {
    // Check if the WireGuard interface exists
    await checkWireGuardInterfaceExists(filename)
    console.log(`WireGuard server for ${filename} is already running.`)
  } catch {
    filename = filename + '.conf'

    // Define the path to the WireGuard configuration file
    const filePath = path.join('/etc/wireguard', filename)
    try {
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        throw new Error('Configuration file does not exist')
      }

      // Use `wg-quick up` to start the WireGuard server with the specified configuration file
      await new Promise<void>((resolve, reject) => {
        exec(`wg-quick up ${filePath}`, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Failed to start WireGuard server: ${stderr || error.message}`))
            return
          }
          console.log(`WireGuard server started: ${stdout}`)
          resolve()
        })
      })
    } catch (error) {
      // Check if error is an instance of Error to safely access `message`
      if (error instanceof Error) {
        throw new Error('Error starting WireGuard server: ' + error.message)
      } else {
        throw new Error('An unknown error occurred while starting the WireGuard server')
      }
    }
  }

}

/**
 * Stops a WireGuard server using the specified configuration file.
 *
 * @param filename - The name of the configuration file to use (without '.conf').
 * @throws Error if stopping the server fails or the filename is invalid.
 */
export async function stopWireguardServer(filename: string): Promise<void> {
  // Security check to prevent directory traversal attacks
  if (!filename || filename.includes('/') || filename.includes('..')) {
    throw new Error('Invalid filename');
  }

  filename = filename + '.conf';

  // Define the path to the WireGuard configuration file
  const filePath = path.join('/etc/wireguard', filename);

  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('Configuration file does not exist');
    }

    // Check if WireGuard server is already stopped
    const isRunning = await new Promise<boolean>((resolve) => {
      exec(`wg show ${path.basename(filePath, '.conf')}`, (error) => {
        resolve(!error); // If `wg show` has no error, the server is running
      });
    });

    if (!isRunning) {
      console.log(`WireGuard server is already stopped for ${filename}`);
      return;
    }

    // Use `wg-quick down` to stop the WireGuard server with the specified configuration file
    await new Promise<void>((resolve, reject) => {
      exec(`wg-quick down ${filePath}`, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to stop WireGuard server: ${stderr || (error as Error).message}`));
          return;
        }
        console.log(`WireGuard server stopped: ${stdout}`);
        resolve();
      });
    });
  } catch (error) {
    // Check if error is an instance of Error to safely access `message`
    if (error instanceof Error) {
      throw new Error('Error stopping WireGuard server: ' + error.message);
    } else {
      throw new Error('An unknown error occurred while stopping the WireGuard server');
    }
  }
}
