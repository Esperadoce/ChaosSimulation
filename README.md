[![BUILD](https://github.com/Esperadoce/ChaosSimulation/actions/workflows/docker-image.yml/badge.svg)](https://github.com/Esperadoce/ChaosSimulation/actions/workflows/docker-image.yml)
[![DEPLOY](https://github.com/Esperadoce/ChaosSimulation/actions/workflows/docker-image.yml/badge.svg)](https://github.com/Esperadoce/ChaosSimulation/actions/workflows/docker-image.yml)
# Double Pendulum & Chaos Simulations

This project is a collection of interactive chaos and physics simulations built with React, including:

- **Double Pendulum** (default page, with dual-canvas comparison and full parameter controls)
- Lorenz Attractor
- Three-Body Problem
- Mandelbrot Set (WebGL accelerated)

## Features
- Modern, minimal UI
- Real-time, interactive controls for all parameters
- Compare two double pendulums with independent initial angles
- GPU-accelerated Mandelbrot fractal
- All code written in JavaScript/React

## How to Run
1. Clone this repository:
   ```sh
   git clone https://github.com/Esperadoce/ChaosSimulation.git
   cd ChaosSimulation
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open your browser to `http://localhost:12908` (we configure Vite to use port 12908).

### Run with Docker
If you prefer containers:

```sh
docker compose up --build
```

Then visit http://localhost:12908 (mapped to port 80 in the container).

## About This Project
This project was created as an experiment using **GitHub Copilot GPT-4.1** for all code, UI, and documentation. All logic, refactoring, and enhancements were generated with Copilot GPT-4.1, demonstrating the power of AI-assisted software development.

Feel free to fork, modify, and share!


## License

Licensed under the Apache License, Version 2.0. See [`LICENSE`](./LICENSE) for details.

This product includes software developed by Hicham Bouchikhi (Esperadoce).
See [`NOTICE`](./NOTICE) for attribution. Repository: https://github.com/Esperadoce/ChaosSimulation · Live: https://chaos-simulation.narexil.tech/
