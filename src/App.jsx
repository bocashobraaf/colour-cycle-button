import React, { useState } from 'react';
import './App.css';
import ColourGradient from './ColourGradient';
import FilmGrain from './FilmGrain';

// React functional button component that cycles through an array of colours passed as a prop.
const ColourCycleButton = ({ colors, onColorChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % colors.length;
    setCurrentIndex(nextIndex);
    // Notify parent of the new index/color if a callback is provided
    if (onColorChange) {
      onColorChange(colors[nextIndex], nextIndex);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="colourCycleBtn"
      style={{ backgroundColor: colors[currentIndex] }}
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

  // We use the button colour index to choose the current palette for the gradient background.
  const [currentPaletteIndex, setCurrentPaletteIndex] = useState(0);
  const currentPalette = palettes[currentPaletteIndex];

  // Callback to update the current palette index when the button cycles colours.
  const handleColorChange = (newColor, newIndex) => {
    setCurrentPaletteIndex(newIndex);
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
        The moving gradient background changes as the button's colour (and palette) changes 
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
        {/* 
          Pass the array of button colours extracted from the palettes 
          to the ColourCycleButton as required.
        */}
        <ColourCycleButton
          colors={palettes.map(palette => palette.button)}
          onColorChange={handleColorChange}
        />
      </div>
    </div>
  );
}

export default App;
