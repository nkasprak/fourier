Requirements: Docker

To install required components, do

    chmod +x install.sh
    ./install.sh

(on windows, just run `docker-compose -f docker-setup.yml run node-setup` directly; the shell script is just that one command)

To bring up a local test site, just run `docker-compose up` and visit `http://localhost:8080`