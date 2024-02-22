import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audio, setAudio] = useState(null);
  const [volume, setVolume] = useState(0.5); // Initial volume set to 50%
  const [duration, setDuration] = useState(0); // Track duration in seconds
  const [currentTime, setCurrentTime] = useState(0); // Current playback time in seconds

  useEffect(() => {
    // Load saved playlist from local storage on component mount
    const savedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
    setPlaylist(savedPlaylist);

    // Load last played track index from local storage
    const lastPlayedIndex = parseInt(localStorage.getItem('lastPlayedIndex'));
    setCurrentTrackIndex(lastPlayedIndex);
  }, []);

  useEffect(() => {
    // Save playlist to local storage whenever it changes
    localStorage.setItem('playlist', JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    // Save last played track index to local storage whenever it changes
    localStorage.setItem('lastPlayedIndex', currentTrackIndex);
  }, [currentTrackIndex]);

  useEffect(() => {
    // Set volume on audio element when it's created
    if (audio) {
      audio.volume = volume;
    }
  }, [audio, volume]);

  useEffect(() => {
    // Update duration when audio metadata is loaded
    const handleLoadedMetadata = () => {
      setDuration(Math.floor(audio.duration));
    };

    if (audio) {
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [audio]);

  useEffect(() => {
    // Update current time when time is updated
    const handleTimeUpdate = () => {
      setCurrentTime(Math.floor(audio.currentTime));
    };

    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [audio]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPlaylist([...playlist, file]);
  };

  const handlePlay = () => {
    if (audio) {
      audio.play();
    } else {
      const track = playlist[currentTrackIndex];
      const newAudio = new Audio(URL.createObjectURL(track));
      newAudio.addEventListener('ended', handleTrackEnded);
      setAudio(newAudio);
      newAudio.play();
    }
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
    }
  };

  const handleTrackEnded = () => {
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0);
    }
  };

  const handleNext = () => {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= playlist.length) {
      nextIndex = 0;
    }
    setCurrentTrackIndex(nextIndex);

    // Reset audio element to play the new track
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = URL.createObjectURL(playlist[nextIndex]);
      audio.play();
    }
  };

  const handlePrevious = () => {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1;
    }
    setCurrentTrackIndex(prevIndex);

    // Reset audio element to play the new track
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = URL.createObjectURL(playlist[prevIndex]);
      audio.play();
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const handleRemoveTrack = (indexToRemove) => {
    setPlaylist(playlist.filter((_, index) => index !== indexToRemove));
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.heading}>Music Player App</h1>
        <p style={styles.bio}>Welcome to the Music Player App. Upload your favorite tracks and enjoy listening!</p>
      </header>
      <div style={styles.body}>
        <div style={styles.container}>
          <input type="file" accept="audio/mp3" onChange={handleFileChange} />
          <button style={styles.button} onClick={handlePlay}>Play</button>
          <button style={styles.button} onClick={handlePause}>Pause</button>
          <button style={styles.button} onClick={handlePrevious}>Previous</button>
          <button style={styles.button} onClick={handleNext}>Next</button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
          />
          <h2 style={styles.title}>Now Playing</h2>
          {audio && <p style={styles.nowPlaying}>{playlist[currentTrackIndex].name}</p>}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => {
              const newTime = parseInt(e.target.value);
              setCurrentTime(newTime);
              audio.currentTime = newTime;
            }}
          />
          <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
          <h2 style={styles.title}>Playlist</h2>
          <div style={styles.playlist}>
            {playlist.map((track, index) => (
              <div key={index} style={styles.playlistItemWrapper}>
                <p style={styles.playlistItem}>{track.name}</p>
                <button style={styles.deleteButton} onClick={() => handleRemoveTrack(index)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#808281',
    padding: '20px 0', // Increased padding for better spacing
    textAlign: 'center',
    color: '#fff',
  },
  heading: {
    fontSize: '30px',
    marginBottom: '10px',
    fontFamily: 'Arial, sans-serif', // Example font family
  },
  bio: {
    fontSize: '15px',
    fontFamily: 'Arial, sans-serif', // Example font family
  },
  body: {
    backgroundColor: '#DDF7F5',
    minHeight: 'calc(90vh - 60px)', /* Adjusted to account for header height */
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ccc', // Add border style
    borderRadius: '10px', // Add border radius for rounded corners
  },
  container: {
    maxWidth: '800px',
    width: '90%',
    padding: '25px',
    backgroundColor: '#ffffff',
    borderRadius: '15px',
    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '15px',
  },
  title: {
    marginTop: '20px',
    fontSize: '24px',
    marginBottom: '10px',
    color: '#333333',
  },
  playlist: {
    padding: '10px',
    backgroundColor: '#DDF7F5',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  playlistItemWrapper: {
    marginBottom: '5px',
    overflow: 'hidden', // Ensure text doesn't overflow
    display: 'flex',
    alignItems: 'center',
  },
  playlistItem: {
    flex: '1',
    padding: '5px 10px',
    borderRadius: '4px',
    background: '#f0f0f0',
    whiteSpace: 'nowrap', // Prevent text from wrapping
    textOverflow: 'ellipsis', // Show ellipsis (...) for overflowed text
    overflow: 'hidden', // Hide overflowed text
  },
  deleteButton: {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '5px',
  },
  nowPlaying: {
    fontWeight: 'bold',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    marginBottom: '20px',
    color: '#4CAF50',
  },
};

export default App;
