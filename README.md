# Next Guard

## Overview

**Next Guard** is a web-based tool designed to manage WireGuard servers. It allows administrators to start, stop, and restart WireGuard servers and manage peers, all through a simple and intuitive UI. The application is built using **Next.js** for both the frontend and backend, with a focus on simplicity and ease of use.

## Features

-   Start, stop, and restart WireGuard servers
-   Add, remove, and list peers on the WireGuard server
-   Simple and clean UI for easy management
-   Built using modern web technology with Next.js for both frontend and backend

## Tech Stack

-   **Framework**: Next.js (React framework)
-   **WireGuard**: VPN protocol for secure network tunneling

## Requirements

-   Node.js 18+
-   WireGuard installed on the server
-   Docker (optional for containerization)

## Installation

### Environment Variables

-   **NEXTAUTH_SECRET**: A secret key for securing authentication. It’s essential for handling sessions and authentication safely in NextAuth.js.

    **How to generate**:  
    You can generate a secure `NEXTAUTH_SECRET` using following methods:
    -   **Using OpenSSL (Linux/macOS)**:
        Run this command in your terminal:
        ```
        openssl rand -base64 32
        ```
-   **NEXTAUTH_URL**: The base URL where the application is running. For local development, this is typically `http://localhost:3000`. When deploying, change this to the actual URL of the application.
-   **NODE_ENV**: Defines the environment the application is running in. Set this to `development` for local development and `production` when deploying.
-   **NEXT_PUBLIC_ENABLE_REGISTER_PAGE**: A boolean flag to enable or disable the user registration page. Set this to `true` if you want the registration page to be available, or `false` to disable it.

### Option 1: Manual Installation

1. Clone the repository:
```
git clone https://github.com/hafizhlf/next-guard.git
cd next-guard
cd app
```
2. Install dependencies:
```
npm install
```
3. Run the Next.js development server:
```
npm run dev
```
4. The application will be available at `http://localhost:3000`.

### Option 2: Docker Installation (Recommended for easier deployment)

1.  Clone the repository:
```
git clone https://github.com/hafizhlf/next-guard.git
cd next-guard
```
2. Build and start the Docker container:
```
docker-compose up --build
```
3. The application will be available at `http://localhost:3000`.

### Docker Configuration

-   Ensure that your WireGuard configuration and server paths are correctly set within the container's environment.
-   You can use Docker volumes to persist WireGuard configuration files across container restarts.

## Usage

1.  Run the server using either method (Next.js server or Docker).
2.  Access the application at `http://localhost:3000` to manage your WireGuard server.
3.  Use the UI to add peers, manage connections, and control the server (start/stop/restart).

## Configuration

-   Update the WireGuard server path, peer configurations, and other environment variables in the configuration file if needed.

## License

This project is licensed under the [GPL-3.0 license](LICENSE).

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add your feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

## Roadmap

 - [x] Add user authentication and role-based access control
 - [x] Improve error handling and logging
 - [x] Add real-time peer status monitoring
 - [x] Create Docker setup for easier deployment

## Acknowledgments

-   [WireGuard](https://www.wireguard.com/) for providing a secure VPN solution.
-   [Next.js](https://nextjs.org/) for enabling full-stack web development.

## Contact

For issues or feature requests, feel free to open an issue on the GitHub repository or contact the maintainer.

**Maintainer**: Hafizh Ibnu Syam  
**Email**: hafizh@hafizhibnusyam.xyz
