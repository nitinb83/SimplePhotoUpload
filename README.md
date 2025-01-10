# SimplePhotoUpload

This is a Node.js application for uploading the media files. It uses Express.js for the server, Multer for handling file uploads, and Worker Threads for background processing.

## Features

- File upload with progress indication
- Check if a file already exists on the server
- Cross-Origin Resource Sharing (CORS) enabled for access from other devices on the LAN

## Prerequisites

- Node.js installed on your machine
- npm (Node Package Manager) installed
- LAN network (wireless network could be performed by connecting 2 devices to same router)

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/nitinb83/SimplePhotoUpload.git
    ```

2. Navigate to the project directory:

    ```sh
    cd SimplePhotoUpload
    ```

3. Install the dependencies:

    ```sh
    npm install
    ```

## Configuration

1. Update the [uploadDir] variable in [server.js] to specify the correct upload directory:

    ```javascript
    const uploadDir = 'path/to/your/upload/directory';
    ```

## Usage

1. Connect transmitter and received device to same Wired/ Wireless network
2. Start the server:

    ```sh
    node server.js
    ```

3. The server will be running on `http://<system-ip>:3000`.

4. Use the provided client-side HTML page to upload files to the server.

## Screenshots

Screenshot of the user site website showcasing the main interface and features

<img src="https://github.com/user-attachments/assets/aded1715-3ef0-4638-b980-fcf0f87e0a82" alt="User Site" width="400" align="center"/>

<img src="https://github.com/user-attachments/assets/e5113128-2e7d-46f3-a7ce-cb53e432c602" alt="Post File Process" width="400" align="center"/>

## Endpoints

### POST /upload

Uploads the file to the server.

#### Request

- `Content-Type: multipart/form-data`
- Body: Form data containing the file to be uploaded

#### Response

- `200 OK` if the file is uploaded successfully
- `400 Bad Request` if there is an error in the request

### POST /check

Checks if a file exists on the server.

#### Request

- `Content-Type: application/json`
- Body: JSON object containing the filename and size

    ```json
    {
        "filename": "example.txt",
        "size": 2
    }
    ```

#### Response

- `200 OK` with a JSON object indicating if the file exists

    ```json
    {
        "exists": true,
        "filename": "example.txt",
        "size": 2,
        "comment": "File already exists"
    }
    ```
