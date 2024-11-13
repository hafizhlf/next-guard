import fs from 'fs'
import path from 'path'
import Server from 'models/server'
import Peer from 'models/peer'
import { exec } from 'child_process'

export async function prepareWireguardConfig(serverId: number): Promise<string> {
  // Fetch server data (replace this with your actual method to get server details)
  const server = await Server.findByPk(serverId); // Assuming getServerById is a function to fetch server details by ID

  if (!server) {
    throw new Error(`Server with ID ${serverId} not found`);
  }

  const WG_PRE_UP = '';

  const WG_POST_UP = `iptables -t nat -A POSTROUTING -s ${server.ip_address} -o eth0 -j MASQUERADE;
iptables -A INPUT -p udp -m udp --dport ${server.port} -j ACCEPT;
iptables -A FORWARD -i wg0 -j ACCEPT;
iptables -A FORWARD -o wg0 -j ACCEPT;
ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE;
ip6tables -A INPUT -p udp -m udp --dport ${server.port} -j ACCEPT;
ip6tables -A FORWARD -i wg0 -j ACCEPT;
ip6tables -A FORWARD -o wg0 -j ACCEPT;`.split('\n').join(' ');

  const WG_POST_DOWN = `iptables -t nat -D POSTROUTING -s ${server.ip_address} -o eth0 -j MASQUERADE;
iptables -D INPUT -p udp -m udp --dport ${server.port} -j ACCEPT;
iptables -D FORWARD -i wg0 -j ACCEPT;
iptables -D FORWARD -o wg0 -j ACCEPT;
ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE;
ip6tables -D INPUT -p udp -m udp --dport ${server.port} -j ACCEPT;
ip6tables -D FORWARD -i wg0 -j ACCEPT;
ip6tables -D FORWARD -o wg0 -j ACCEPT;`.split('\n').join(' ');

  const WG_PRE_DOWN = '';

  let content = `
# WireGuard Configuration
# Server name = ${server.name}
[Interface]
PrivateKey = ${server.private_key}
Address = ${server.ip_address}
ListenPort = ${server.port}
PreUp = ${WG_PRE_UP}
PostUp = ${WG_POST_UP}
PreDown = ${WG_PRE_DOWN}
PostDown = ${WG_POST_DOWN}
MTU = 1420
`;

  // Fetch peers associated with the server
  const peers = await Peer.findAll({
    where: {
      server_id: serverId,
    },
    order: [['id', 'asc']],
  });

  // Add peer configurations to the content
  peers.forEach(peer => {
    content += `

# Client: ${peer.name} (${peer.id})
[Peer]
PublicKey = ${peer.public_key}
${peer.preshared_key ? `PresharedKey = ${peer.preshared_key}\n` : ''}AllowedIPs = ${peer.ip_address}/32
`;
  });

  return content;
}

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
    exec(`wg show ${interfaceName}`, (err) => {
      if (err) {
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

/**
 * Reloads the WireGuard server with the specified configuration file.
 *
 * @param filename - The name of the configuration file to use (without '.conf').
 * @throws Error if reloading the server fails or the filename is invalid.
 */
export async function reloadWireguardServer(filename: string): Promise<void> {
  // Security check to prevent directory traversal attacks
  if (!filename || filename.includes('/') || filename.includes('..')) {
    throw new Error('Invalid filename');
  }

  try {
    const isRunning = await new Promise<boolean>((resolve) => {
      exec(`wg show ${filename}`, (error) => {
        resolve(!error)
      });
    });

    const server = await Server.findOne({
      where: {
        name: filename
      }
    })

    if (server) {
      const content = await prepareWireguardConfig(server.id)
      await createWireguardFile(filename, content)
    }

    if (isRunning) {
      await new Promise<void>((resolve, reject) => {
        exec(`wg syncconf ${filename} <(wg-quick strip ${filename})`, { shell: 'bash' }, (error, stdout, stderr) => {
          if (error) {
            reject(new Error(`Failed to reload WireGuard server: ${stderr || (error as Error).message}`));
            return;
          }
          console.log(`WireGuard server reloaded: ${stdout}`);
          resolve();
        });
      });
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Error reloading WireGuard server: ' + error.message);
    } else {
      throw new Error('An unknown error occurred while reloading the WireGuard server');
    }
  }
}

export async function peerTransferRate(peer: string): Promise<{ sent: number, received: number }> {
  try {
    return await new Promise<{ sent: number, received: number }>((resolve, reject) => {
      exec(`wg show wg0 transfer | grep -A 5 "${peer}"`, { shell: 'bash' }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to get Peer Rate: ${stderr || (error as Error).message}`));
          return;
        }
        const cleanedStdout = stdout.replace(/\s+/g, ' ').trim()
        const parts = cleanedStdout.split(' ')
        const sent = Number(parts[1])
        const received = Number(parts[2])
        resolve({ sent, received })
      });
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Error reloading WireGuard server: ' + error.message);
    } else {
      throw new Error('An unknown error occurred while reloading the WireGuard server');
    }
  }
}
