import type { Card } from "./Card";
import { Deck } from "./Deck";

export class DropboxHandler {
    private DROPBOX_AUTH_URL: string = 'https://www.dropbox.com/oauth2/authorize';
    private DROPBOX_API_URL: string = 'https://api.dropboxapi.com/2';
    private REDIRECT_URI: string = ''; // Initialized to empty string
    private CLIENT_ID: string;

    /**
     * State of the authentication process.
     */
    private accessToken: string | null = null;


    constructor(clientId: string) {
        this.CLIENT_ID = clientId;
        // Attempt to retrieve token from URL hash after redirect
        this.handleRedirect();
    }

    /**
     * Initiates the Dropbox authentication flow by redirecting the user.
     * Make sure REDIRECT_URI is set appropriately before calling this,
     * perhaps via a setter method or by passing it to the constructor
     * if it's known at instantiation time.
     */
    login(redirectUri?: string): void {
        // Use provided redirectUri or the class property
        const effectiveRedirectUri = redirectUri || this.REDIRECT_URI;
        if (!effectiveRedirectUri) {
            console.error('Redirect URI is not set. Cannot initiate login.');
            return;
        }
        const authUrl = `${this.DROPBOX_AUTH_URL}?client_id=${this.CLIENT_ID}&redirect_uri=${encodeURIComponent(effectiveRedirectUri)}&response_type=token`;
        window.location.href = authUrl; // Redirect the user's browser
    }

    /**
     * Sets the Redirect URI.
     * @param uri The redirect URI registered with Dropbox.
     */
    setRedirectUri(uri: string): void {
        this.REDIRECT_URI = uri;
    }


    /**
     * Handles the redirect back from Dropbox, extracting the access token from the URL hash.
     * This should be called when the application loads on the redirect URI page.
     */
    handleRedirect(): void {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const token = params.get('access_token');

        if (token) {
            this.accessToken = token;
            localStorage.setItem('dropboxToken', token);
            window.location.hash = '';
        } else {
            this.accessToken = localStorage.getItem('dropboxToken');
        }
    }

    /**
     * Clears the stored access token, effectively logging the user out client-side.
     * For a full logout, you might need to call the token revoke endpoint.
     */
    logout(): void {
        this.accessToken = null;
        // Optionally, remove the token from persistent storage
        localStorage.removeItem('dropboxToken');
        console.log('User logged out (client-side).');
        // Consider redirecting the user or updating UI state
    }

    /**
     * Checks if an access token is currently stored.
     * @returns {boolean} True if a token exists, false otherwise.
     */
    isLoggedIn(): boolean {
        return !!this.accessToken;
    }

    /**
     * Gets the current access token.
     * @returns {string | null} The access token or null if not logged in.
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }

    /**
     * Lists files in a Dropbox folder.
     * @param path The path to the folder ("" for root).
     * @returns A promise resolving to the list of files.
     */
    async listFiles(path: string = ''): Promise<any> {
        if (!this.accessToken) {
            throw new Error('Not authenticated with Dropbox.');
        }
        const response = await fetch(`${this.DROPBOX_API_URL}/files/list_folder`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path })
        });
        if (!response.ok) {
            throw new Error(`Dropbox API error: ${response.statusText}`);
        }
        return response.json();
    }
    // ...existing code...
    /**
         * Downloads the content of a specific file from Dropbox.
         * @param path The path to the file in Dropbox.
         * @returns A promise resolving to the file content as text.
         */
    async downloadFileContent(path: string): Promise<string> { // Changed return type to Promise<string>
        if (!this.accessToken) {
            throw new Error('Not authenticated with Dropbox.');
        }
        // Note: The download endpoint is on content.dropboxapi.com
        const response = await fetch('https://content.dropboxapi.com/2/files/download', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({ path: path })
            }
            // No 'Content-Type' or body needed for download endpoint with args in header
        });

        if (!response.ok) {
            // Attempt to read error details if available
            let errorDetails = response.statusText;
            try {
                // Try parsing error as JSON, as Dropbox often returns errors this way
                const errorJson = await response.json();
                errorDetails = errorJson.error_summary || errorDetails;
            } catch (e) {
                // Ignore if response body isn't JSON or reading fails
            }
            throw new Error(`Dropbox API error downloading ${path}: ${errorDetails}`);
        }
        // The download endpoint returns the raw file content in the body
        return response.text(); // Changed from response.json() to response.text()
    }

    // ...existing code...

    /**
     * Lists all files in a folder, finds JSON files, downloads and prints their content.
     * @param folderPath The path to the folder in Dropbox ("" for root).
     */
    async printJsonFileContents(folderPath: string = ''): Promise<Deck[]> {

        // Removed unused 'decks' array initialization
        const decks: Deck[] = []; // This was unused in the original code

        if (!this.accessToken) {
            console.error('Not authenticated with Dropbox.');
            return [];
        }
        console.log(`Fetching JSON files from Dropbox folder: ${folderPath || '/'}`);
        try {
            const listResult = await this.listFiles(folderPath);
            const files = listResult.entries.filter((entry: any) =>
                entry['.tag'] === 'file' && entry.name.toLowerCase().endsWith('.json')
            );

            if (files.length === 0) {
                console.log(`No JSON files found in ${folderPath || '/'}.`);
                return [];
            }


            for (const file of files) {
                const filePath = file.path_lower; // Use path_lower for consistency
                try {
                    const fileContentText = await this.downloadFileContent(filePath); // Now gets text
                    const content = JSON.parse(fileContentText);

                    // Check if the expected 'deck' property exists
                    if (content && content.deck) {
                        const deckData = content.deck; // Access the nested deck object


                        // TODO: Verify Deck constructor signature.
                        // The JSON has 'questions', but constructor expects 'cards'.
                        // Assuming 'questions' should map to 'cards' for now.
                        // Also, 'description' is missing in the provided JSON structure.
                        const deck = new Deck(
                            deckData.id,
                            deckData.name,
                            deckData.description, // This might be undefined if not in JSON
                            deckData.cards,   // Using 'questions' from JSON for 'cards' parameter
                            deckData.tags
                        );

                        decks.push(deck); // Store the created deck object

                    } else {
                        console.warn(`Skipping ${file.name}: JSON structure does not contain expected 'deck' property.`);
                    }

                } catch (downloadOrParseError) {
                    // Catch errors from both downloadFileContent and JSON.parse
                    console.error(`Failed to download or parse content for ${file.name}:`, downloadOrParseError);
                }
            }

            return decks; // Return the array of Deck objects created from JSON files
        } catch (error) {
            console.error(`Error listing or processing files in ${folderPath || '/'}:`, error);
            return []; // Return an empty array in case of error
        }
    }

    // ...existing code...

    // ...existing code...


    // ...existing code...

}