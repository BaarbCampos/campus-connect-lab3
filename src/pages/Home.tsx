
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSearchbar,
  IonSpinner,
  IonButton,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/react';

import { useState, useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';

interface CampusEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

const STORAGE_KEY = 'campusConnectFavourites';

const Home: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [favouritesReady, setFavouritesReady] = useState(false);
  const [storageError, setStorageError] = useState('');

  const [view, setView] = useState<'all' | 'favourites'>('all');

  const favouritesRef = useRef<string[]>([]);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  // Load events from JSON
  useEffect(() => {
    let cancelled = false;

    const loadEvents = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/events.json');

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data: unknown = await response.json();

        if (
          !Array.isArray(data) ||
          !data.every((event) =>
            event !== null &&
            typeof event === 'object' &&
            typeof event.id === 'string' &&
            typeof event.title === 'string' &&
            typeof event.date === 'string' &&
            typeof event.time === 'string' &&
            typeof event.location === 'string' &&
            typeof event.description === 'string'
          )
        ) {
          throw new Error('Invalid events data. Please check events.json.');
        }

        if (!cancelled) {
          setEvents(data as CampusEvent[]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load events. Please try again.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      cancelled = true;
    };
  }, [reload]);

  // Restore favourites from Preferences
  useEffect(() => {
    let active = true;

    const loadFavourites = async () => {
      try {
        const result = await Preferences.get({
          key: STORAGE_KEY
        });

        let restoredIds: string[] = [];

        if (result.value !== null) {
          const parsed: unknown = JSON.parse(result.value);

          if (
            !Array.isArray(parsed) ||
            !parsed.every((id) => typeof id === 'string')
          ) {
            throw new Error('Invalid saved favourites data.');
          }

          restoredIds = [...new Set(parsed)];
        }

        if (active) {
          favouritesRef.current = restoredIds;
          setFavouriteIds(restoredIds);
          setFavouritesReady(true);
        }
      } catch (err) {
        if (active) {
          favouritesRef.current = [];
          setFavouriteIds([]);
          setStorageError(
            err instanceof Error
              ? err.message
              : 'Unable to restore favourites.'
          );
          setFavouritesReady(true);
        }
      }
    };

    loadFavourites();

    return () => {
      active = false;
    };
  }, []);

  // Save favourites without overlapping writes
  const saveFavourites = (nextIds: string[]) => {
    writeQueue.current = writeQueue.current
      .then(async () => {
        await Preferences.set({
          key: STORAGE_KEY,
          value: JSON.stringify(nextIds)
        });

        setStorageError('');
      })
      .catch(() => {
        setStorageError(
          'Unable to save favourites. Your changes may not be stored.'
        );
      });
  };

  // Add or remove a favourite
  const toggleFavourite = (id: string) => {
    if (!favouritesReady) return;

    const currentIds = favouritesRef.current;

    const nextIds = currentIds.includes(id)
      ? currentIds.filter((savedId) => savedId !== id)
      : [...currentIds, id];

    favouritesRef.current = nextIds;
    setFavouriteIds(nextIds);

    saveFavourites(nextIds);
  };

  // Apply favourites filter and search
  const visibleEvents = events.filter((event) => {
    const matchesFavourite =
      view === 'all' || favouriteIds.includes(event.id);

    const query = search.trim().toLowerCase();

    const matchesSearch =
      event.title.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query);

    return matchesFavourite && matchesSearch;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Campus Connect</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        <h1>Campus Events</h1>
        <p>Discover activities and meet other students.</p>

        <h2>Upcoming Events</h2>

        <IonSearchbar
          value={search}
          placeholder="Search by title or location"
          onIonInput={(event) =>
            setSearch(event.detail.value ?? '')
          }
        />

        <IonSegment
          value={view}
          onIonChange={(event) =>
            setView(event.detail.value as 'all' | 'favourites')
          }
        >
          <IonSegmentButton value="all">
            <IonLabel>All Events</IonLabel>
          </IonSegmentButton>

          <IonSegmentButton value="favourites">
            <IonLabel>Favourites</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <p>
          Saved favourites: <IonBadge>{favouriteIds.length}</IonBadge>
        </p>

        {!favouritesReady && (
          <p>Loading saved favourites...</p>
        )}

        {storageError && (
          <p role="alert">
            Storage warning: {storageError}
          </p>
        )}

        {loading && (
          <div className="ion-text-center">
            <IonSpinner name="crescent" />
            <p>Loading campus events...</p>
          </div>
        )}

        {!loading && error && (
          <div>
            <p>Unable to load events: {error}</p>
            <IonButton
              onClick={() => setReload((value) => value + 1)}
            >
              Try Again
            </IonButton>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <p>No events are currently available.</p>
        )}

        {!loading && !error && view === 'favourites' &&
          favouriteIds.length === 0 && (
            <p>You have no saved favourites yet.</p>
          )}

        {!loading && !error && visibleEvents.length === 0 &&
          events.length > 0 &&
          !(view === 'favourites' && favouriteIds.length === 0) && (
            <p>No events match your search. Try another search.</p>
          )}

        {!loading && !error && visibleEvents.map((event) => {
          const isFavourite = favouriteIds.includes(event.id);

          return (
            <IonCard key={event.id}>
              <IonCardHeader>
                <IonCardTitle>{event.title}</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Description:</strong> {event.description}</p>

                <p>
                  Status:{' '}
                  <IonBadge color={isFavourite ? 'success' : 'medium'}>
                    {isFavourite ? 'Saved' : 'Not saved'}
                  </IonBadge>
                </p>

                <IonButton
                  expand="block"
                  color={isFavourite ? 'medium' : 'primary'}
                  disabled={!favouritesReady}
                  onClick={() => toggleFavourite(event.id)}
                >
                  {isFavourite
                    ? 'Remove Favourite'
                    : 'Save to Favourites'}
                </IonButton>
              </IonCardContent>
            </IonCard>
          );
        })}

      </IonContent>
    </IonPage>
  );
};

export default Home;
