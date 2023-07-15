# Mellor Auction Chrome Extension

This Chrome extension allows you to scrape auction posts from the Edward Mellor website and display them in a table format. The extension utilizes JavaScript, Axios, jQuery, and DataTables to fetch and manipulate the data.

## Features

- Fetches auction data from the Edward Mellor website
- Populates a table with the fetched data
- Uses DataTables for enhanced table functionality and interactivity

## Installation

1. Clone the repository or download the source code.
2. Open the Chrome browser and navigate to ```chrome://extensions/```.
3. Enable the "Developer mode" toggle in the top-right corner.
4. Click on the "Load unpacked" button.
5. Select the folder containing the cloned/downloaded source code.

## Usage

1. After installing the extension, open a new tab in Chrome.
2. Click on the Mellor Auction Chrome Extension icon to activate it.
3. The extension will fetch auction data from the Edward Mellor website and display it in a table.
4. The table can be sorted, searched, and filtered using DataTables functionality.

## Development

1. Install the required dependencies using npm:

   ```npm install```

2. Update the necessary configuration in `index.js`, such as the base URL and API endpoint.
3. Customize the HTML structure in `index.html` and the styles in `styles.css` as needed.
4. Run the build command to generate the final bundle:

   - For production mode (minified code, optimized for distribution):

     ```npm run build```

   The compiled extension will be placed in the `dist` folder.

5. To load the unpacked extension in Chrome:

   - Open the Chrome browser.
   - Navigate to ```chrome://extensions/``` in the address bar.
   - Enable the "Developer mode" toggle in the top-right corner of the page.
   - Click on the "Load unpacked" button.
   - Select the `dist` folder that contains the compiled extension.

## Credits

- [Edward Mellor website](https://edwardmellor.co.uk) - Source of auction data.
- [Axios](https://axios-http.com) - Promise-based HTTP client for fetching data.
- [jQuery](https://jquery.com) - JavaScript library for DOM manipulation.
- [DataTables](https://datatables.net) - Plugin for enhancing HTML tables with advanced features.

## License

This project is licensed under the [MIT License](LICENSE).
