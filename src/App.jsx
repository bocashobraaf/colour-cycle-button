import React, { useState } from 'react';
import './App.css';
import ColourGradient from './ColourGradient';
import FilmGrain from './FilmGrain';

// Colour cycle button that uses the provided button colour and triggers a palette cycle
const ColourCycleButton = ({ buttonColor, onCycle }) => {
  return (
    <button
      onClick={onCycle}
      className="colourCycleBtn"
      style={{
        backgroundColor: buttonColor,
      }}
    >
      Click me
    </button>
  );
};

function App() {
  // Array of colour palettes
  const palettes = [
    { 
      button: "#E6F14A", 
      gradient: ["#595F72", "#575D90", "#84A07C", "#C3D350", "#E6F14A"] 
    },
    { 
      button: "#FF928B", 
      gradient: ["#FFAC81", "#FF928B", "#FEC3A6", "#EFE9AE", "#CDEAC0"] 
    },
    { 
      button: "#5863F8", 
      gradient: ["#16BAC5", "#5FBFF9", "#EFE9F4", "#F6FEAA", "#5863F8"] 
    },
    { 
      button: "#FCD757", 
      gradient: ["#DF9A57", "#FC7A57", "#FCD757", "#EEFC57", "#41521F"] 
    },
    { 
      button: "#A76571", 
      gradient: ["#D8DCFF", "#AEADF0", "#C38D94", "#A76571", "#565676"] 
    }
  ];

  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);
  const currentPalette = palettes[currentPaletteIndex];

  // When the button is clicked, cycle to the next palette.
  const cyclePalette = () => {
    setCurrentPaletteIndex((prevIndex) => (prevIndex + 1) % palettes.length);
  };

  return (
    <div
      className="App"
      style={{
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* 
        The moving gradient background which changes the colour 
        palette as the button colour changes 
      */}
      <ColourGradient
        dominantColors={currentPalette.gradient}
        visible={true}
        transitionStarted={false}
        backgroundColor={currentPalette.gradient[0]}
        onLoad={() => {}}
        isWideScreen={window.innerWidth > 768}
        page="app"
      />

      {/* FilmGrain overlay */}
      <FilmGrain />

      <div className="colourContainer">
        <div className="colourContainerTop">
          I have used some design principles I developed at my e-commerce startup, taizte.com
        </div>
        <ColourCycleButton buttonColor={currentPalette.button} onCycle={cyclePalette} />
      </div>
    </div>
  );
}

export default App;
