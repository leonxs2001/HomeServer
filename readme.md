# Home Server: WeightWatch & DriveWatch

This is a personal home server project that helps track food intake and driving expenses. The project is split into two main modules:

- **WeightWatch**: Track your daily food intake, including calories, carbohydrates, sugar, protein, and fat.
- **DriveWatch**: Track your car trips and calculate the share of fuel expenses based on usage.

The project is built using Django as the web framework and is intended for personal use. While the code and HTML views may not be the most polished, they are functional.

## Features

### WeightWatch
- Track calories, carbohydrates, sugar, protein, and fat.
- Add and manage food entries.
- Add and manage ingredients.
- Sshow statitics for all macros

### DriveWatch
- Log car trips with distance.
- Calculate the fuel cost per user based on trip data.

## Notes
- This project is a hobby and has not been optimized for production use.
- The code and HTML views are functional but may not follow best practices.
- Contributions and suggestions are welcome but please note this is a personal project.

### Prerequisites
- Docker
- Docker Compose

## Installation

> **Note**: The following installation instructions are provided for those who wish to use the project themselves, despite it being a personal hobby project.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/leonxs2001/HomeServer.git
   cd HomeServer
   ```
2. **Build and start the server using Docker Compose**
   ```bash
   docker-compose up
   ```


