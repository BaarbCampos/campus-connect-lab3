# Campus Connect – Events & Persistent Storage
https://github.com/BaarbCampos/campus-connect-lab3
## Student Information

- **Name:** Barbara Campos
- **Student ID:** 20120669
- **Module:** B9IS126
- **Assessment:** Lab 3 – Campus Connect

## 1. About the Project

Campus Connect is a small application built with Ionic React. It helps students find campus events and save the ones they are interested in.

The app gets event information from a JSON file and displays it in cards. Students can search for events by title or location, save their favourite events and remove them whenever they want.

Favourite events are saved locally, so they are still available after refreshing the browser.

## 2. Technologies and Versions

The following technologies were used in this project:

| Technology | Version |
|---|---|
| Node.js | 24.13.0 |
| npm | 11.6.2 |
| Ionic React | 9.0.8 |
| React | 19.0.0 |
| Capacitor Core | 8.5.3 |
| Capacitor Preferences | 8.0.1 |
| TypeScript | 5.9.x |
| Vite | 8.x |

## 3. How to Run the Project

Make sure Node.js and npm are installed on your computer.

Open the project folder in the terminal and install the dependencies:

```bash
npm install
```

To start the application, run:

```bash
npm run dev
```

Open the local URL shown in the terminal in your browser.

To check the project and create a production build, run:

```bash
npm run build
```

## 4. Main Features

### Events

The app loads the events from `public/events.json` using the Fetch API and React's `useEffect` hook.

Each event is displayed in an Ionic card with its title, date, time, location and description.

### Search

Students can search for events by title or location using the search bar.

The search works with uppercase and lowercase letters and ignores extra spaces at the beginning or end. Clearing the search shows the events again.

If there are no matching events, the app displays a message.

### Favourite Events

Students can save more than one event as a favourite.

There is also a Favourites view where all saved events can be seen together. Each favourite can be removed individually.

## 5. How Favourite Events Are Saved

The app uses Capacitor Preferences to save favourite event IDs.

The storage key is:

`campusConnectFavourites`

The saved information is stored as a JSON string. For example:

```json
["evt-01", "evt-03"]
```

The app uses `Preferences.get()` to read the saved favourites and `Preferences.set()` to save changes.

When the app starts, it first checks for previously saved favourites. The favourite buttons are enabled after this process, helping to prevent existing data from being replaced by an empty list.

The app also checks for duplicate IDs and uses a write queue to help prevent overlapping storage updates.

## 6. Testing

The following tests were carried out during development:

| Test | Result |
|---|---|
| Load and display all four events | Passed |
| Search for an event | Passed |
| Search with no matching results | Passed |
| Clear the search | Passed |
| Save two different favourites | Passed |
| Refresh the browser and restore favourites | Passed |
| Remove one favourite | Passed |
| Refresh and check that the other favourite remains | Passed |
| Temporarily rename the JSON file to test the fetch error | Passed |
| Display the error message and Try Again button | Passed |
| Run the production build | Passed |

### Fetch Error Test

I temporarily changed the name of `events.json` to check what happens when the app cannot find the file.

The app displayed an error message and a Try Again button. I then restored the original file name and refreshed the application.

The retry button appeared, but a successful retry using that button was not separately verified.

### Favourite Test

I saved two events and refreshed the browser. Both favourites were still there.

After that, I removed one event and refreshed the browser again. The other favourite remained saved.

## 7. Screenshots

The `screenshots` folder contains evidence of the main application features.

The following screenshots should be included:

0. ` 00-events-list.png` – Events List.
1. `01-search-results.png` – Search results.
2. `02-no-search-results.png` – Message shown when there are no matching events.
3. `03-two-saved-favourites.png` – Two saved favourites after refreshing.
4. `04-remaining-favourite.png` – One favourite remaining after removal and refresh.
5. `05-fetch-error.png` – Error message when the JSON file is unavailable.

## 8. Known Limitations

The application was tested in a web browser. A native Android or iOS version was not required for this assessment.

Invalid saved JSON data and Preferences read/write failures have not been fully tested.

The event information comes from a local JSON file rather than an external API.

## 9. Sources and Acknowledgements

The B9IS126 Lab 3 assessment brief was used as the main guide for this project.

The following documentation was also used:

- Ionic: https://ionicframework.com/docs
- Capacitor Preferences: https://capacitorjs.com/docs/apis/preferences
- React: https://react.dev/

ChatGPT was used to provide explanations, help with troubleshooting and assist with the preparation of the project documentation.

The project was developed as an individual assessment.