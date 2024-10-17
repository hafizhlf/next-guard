# Next Guard

## Overview

**Next Guard** is a web-based tool designed to manage WireGuard servers. It allows administrators to start, stop, and restart WireGuard servers and manage peers. The application is built using **Next.js** for the frontend and **FastAPI** for the backend, with a focus on simplicity and ease of use.

## Features

- Start, stop, and restart WireGuard servers
- Add, remove, and list peers on the WireGuard server
- Simple and clean UI for easy management
- Built using modern web technologies: FastAPI (backend) and Next.js (frontend)

## Tech Stack

- **Frontend**: Next.js (React framework)
- **Backend**: FastAPI (Python web framework)
- **WireGuard**: VPN protocol for secure network tunneling

## Requirements

- Python 3.9+
- Node.js 16+
- WireGuard installed on the server
- FastAPI
- Next.js
- Docker (optional for containerization)

## Installation

### Backend (FastAPI)

1. Clone the repository:
```bash
   git clone https://github.com/yourusername/wireguard-manager.git
   cd wireguard-manager
   ```
2. Create a virtual environment:
```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install the dependencies:
```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
```bash
   uvicorn main:app --reload
   ```

### Frontend (Next.js)

1.  Go to the frontend directory:
```bash
   cd ../wireguard-ui
   ```
2. Install dependencies:
```bash
   npm install
   ```
3. Run the Next.js development server:
```bash
   npm run dev
   ```
4. The frontend will be available at `http://localhost:3000`.

## Usage

1.  Start the FastAPI backend server (see above).
2.  Run the Next.js frontend (see above).
3.  Access the application at `http://localhost:3000` to manage your WireGuard server.
4.  Use the UI to add peers, manage connections, and control the server (start/stop/restart).

## Configuration

-   **Backend**: You may need to configure the WireGuard server path, peer configurations, and other environment variables in the `config.py` file.
-   **Frontend**: Update the API URL in the `frontend/config.js` file if the backend is running on a different server.

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

- [ ] Add user authentication and role-based access control
- [ ] Improve error handling and logging
- [ ] Add real-time peer status monitoring
- [ ] Create Docker setup for easier deployment

## Acknowledgments

-   [WireGuard](https://www.wireguard.com/) for providing a secure VPN solution.
-   [Next.js](https://nextjs.org/) and [FastAPI](https://fastapi.tiangolo.com/) for modern web development frameworks.

## Contact

For issues or feature requests, feel free to open an issue on the GitHub repository or contact the maintainer.

**Maintainer**: Hafizh Ibnu Syam  
**Email**: hafizh@hafizhibnusyam.xyz
