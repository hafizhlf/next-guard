// wireguard.js
import { prepareWireguardConfig, createWireguardFile, startWireguardServer } from './lib/wireguard'
import Server from './models/server'

async function main(): Promise<void> {
  try {
    // Fetch all servers from the database
    const servers = await Server.findAll()

    if (servers.length === 0) {
      console.log('No servers found.')
      return
    }

    // Iterate over all the servers and start WireGuard for each one
    for (const server of servers) {
      if (server.status === "Online") {
        const filename: string = server.name
        const content = await prepareWireguardConfig(server.id)
        await createWireguardFile(filename, content)
        try {
          await startWireguardServer(filename)
          console.log(`WireGuard server for ${server.id} started successfully`)
        } catch (error) {
          console.error(`Error starting WireGuard server for ${server.id}:`, error)
        }
      }
    }
  } catch (error) {
    console.error('Error retrieving servers:', error)
  }
}

main()
