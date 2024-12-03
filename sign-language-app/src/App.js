// import React, { useState } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [inputText, setInputText] = useState('');
//   const [imagePaths, setImagePaths] = useState([]);
//   const [videoUrl, setVideoUrl] = useState('');
//   const [error, setError] = useState('');

//   // Handle input change
//   const handleInputChange = (e) => {
//     setInputText(e.target.value);
//   };

//   // Handle click event for getting sign language images
//   const handleGetSignLanguage = () => {
//     if (!inputText) {
//       alert('Please enter some text!');
//       return;
//     }

//     // Send the input text to the backend
//     axios
//       .post('http://localhost:5000/generate_sign_images', { text: inputText })
//       .then((response) => {
//         // Log the response to check the image paths
//         console.log('Response from backend:', response.data);
//         setImagePaths(response.data.imagePaths);
//         setError('');
//       })
//       .catch((err) => {
//         console.error('Error fetching images:', err);
//         setError('Error fetching images');
//       });
//   };

//   // Handle click event for generating video
//   const handleGenerateVideo = () => {
//     axios
//       .post('http://localhost:5000/generate_video')
//       .then((response) => {
//         // Log the video URL returned from the backend
//         console.log('Video URL from backend:', response.data.video_url);
//         // Set video URL after video generation
//         setVideoUrl(response.data.video_url);
//         setError('');
//       })
//       .catch((err) => {
//         console.error('Error generating video:', err);
//         setError('Error generating video');
//       });
//   };

//   return (
//     <div className="App">
//       <h1>Text-to-Sign Language Converter</h1>
//       <input
//         type="text"
//         value={inputText}
//         onChange={handleInputChange}
//         placeholder="Enter text here"
//       />
//       <button onClick={handleGetSignLanguage}>Get Sign Language</button>
//       <button onClick={handleGenerateVideo}>Generate Video</button>

//       {error && <p style={{ color: 'red' }}>{error}</p>}

//       {/* Images section removed */}
//       {/* No images will be rendered here anymore */}

//       {videoUrl && (
//         <div>
//           <h2>Generated Video</h2>
//           <video controls width="640">
//             <source src={`http://localhost:5000${videoUrl}`} type="video/mp4" />
//             Your browser does not support the video tag.
//           </video>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [imagePaths, setImagePaths] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState(''); // State for audio file
  const [error, setError] = useState('');

  // Handle input change
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  // Handle click event for getting sign language images
  const handleGetSignLanguage = () => {
    if (!inputText) {
      alert('Please enter some text!');
      return;
    }

    // Send the input text to the backend
    axios
      .post('http://localhost:5000/generate_sign_images', { text: inputText })
      .then((response) => {
        setImagePaths(response.data.imagePaths);
        setError('');
      })
      .catch((err) => {
        console.error('Error fetching images:', err);
        setError('Error fetching images');
      });
  };

  // Handle click event for generating video
  const handleGenerateVideo = () => {
    axios
      .post('http://localhost:5000/generate_video')
      .then((response) => {
        setVideoUrl(response.data.video_url);
        setError('');
      })
      .catch((err) => {
        console.error('Error generating video:', err);
        setError('Error generating video');
      });
  };

  // Handle click event for text-to-speech
  const handleTextToSpeech = () => {
    if (!inputText) {
      alert('Please enter some text!');
      return;
    }

    axios
      .post('http://localhost:5000/synthesize', { text: inputText }, { responseType: 'blob' })
      .then((response) => {
        const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setError('');
      })
      .catch((err) => {
        console.error('Error synthesizing text:', err);
        setError('Error synthesizing text');
      });
  };

  return (
    <div className="App">
      <h1>Text-to-Sign Language & Text-to-Speech Converter</h1>
      <input
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder="Enter text here"
      />
      <button onClick={handleGetSignLanguage}>Get Sign Language</button>
      <button onClick={handleGenerateVideo}>Generate Video</button>
      <button onClick={handleTextToSpeech}>Text-to-Speech</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {videoUrl && (
        <div>
          <h2>Generated Video</h2>
          <video controls width="640">
            <source src={`http://localhost:5000${videoUrl}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {audioUrl && (
        <div>
          <h2>Generated Audio</h2>
          <audio controls>
            <source src={audioUrl} type="audio/mp3" />
            Your browser does not support the audio tag.
          </audio>
        </div>
      )}
    </div>
  );
}

export default App;
